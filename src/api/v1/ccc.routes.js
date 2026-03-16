'use strict';
const router = require('express').Router();
const { supabase } = require('../../config/supabase');
const { requireAuth } = require('../../middleware/auth');

async function getScoreRules(editionId) {
    const { data: base } = await supabase.from('ccc_score_rules').select('*').eq('edition_id', editionId).maybeSingle();
    const { data: pos } = await supabase.from('ccc_score_position_rules').select('position,points').eq('edition_id', editionId);
    const posMap = {};
    (pos || []).forEach(p => { posMap[p.position] = Number(p.points); });
    return { points_per_kill: base != null ? Number(base.points_per_kill) : 1, points_per_win: base != null ? Number(base.points_per_win) : 5, posMap };
}

function calcPoints(rules, position, kills, isWinner) {
    return (rules.posMap[position] || 0) + (kills * rules.points_per_kill) + (isWinner ? rules.points_per_win : 0);
}

async function getGroupStandings(groupId) {
    const { data: pg } = await supabase.from('ccc_player_group')
        .select('player_id, ccc_players(id,nickname,is_disqualified,is_eliminated,twitch_url,youtube_url)').eq('group_id', groupId);
    // Two-step query: first get match IDs for this group, then get results for those matches only
    const { data: groupMatches } = await supabase.from('ccc_matches').select('id').eq('group_id', groupId);
    const matchIds = (groupMatches || []).map(m => m.id);
    const results = matchIds.length > 0
        ? (await supabase.from('ccc_match_results').select('player_id,points_earned,kills,is_winner').in('match_id', matchIds)).data || []
        : [];
    const s = {};
    for (const row of (pg || [])) {
        const p = row.ccc_players; if (!p) continue;
        s[p.id] = { playerId: p.id, nickname: p.nickname, isDisqualified: p.is_disqualified, isEliminated: p.is_eliminated, twitchUrl: p.twitch_url, youtubeUrl: p.youtube_url, totalPoints: 0, totalKills: 0, wins: 0, matches: 0 };
    }
    for (const r of (results || [])) {
        if (s[r.player_id]) { s[r.player_id].totalPoints += Number(r.points_earned)||0; s[r.player_id].totalKills += r.kills||0; if (r.is_winner) s[r.player_id].wins++; s[r.player_id].matches++; }
    }
    return Object.values(s).sort((a, b) => b.totalPoints - a.totalPoints);
}
// PUBLIC
router.get('/status', async (req, res) => {
    try { const { data } = await supabase.from('ccc_editions').select('id').eq('is_active', true).limit(1); res.json({ hasActive: !!(data && data.length > 0) }); } catch (e) { console.error('[CCC status]', e); res.status(500).json({ error: 'Errore status CCC' }); }
});
router.get('/public', async (req, res) => {
    try {
        const [{ data: ed }, { data: settings }] = await Promise.all([
            supabase.from('ccc_editions').select('id,name,description,is_completed,winner_player_id').eq('is_active', true).maybeSingle(),
            supabase.from('ccc_settings').select('stream_url').limit(1).maybeSingle()
        ]);
        if (!ed) return res.json({ edition: null });

        const [{ data: phases }, { data: players }] = await Promise.all([
            supabase.from('ccc_phases').select('*').eq('edition_id', ed.id).order('phase_order'),
            supabase.from('ccc_players').select('id,nickname,twitch_url,youtube_url,is_disqualified').eq('edition_id', ed.id)
        ]);
        const phaseIds = (phases || []).map(p => p.id);
        if (!phaseIds.length) return res.json({ edition: { ...ed, winnerNickname: null }, phases: [], players: players || [], streamUrl: settings?.stream_url || null });

        const [{ data: allGroups }, { data: allPP }, winnerRes] = await Promise.all([
            supabase.from('ccc_groups').select('id,group_number,phase_id').in('phase_id', phaseIds).order('group_number'),
            supabase.from('ccc_phase_prizepool').select('position,prize,phase_id').in('phase_id', phaseIds).order('position'),
            ed.winner_player_id ? supabase.from('ccc_players').select('nickname').eq('id', ed.winner_player_id).maybeSingle() : Promise.resolve({ data: null })
        ]);
        const groupIds = (allGroups || []).map(g => g.id);
        const winnerNickname = winnerRes.data?.nickname || null;

        const [matchesRes, pgRes] = groupIds.length > 0
            ? await Promise.all([
                supabase.from('ccc_matches').select('id,name,played_at,group_id,ccc_match_results(player_id,position,kills,points_earned,is_winner)').in('group_id', groupIds).order('played_at'),
                supabase.from('ccc_player_group').select('player_id,group_id,ccc_players(id,nickname,is_disqualified,is_eliminated,twitch_url,youtube_url)').in('group_id', groupIds)
            ])
            : [{ data: [] }, { data: [] }];
        const allMatches = matchesRes.data || [];
        const allPG = pgRes.data || [];

        const matchIds = allMatches.map(m => m.id);
        const { data: allResults } = matchIds.length > 0
            ? await supabase.from('ccc_match_results').select('match_id,player_id,points_earned,kills,is_winner').in('match_id', matchIds)
            : { data: [] };

        const pgByGroup = {};
        for (const row of allPG) { if (!pgByGroup[row.group_id]) pgByGroup[row.group_id] = []; pgByGroup[row.group_id].push(row); }
        const matchGroupMap = {};
        for (const m of allMatches) matchGroupMap[m.id] = m.group_id;
        const resultsByGroup = {};
        for (const r of (allResults || [])) { const gid = matchGroupMap[r.match_id]; if (!gid) continue; if (!resultsByGroup[gid]) resultsByGroup[gid] = []; resultsByGroup[gid].push(r); }
        const matchesByGroup = {};
        for (const m of allMatches) { if (!matchesByGroup[m.group_id]) matchesByGroup[m.group_id] = []; matchesByGroup[m.group_id].push(m); }
        const ppByPhase = {};
        for (const row of (allPP || [])) { if (!ppByPhase[row.phase_id]) ppByPhase[row.phase_id] = {}; ppByPhase[row.phase_id][row.position] = row.prize; }

        function buildStandingsLocal(groupId) {
            const s = {};
            for (const row of (pgByGroup[groupId] || [])) {
                const p = row.ccc_players; if (!p) continue;
                s[p.id] = { playerId: p.id, nickname: p.nickname, isDisqualified: p.is_disqualified, isEliminated: p.is_eliminated, twitchUrl: p.twitch_url, youtubeUrl: p.youtube_url, totalPoints: 0, totalKills: 0, wins: 0, matches: 0 };
            }
            for (const r of (resultsByGroup[groupId] || [])) {
                if (s[r.player_id]) { s[r.player_id].totalPoints += Number(r.points_earned)||0; s[r.player_id].totalKills += r.kills||0; if (r.is_winner) s[r.player_id].wins++; s[r.player_id].matches++; }
            }
            return Object.values(s).sort((a, b) => b.totalPoints - a.totalPoints);
        }

        const phasesData = (phases || []).map(phase => {
            const groups = (allGroups || []).filter(g => g.phase_id === phase.id).map(g => ({
                ...g, standings: buildStandingsLocal(g.id), matches: (matchesByGroup[g.id] || [])
            }));
            return { ...phase, groups, prizepool_map: ppByPhase[phase.id] || {}, prizepool_entries: (allPP || []).filter(r => r.phase_id === phase.id) };
        });

        res.json({ edition: { ...ed, winnerNickname }, phases: phasesData, players: players || [], streamUrl: settings?.stream_url || null });
    } catch (e) { console.error('[CCC public]', e); res.status(500).json({ error: 'Errore dati CCC' }); }
});
router.get('/history', async (req, res) => {
    try {
        const { data: editions } = await supabase.from('ccc_editions').select('id,name,description,is_completed,winner_player_id,created_at').eq('is_completed', true).order('created_at', { ascending: false });
        const result = [];
        for (const ed of (editions || [])) {
            let winnerNickname = null;
            if (ed.winner_player_id) { const { data: w } = await supabase.from('ccc_players').select('nickname').eq('id', ed.winner_player_id).maybeSingle(); winnerNickname = w?.nickname; }
            const { data: phases } = await supabase.from('ccc_phases').select('*').eq('edition_id', ed.id).order('phase_order');
            const phasesData = [];
            for (const phase of (phases || [])) {
                const { data: groups } = await supabase.from('ccc_groups').select('id,group_number').eq('phase_id', phase.id).order('group_number');
                const gd = []; for (const g of (groups || [])) gd.push({ ...g, standings: await getGroupStandings(g.id) });
                phasesData.push({ ...phase, groups: gd });
            }
            result.push({ ...ed, winnerNickname, phases: phasesData });
        }
        res.json(result);
    } catch (e) { console.error('[CCC history]', e); res.status(500).json({ error: 'Errore storico CCC' }); }
});
// ADMIN: SETTINGS
router.get('/settings', requireAuth, async (req, res) => {
    try { const { data } = await supabase.from('ccc_settings').select('*').limit(1).maybeSingle(); res.json(data || { stream_url: '' }); } catch (e) { console.error('[CCC settings GET]', e); res.status(500).json({ error: 'Errore lettura settings' }); }
});
router.put('/settings', requireAuth, async (req, res) => {
    try {
        const { stream_url } = req.body;
        const { data: ex } = await supabase.from('ccc_settings').select('id').limit(1).maybeSingle();
        let result;
        if (ex) { ({ data: result } = await supabase.from('ccc_settings').update({ stream_url: stream_url || '' }).eq('id', ex.id).select().single()); }
        else { ({ data: result } = await supabase.from('ccc_settings').insert({ stream_url: stream_url || '' }).select().single()); }
        res.json(result);
    } catch (e) { console.error('[CCC settings PUT]', e); res.status(500).json({ error: 'Errore salvataggio settings' }); }
});
// ADMIN: EDITIONS
router.get('/editions', requireAuth, async (req, res) => {
    try { const { data } = await supabase.from('ccc_editions').select('*').order('created_at', { ascending: false }); res.json(data || []); } catch (e) { console.error('[CCC editions GET]', e); res.status(500).json({ error: 'Errore lettura edizioni' }); }
});
router.post('/editions', requireAuth, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Nome edizione obbligatorio' });
        const { data, error } = await supabase.from('ccc_editions').insert({ name: name.trim(), description: description || '', is_active: false, is_completed: false }).select().single();
        if (error) throw error;
        // Auto-inserisce regole punteggio predefinite
        await supabase.from('ccc_score_rules').insert({ edition_id: data.id, points_per_kill: 1, points_per_win: 5 }).select();
        await supabase.from('ccc_score_position_rules').insert([
            { edition_id: data.id, position: 1, points: 10 },
            { edition_id: data.id, position: 2, points: 7 },
            { edition_id: data.id, position: 3, points: 5 }
        ]);
        res.status(201).json(data);
    } catch (e) { console.error('[CCC edition POST]', e); res.status(500).json({ error: 'Errore creazione edizione' }); }
});
router.put('/editions/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, description, is_active, is_completed, winner_player_id } = req.body;
        const u = {};
        if (name !== undefined) u.name = name; if (description !== undefined) u.description = description;
        if (is_active !== undefined) u.is_active = is_active; if (is_completed !== undefined) u.is_completed = is_completed;
        if (winner_player_id !== undefined) u.winner_player_id = winner_player_id || null;
        const { data, error } = await supabase.from('ccc_editions').update(u).eq('id', id).select().single();
        if (error) throw error; res.json(data);
    } catch (e) { console.error('[CCC edition PUT]', e); res.status(500).json({ error: 'Errore modifica edizione' }); }
});
// ADMIN: SCORE RULES
router.get('/editions/:id/score-rules', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { data: base } = await supabase.from('ccc_score_rules').select('*').eq('edition_id', id).maybeSingle();
        const { data: pos } = await supabase.from('ccc_score_position_rules').select('*').eq('edition_id', id).order('position');
        res.json({ base: base || { points_per_kill: 1, points_per_win: 5 }, positions: pos || [] });
    } catch (e) { console.error('[CCC score-rules GET]', e); res.status(500).json({ error: 'Errore lettura regole punteggio' }); }
});
router.put('/editions/:id/score-rules', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { points_per_kill, points_per_win, positions } = req.body;
        const { data: ex } = await supabase.from('ccc_score_rules').select('id').eq('edition_id', id).maybeSingle();
        if (ex) { await supabase.from('ccc_score_rules').update({ points_per_kill, points_per_win }).eq('id', ex.id); }
        else { await supabase.from('ccc_score_rules').insert({ edition_id: id, points_per_kill, points_per_win }); }
        await supabase.from('ccc_score_position_rules').delete().eq('edition_id', id);
        if (positions && positions.length > 0) {
            const rows = positions.filter(p => p.position > 0).map(p => ({ edition_id: id, position: Number(p.position), points: Number(p.points) }));
            if (rows.length > 0) await supabase.from('ccc_score_position_rules').insert(rows);
        }
        res.json({ success: true });
    } catch (e) { console.error('[CCC score-rules PUT]', e); res.status(500).json({ error: 'Errore salvataggio regole punteggio' }); }
});
// ADMIN: PHASES
router.get('/editions/:id/phases', requireAuth, async (req, res) => {
    try {
        const edition_id = parseInt(req.params.id);
        const { data: phases } = await supabase.from('ccc_phases').select('*').eq('edition_id', edition_id).order('phase_order');
        const result = [];
        for (const phase of (phases || [])) {
            const { data: groups } = await supabase.from('ccc_groups').select('id,group_number').eq('phase_id', phase.id).order('group_number');
            result.push({ ...phase, groups: groups || [] });
        }
        res.json(result);
    } catch (e) { console.error('[CCC phases GET]', e); res.status(500).json({ error: 'Errore lettura fasi' }); }
});
router.post('/editions/:id/phases', requireAuth, async (req, res) => {
    try {
        const edition_id = parseInt(req.params.id);
        const { type, top_n, prizepool, start_datetime, end_datetime, groups_count } = req.body;
        if (!['girone','semifinale','finale'].includes(type)) return res.status(400).json({ error: 'Tipo fase non valido' });
        const { data: last } = await supabase.from('ccc_phases').select('phase_order').eq('edition_id', edition_id).order('phase_order', { ascending: false }).limit(1);
        const nextOrder = (last && last.length > 0) ? last[0].phase_order + 1 : 1;
        const { data: phase, error } = await supabase.from('ccc_phases').insert({ edition_id, type, phase_order: nextOrder, top_n: top_n || 1, prizepool: prizepool || '', start_datetime: start_datetime || null, end_datetime: end_datetime || null, is_active: false }).select().single();
        if (error) throw error;
        const gc = parseInt(groups_count) || 1;
        if (gc > 0) await supabase.from('ccc_groups').insert(Array.from({ length: gc }, (_, i) => ({ phase_id: phase.id, group_number: i + 1 })));
        res.status(201).json(phase);
    } catch (e) { console.error('[CCC phase POST]', e); res.status(500).json({ error: 'Errore creazione fase' }); }
});
router.put('/phases/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { top_n, prizepool, start_datetime, end_datetime, is_active } = req.body;
        const u = {};
        if (top_n !== undefined) u.top_n = top_n; if (prizepool !== undefined) u.prizepool = prizepool;
        if (start_datetime !== undefined) u.start_datetime = start_datetime || null; if (end_datetime !== undefined) u.end_datetime = end_datetime || null;
        if (is_active !== undefined) u.is_active = is_active;
        const { data, error } = await supabase.from('ccc_phases').update(u).eq('id', id).select().single();
        if (error) throw error; res.json(data);
    } catch (e) { console.error('[CCC phase PUT]', e); res.status(500).json({ error: 'Errore modifica fase' }); }
});
router.post('/phases/:id/groups', requireAuth, async (req, res) => {
    try {
        const phase_id = parseInt(req.params.id);
        const { data: last } = await supabase.from('ccc_groups').select('group_number').eq('phase_id', phase_id).order('group_number', { ascending: false }).limit(1);
        const nextNum = (last && last.length > 0) ? last[0].group_number + 1 : 1;
        const { data, error } = await supabase.from('ccc_groups').insert({ phase_id, group_number: nextNum }).select().single();
        if (error) throw error; res.status(201).json(data);
    } catch (e) { console.error('[CCC group POST]', e); res.status(500).json({ error: 'Errore creazione gruppo' }); }
});
// ADMIN: PLAYERS
router.get('/editions/:id/players', requireAuth, async (req, res) => {
    try {
        const edition_id = parseInt(req.params.id);
        const { data } = await supabase.from('ccc_players').select('*, ccc_player_group(group_id, ccc_groups(id,group_number,phase_id,ccc_phases(type,phase_order)))').eq('edition_id', edition_id).order('nickname');
        res.json(data || []);
    } catch (e) { console.error('[CCC players GET]', e); res.status(500).json({ error: 'Errore lettura player' }); }
});
router.post('/editions/:id/players/import', requireAuth, async (req, res) => {
    try {
        const edition_id = parseInt(req.params.id);
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Testo mancante' });
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return res.status(400).json({ error: 'Nessun player valido' });
        const { data, error } = await supabase.from('ccc_players').insert(lines.map(nickname => ({ edition_id, nickname, is_disqualified: false, is_eliminated: false }))).select();
        if (error) throw error; res.status(201).json(data);
    } catch (e) { console.error('[CCC import POST]', e); res.status(500).json({ error: 'Errore importazione player' }); }
});
router.put('/players/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nickname, twitch_url, youtube_url, is_disqualified, is_eliminated } = req.body;
        const u = {};
        if (nickname !== undefined) u.nickname = nickname; if (twitch_url !== undefined) u.twitch_url = twitch_url;
        if (youtube_url !== undefined) u.youtube_url = youtube_url; if (is_disqualified !== undefined) u.is_disqualified = is_disqualified;
        if (is_eliminated !== undefined) u.is_eliminated = is_eliminated;
        const { data, error } = await supabase.from('ccc_players').update(u).eq('id', id).select().single();
        if (error) throw error; res.json(data);
    } catch (e) { console.error('[CCC player PUT]', e); res.status(500).json({ error: 'Errore modifica player' }); }
});
router.delete('/players/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await supabase.from('ccc_player_group').delete().eq('player_id', id);
        await supabase.from('ccc_match_results').delete().eq('player_id', id);
        const { error } = await supabase.from('ccc_players').delete().eq('id', id);
        if (error) throw error; res.json({ success: true });
    } catch (e) { console.error('[CCC player DELETE]', e); res.status(500).json({ error: 'Errore eliminazione player' }); }
});
// ADMIN: GROUPS
router.get('/groups/:id', requireAuth, async (req, res) => {
    try {
        const group_id = parseInt(req.params.id);
        const { data: group } = await supabase.from('ccc_groups').select('*, ccc_phases(id,edition_id,type,phase_order,top_n)').eq('id', group_id).maybeSingle();
        if (!group) return res.status(404).json({ error: 'Gruppo non trovato' });
        const standings = await getGroupStandings(group_id);
        const { data: matches } = await supabase.from('ccc_matches').select('*, ccc_match_results(*, ccc_players(nickname))').eq('group_id', group_id).order('played_at');
        let prizepool_map = {};
        if (group.ccc_phases?.id) {
            const { data: pp } = await supabase.from('ccc_phase_prizepool').select('position,prize').eq('phase_id', group.ccc_phases.id).order('position');
            (pp || []).forEach(p => { prizepool_map[p.position] = p.prize; });
        }
        res.json({ ...group, standings, matches: matches || [], prizepool_map });
    } catch (e) { console.error('[CCC group GET]', e); res.status(500).json({ error: 'Errore lettura gruppo' }); }
});
router.post('/groups/:id/players', requireAuth, async (req, res) => {
    try {
        const group_id = parseInt(req.params.id);
        const { player_id } = req.body;
        if (!player_id) return res.status(400).json({ error: 'player_id mancante' });
        const { data: grp } = await supabase.from('ccc_groups').select('phase_id').eq('id', group_id).maybeSingle();
        if (grp) {
            const { data: siblings } = await supabase.from('ccc_groups').select('id').eq('phase_id', grp.phase_id);
            const ids = (siblings || []).map(g => g.id);
            if (ids.length > 0) await supabase.from('ccc_player_group').delete().eq('player_id', player_id).in('group_id', ids);
        }
        const { data, error } = await supabase.from('ccc_player_group').insert({ player_id, group_id }).select().single();
        if (error) throw error; res.status(201).json(data);
    } catch (e) { console.error('[CCC group player POST]', e); res.status(500).json({ error: 'Errore assegnazione player' }); }
});
router.delete('/groups/:id/players/:playerId', requireAuth, async (req, res) => {
    try {
        const { error } = await supabase.from('ccc_player_group').delete().eq('group_id', parseInt(req.params.id)).eq('player_id', parseInt(req.params.playerId));
        if (error) throw error; res.json({ success: true });
    } catch (e) { console.error('[CCC group player DELETE]', e); res.status(500).json({ error: 'Errore rimozione player' }); }
});
// Unassign player from all groups of a specific phase
router.delete('/phases/:phaseId/players/:playerId', requireAuth, async (req, res) => {
    try {
        const phaseId = parseInt(req.params.phaseId);
        const playerId = parseInt(req.params.playerId);
        const { data: groups } = await supabase.from('ccc_groups').select('id').eq('phase_id', phaseId);
        const ids = (groups || []).map(g => g.id);
        if (ids.length > 0) await supabase.from('ccc_player_group').delete().eq('player_id', playerId).in('group_id', ids);
        res.json({ success: true });
    } catch (e) { console.error('[CCC phase player DELETE]', e); res.status(500).json({ error: 'Errore rimozione player da fase' }); }
});
// ADMIN: MATCHES
router.post('/groups/:id/matches', requireAuth, async (req, res) => {
    try {
        const group_id = parseInt(req.params.id);
        const { name, notes, results, played_at } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Nome match obbligatorio' });
        if (!results || !results.length) return res.status(400).json({ error: 'Risultati mancanti' });
        const { data: grp } = await supabase.from('ccc_groups').select('ccc_phases(edition_id)').eq('id', group_id).maybeSingle();
        const editionId = grp && grp.ccc_phases && grp.ccc_phases.edition_id;
        if (!editionId) return res.status(400).json({ error: 'Edizione non trovata' });
        const rules = await getScoreRules(editionId);
        const { data: match, error: mErr } = await supabase.from('ccc_matches').insert({ group_id, name: name.trim(), notes: notes || '', played_at: played_at ? new Date(played_at).toISOString() : new Date().toISOString() }).select().single();
        if (mErr) throw mErr;
        const minPos = Math.min(...results.map(r => parseInt(r.position)));
        const rows = results.map(r => { const pos = parseInt(r.position); const isWinner = pos === minPos; return { match_id: match.id, player_id: r.player_id, position: pos, kills: parseInt(r.kills)||0, is_winner: isWinner, points_earned: calcPoints(rules, pos, parseInt(r.kills)||0, isWinner) }; });
        const { data: savedResults, error: rErr } = await supabase.from('ccc_match_results').insert(rows).select();
        if (rErr) throw rErr;
        res.status(201).json({ match, results: savedResults });
    } catch (e) { console.error('[CCC match]', e); res.status(500).json({ error: 'Errore creazione match' }); }
});
router.put('/matches/:id', requireAuth, async (req, res) => {
    try {
        const match_id = parseInt(req.params.id);
        const { name, notes, results } = req.body;
        const u = {};
        if (name !== undefined) u.name = name; if (notes !== undefined) u.notes = notes;
        if (req.body.played_at !== undefined) u.played_at = req.body.played_at ? new Date(req.body.played_at).toISOString() : new Date().toISOString();
        if (Object.keys(u).length > 0) await supabase.from('ccc_matches').update(u).eq('id', match_id);
        if (results && results.length > 0) {
            const { data: match } = await supabase.from('ccc_matches').select('group_id,ccc_groups(ccc_phases(edition_id))').eq('id', match_id).maybeSingle();
            const editionId = match && match.ccc_groups && match.ccc_groups.ccc_phases && match.ccc_groups.ccc_phases.edition_id;
            const rules = await getScoreRules(editionId);
            await supabase.from('ccc_match_results').delete().eq('match_id', match_id);
            const minPos = Math.min(...results.map(r => parseInt(r.position)));
            const rows = results.map(r => { const pos = parseInt(r.position); const isWinner = pos === minPos; return { match_id, player_id: r.player_id, position: pos, kills: parseInt(r.kills)||0, is_winner: isWinner, points_earned: calcPoints(rules, pos, parseInt(r.kills)||0, isWinner) }; });
            await supabase.from('ccc_match_results').insert(rows);
        }
        res.json({ success: true });
    } catch (e) { console.error('[CCC match PUT]', e); res.status(500).json({ error: 'Errore modifica match' }); }
});


// DELETE: fase
router.delete('/phases/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { error } = await supabase.from('ccc_phases').delete().eq('id', id);
        if (error) throw error; res.json({ success: true });
    } catch (e) { console.error('[CCC phase DELETE]', e); res.status(500).json({ error: 'Errore eliminazione fase' }); }
});
// DELETE: gruppo
router.delete('/groups/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { error } = await supabase.from('ccc_groups').delete().eq('id', id);
        if (error) throw error; res.json({ success: true });
    } catch (e) { console.error('[CCC group DELETE]', e); res.status(500).json({ error: 'Errore eliminazione gruppo' }); }
});
// DELETE: match
router.delete('/matches/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { error } = await supabase.from('ccc_matches').delete().eq('id', id);
        if (error) throw error; res.json({ success: true });
    } catch (e) { console.error('[CCC match DELETE]', e); res.status(500).json({ error: 'Errore eliminazione match' }); }
});


// ADMIN: ricalcola punti tutti i match
router.post('/editions/:id/recalculate', requireAuth, async (req, res) => {
    try {
        const editionId = parseInt(req.params.id);
        const rules = await getScoreRules(editionId);
        const { data: phases } = await supabase.from('ccc_phases').select('id').eq('edition_id', editionId);
        const phaseIds = (phases || []).map(p => p.id);
        if (!phaseIds.length) return res.json({ updated: 0 });
        const { data: groups } = await supabase.from('ccc_groups').select('id').in('phase_id', phaseIds);
        const groupIds = (groups || []).map(g => g.id);
        if (!groupIds.length) return res.json({ updated: 0 });
        const { data: matches } = await supabase.from('ccc_matches').select('id').in('group_id', groupIds);
        const matchIds = (matches || []).map(m => m.id);
        if (!matchIds.length) return res.json({ updated: 0 });
        let updated = 0;
        for (const matchId of matchIds) {
            const { data: results } = await supabase.from('ccc_match_results').select('*').eq('match_id', matchId);
            if (!results || !results.length) continue;
            const minPos = Math.min(...results.map(r => parseInt(r.position)));
            for (const r of results) {
                const pos = parseInt(r.position);
                const isWinner = pos === minPos;
                const points = calcPoints(rules, pos, r.kills || 0, isWinner);
                await supabase.from('ccc_match_results').update({ points_earned: points, is_winner: isWinner }).eq('id', r.id);
                updated++;
            }
        }
        res.json({ updated });
    } catch (e) { console.error('[CCC recalculate]', e); res.status(500).json({ error: 'Errore ricalcolo' }); }
});


// ADMIN: prizepool per fase (solo finale)
router.get('/phases/:id/prizepool', requireAuth, async (req, res) => {
    try {
        const { data } = await supabase.from('ccc_phase_prizepool').select('position,prize').eq('phase_id', parseInt(req.params.id)).order('position');
        res.json(data || []);
    } catch (e) { console.error('[CCC prizepool GET]', e); res.status(500).json({ error: 'Errore lettura prizepool' }); }
});
router.put('/phases/:id/prizepool', requireAuth, async (req, res) => {
    try {
        const phase_id = parseInt(req.params.id);
        const { entries } = req.body;
        await supabase.from('ccc_phase_prizepool').delete().eq('phase_id', phase_id);
        if (entries && entries.length > 0) {
            const rows = entries.filter(e => e.position > 0 && e.prize && e.prize.trim()).map(e => ({ phase_id, position: parseInt(e.position), prize: e.prize.trim() }));
            if (rows.length > 0) await supabase.from('ccc_phase_prizepool').insert(rows);
        }
        res.json({ success: true });
    } catch (e) { console.error('[CCC prizepool PUT]', e); res.status(500).json({ error: 'Errore salvataggio prizepool' }); }
});

module.exports = router;
