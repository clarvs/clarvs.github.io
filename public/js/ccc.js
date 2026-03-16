// ccc.js - Pagina pubblica Clarvs Champions Cup
(function() {
    const root = document.getElementById('ccc-root');
    var _playerStatsMap = {};


    function fmt(dt) {
        if (!dt) return '';
        try { return new Date(dt).toLocaleString('it-IT', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
        catch(e) { return dt; }
    }
    function phaseLabel(type, order) {
        if (type === 'girone') return 'Girone ' + order;
        if (type === 'semifinale') return 'Semifinale ' + order;
        return 'Finale';
    }
    function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function extractTwitch(url) { if (!url) return null; const m = url.match(/twitch\.tv\/([^/?#\s]+)/i); return m ? m[1] : null; }
    function buildPlayerStats(phases) {
        _playerStatsMap = {};
        (phases||[]).forEach(function(phase) {
            var plabel = phaseLabel(phase.type, phase.phase_order);
            (phase.groups||[]).forEach(function(g) {
                var gm = g.matches || [];
                (g.standings||[]).forEach(function(p) {
                    if (!_playerStatsMap[p.playerId]) _playerStatsMap[p.playerId] = { nickname: p.nickname, entries: [] };
                    gm.forEach(function(m) {
                        var r = (m.ccc_match_results||[]).find(function(r){ return r.player_id === p.playerId; });
                        if (r) _playerStatsMap[p.playerId].entries.push({ phase: plabel, group: 'Girone ' + g.group_number, matchName: m.name, position: r.position, kills: r.kills, points: r.points_earned, isWinner: r.is_winner });
                    });
                });
            });
        });
    }
    window.showCccPlayerModal = function(playerId, filterPhase) {
        var data = _playerStatsMap[playerId];
        if (!data) return;
        var existing = document.getElementById('ccc-player-modal');
        if (existing) existing.remove();
        var entries = filterPhase ? data.entries.filter(function(e){ return e.phase === filterPhase; }) : data.entries;
        var rows = entries.length === 0
            ? '<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,0.3);padding:1rem;">Nessuna partita.</td></tr>'
            : entries.map(function(e) {
                return '<tr>'
                    + '<td style="color:rgba(255,255,255,0.6);font-size:0.82rem">' + escHtml(e.matchName) + '</td>'
                    + '<td style="text-align:center">' + e.position + (e.isWinner ? ' <i class="fas fa-crown" style="color:#f59e0b;font-size:0.65rem"></i>' : '') + '</td>'
                    + '<td style="text-align:center;color:rgba(255,255,255,0.5)">' + e.kills + '</td>'
                    + '<td style="text-align:center;color:#00bcd4;font-weight:600">' + (e.points||0) + '</td>'
                    + '</tr>';
            }).join('');
        var modal = document.createElement('div');
        modal.id = 'ccc-player-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px);';
        modal.innerHTML = '<div style="background:#0d1117;border:1px solid rgba(255,255,255,0.1);border-radius:14px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.08);">'
            + '<h3 style="margin:0;font-size:1.05rem;"><i class="fas fa-user" style="margin-right:0.5rem;opacity:0.5"></i>' + escHtml(data.nickname) + '</h3>'
            + '<button onclick="document.getElementById(&#39;ccc-player-modal&#39;).remove()" style="background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:1.5rem;line-height:1;padding:0;">&times;</button>'
            + '</div>'
            + '<div style="padding:1.25rem 1.5rem;">'
            + '<table class="ccc-standings-table" style="width:100%"><thead><tr><th style="text-align:left">Match</th><th>#</th><th>K</th><th>Pts</th></tr></thead><tbody>' + rows + '</tbody></table>'
            + '</div>'
            + '</div>';
        modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
        document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){ modal.remove(); document.removeEventListener('keydown',esc); } });
        document.body.appendChild(modal);
    };
    function renderStandings(standings, topN, prizepoolMap, curPhaseLabel) {
        if (!standings || standings.length === 0) return '<p style="color:rgba(255,255,255,0.3);font-size:0.8rem;padding:0.5rem;">Nessun risultato ancora.</p>';
        var hasPrize = prizepoolMap && Object.keys(prizepoolMap).length > 0;
        var h = '<table class="ccc-standings-table"><thead><tr><th>#</th><th>Player</th><th>Pts</th><th>Kill</th><th>Win</th>' + (hasPrize ? '<th style="color:#f59e0b;font-weight:700">€</th>' : '') + '</tr></thead><tbody>';
        standings.forEach(function(p, i) {
            var rank = i + 1;
            var rc = rank===1?'gold':rank===2?'silver':rank===3?'bronze':'';
            var q = topN && rank<=topN && !p.isDisqualified;
            var dq = p.isDisqualified ? ' disqualified' : '';
            h += '<tr class="' + dq + (q?' ccc-qualify-row':'') + '">';
            h += '<td class="rank-cell ' + rc + '">' + rank + '</td>';
            var phArg=curPhaseLabel?', \''+curPhaseLabel+'\'':'';
            h += '<td><button class="ccc-nick-btn" onclick="window.showCccPlayerModal(' + p.playerId + phArg + ')" style="background:none;border:none;color:inherit;cursor:pointer;padding:0;text-align:left;font:inherit;text-decoration:none;">' + escHtml(p.nickname) + (p.isDisqualified?' <span style="font-size:0.65rem;color:#ef4444">[DQ]</span>':'') + '</button></td>';
            h += '<td class="points-cell">' + (p.totalPoints||0) + '</td>';
            h += '<td style="color:rgba(255,255,255,0.5)">' + (p.totalKills||0) + '</td>';
            h += '<td style="color:rgba(255,255,255,0.5)">' + (p.wins||0) + '</td>';
            if (hasPrize) h += '<td style="color:#f59e0b;font-weight:700">' + (prizepoolMap[rank] ? '€' + prizepoolMap[rank] : '') + '</td>';
            h += '</tr>';
        });
        return h + '</tbody></table>';
    }
    function renderPhases(phases) {
        if (!phases || phases.length === 0) return '<p style="color:rgba(255,255,255,0.4);">Nessuna fase configurata.</p>';
        return phases.slice().sort(function(a,b){ return (b.is_active?1:0)-(a.is_active?1:0); }).map(function(phase) {
            var label = phaseLabel(phase.type, phase.phase_order);
            var badge = phase.is_active
                ? '<span class="ccc-phase-badge active"><i class="fas fa-circle" style="font-size:0.5rem"></i> IN CORSO</span>'
                : '<span class="ccc-phase-badge inactive">Conclusa</span>';
            var meta = '';
            if (phase.start_datetime) meta += '<span><i class="fas fa-calendar-alt"></i> ' + fmt(phase.start_datetime) + '</span>';
            if (phase.end_datetime) meta += '<span><i class="fas fa-clock"></i> Fine: ' + fmt(phase.end_datetime) + '</span>';
            if (phase.prizepool) meta += '<span><i class="fas fa-trophy"></i> ' + escHtml(phase.prizepool) + '</span>';
            if (phase.top_n) meta += '<span><i class="fas fa-arrow-up"></i> Top ' + phase.top_n + ' qualificati</span>';
            var groupsHtml = (phase.groups||[]).map(function(g) {
                return '<div class="ccc-group-card"><div class="ccc-group-title">Girone ' + g.group_number + '</div>' + renderStandings(g.standings, phase.top_n, phase.prizepool_map, label) + '</div>';
            }).join('');
            return '<div class="ccc-phase-card ' + (phase.is_active?'active':'') + '">' +
                '<div class="ccc-phase-header"><h3><i class="fas fa-layer-group"></i> ' + label + '</h3>' + badge + '</div>' +
                (meta ? '<div class="ccc-phase-meta">' + meta + '</div>' : '') +
                (groupsHtml ? '<div class="ccc-groups-grid">' + groupsHtml + '</div>' : '<p style="padding:1rem;color:rgba(255,255,255,0.3);font-size:0.85rem;">Nessun gruppo.</p>') +
                '</div>';
        }).join('');
    }
    function renderTVSection(streamUrl, players) {
        var hostname = window.location.hostname;
        var h = '<div class="ccc-tv-section">';
        if (streamUrl) {
            var twMain = extractTwitch(streamUrl);
            if (twMain) {
                h += '<div class="ccc-main-stream"><iframe src="https://player.twitch.tv/?channel=' + twMain + '&parent=' + hostname + '&autoplay=false" allowfullscreen></iframe></div>';
            } else if (streamUrl.indexOf('youtube') !== -1 || streamUrl.indexOf('youtu.be') !== -1) {
                var vm = streamUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (vm) h += '<div class="ccc-main-stream"><iframe src="https://www.youtube.com/embed/' + vm[1] + '?rel=0" allowfullscreen></iframe></div>';
            }
        }
        var twPlayers = (players||[]).filter(function(p){ return extractTwitch(p.twitch_url); });
        var ytPlayers = (players||[]).filter(function(p){ return !extractTwitch(p.twitch_url) && p.youtube_url; });
        if (twPlayers.length > 0 || ytPlayers.length > 0) {
            h += '<div class="ccc-player-streams">';
            twPlayers.forEach(function(p) {
                var ch = extractTwitch(p.twitch_url);
                h += '<div class="ccc-player-stream-card"><div class="stream-label"><i class="fab fa-twitch" style="color:#9146ff"></i> ' + escHtml(p.nickname) + '</div><div class="stream-embed"><iframe src="https://player.twitch.tv/?channel=' + ch + '&parent=' + hostname + '&autoplay=false" allowfullscreen></iframe></div></div>';
            });
            ytPlayers.forEach(function(p) {
                h += '<div class="ccc-player-stream-card"><div class="stream-label"><i class="fab fa-youtube" style="color:#ff0000"></i> ' + escHtml(p.nickname) + '</div><div class="stream-embed" style="display:flex;align-items:center;justify-content:center;"><a class="ccc-yt-link" href="' + escHtml(p.youtube_url) + '" target="_blank" rel="noopener"><i class="fab fa-youtube fa-2x"></i> Apri canale</a></div></div>';
            });
            h += '</div>';
        }
        return h + '</div>';
    }
    async function loadHistory() {
        try {
            var res = await fetch(API_BASE + '/api/ccc/history');
            var history = await res.json();
            if (!history || history.length === 0) return '';
            var h = '<div class="ccc-section"><div class="ccc-section-title"><i class="fas fa-history"></i> Storico Edizioni</div>';
            history.forEach(function(ed) {
                h += '<div class="ccc-history-item"><div class="ccc-history-header">';
                h += '<span class="ccc-history-name">' + escHtml(ed.name) + '</span>';
                if (ed.winnerNickname) h += '<span class="ccc-history-winner"><i class="fas fa-crown"></i> ' + escHtml(ed.winnerNickname) + '</span>';
                h += '</div>';
                if (ed.description) h += '<p style="color:rgba(255,255,255,0.45);font-size:0.85rem;margin:0 0 0.8rem;">' + escHtml(ed.description) + '</p>';
                if (ed.phases && ed.phases.length) h += '<div style="font-size:0.8rem;color:rgba(255,255,255,0.3);">' + ed.phases.map(function(p){ return phaseLabel(p.type, p.phase_order); }).join(' &#8594; ') + '</div>';
                h += '</div>';
            });
            return h + '</div>';
        } catch(e) { return ''; }
    }


    var _liveInterval = null;
    function _startLivePolling() {
        if (_liveInterval) return;
        _liveInterval = setInterval(async function() {
            try {
                var res = await fetch(API_BASE + '/api/ccc/public');
                var d = await res.json();
                if (!d.edition) { clearInterval(_liveInterval); _liveInterval = null; return; }
                buildPlayerStats(d.phases || []);
                var container = document.getElementById('ccc-phases-content');
                if (container) container.innerHTML = renderPhases(d.phases);
                var stillActive = d.phases && d.phases.some(function(p){ return p.is_active; });
                if (!stillActive) {
                    clearInterval(_liveInterval); _liveInterval = null;
                    var badge = document.querySelector('.ccc-live-badge');
                    if (badge) badge.remove();
                }
            } catch(e) {}
        }, 30000);
    }

    async function init() {
        try {
            var res = await fetch(API_BASE + '/api/ccc/public');
            var data = await res.json();
            if (!data.edition) {
                var isStaff = !!(window.authSystem && window.authSystem.isStaffLoggedIn()) ||
                    (function(){ try { return !!(JSON.parse(localStorage.getItem('clarvs_user'))); } catch(e) { return false; } })();
                if (isStaff) {
                    root.innerHTML = '<div style="text-align:center;padding:5rem 2rem;"><i class="fas fa-trophy" style="font-size:4rem;color:rgba(255,255,255,0.15);margin-bottom:1.5rem;display:block;"></i><h2 style="color:rgba(255,255,255,0.4);">Nessun torneo attivo</h2><p style="color:rgba(255,255,255,0.3);margin-bottom:1.5rem;">Crea e attiva un&#39;edizione dal pannello admin.</p><a href="/pages/admin.html" style="display:inline-block;padding:0.6rem 1.5rem;background:rgba(0,188,212,0.15);border:1px solid rgba(0,188,212,0.4);border-radius:8px;color:#00bcd4;text-decoration:none;font-size:0.9rem;"><i class="fas fa-cog"></i> Vai all&#39;admin</a></div>';
                } else {
                    root.innerHTML = '<div style="text-align:center;padding:5rem 2rem;"><i class="fas fa-lock" style="font-size:4rem;color:rgba(255,255,255,0.1);margin-bottom:1.5rem;display:block;"></i><h2 style="color:rgba(255,255,255,0.3);">Area riservata</h2><p style="color:rgba(255,255,255,0.2);margin-bottom:1.5rem;">Accedi come staff per entrare.</p><button onclick="if(window.authSystem){window.authSystem._showLoginModal();}" style="padding:0.6rem 1.5rem;background:rgba(0,188,212,0.15);border:1px solid rgba(0,188,212,0.4);border-radius:8px;color:#00bcd4;cursor:pointer;font-size:0.9rem;"><i class="fas fa-sign-in-alt"></i> Accedi</button></div>';
                }
                return;
            }
            buildPlayerStats(data.phases || []);
            var ed = data.edition;
            var h = '<div class="ccc-header"><h1><i class="fas fa-trophy"></i> CCC</h1>';
            h += '<p class="ccc-edition-name">' + escHtml(ed.name) + '</p>';
            if (ed.description) h += '<p class="ccc-description">' + escHtml(ed.description) + '</p>';
            if (ed.is_completed && ed.winnerNickname) h += '<div class="ccc-winner-badge"><i class="fas fa-crown"></i> Vincitore: ' + escHtml(ed.winnerNickname) + '</div>';
            h += '</div>';
            var hasActivePhase = data.phases && data.phases.some(function(p){ return p.is_active; });
            h += '<div class="ccc-section"><div class="ccc-section-title" style="display:flex;align-items:center;gap:0.75rem;"><span><i class="fas fa-layer-group"></i> Fasi del Torneo</span>' + (hasActivePhase ? '<span class="ccc-live-badge"><span class="ccc-live-dot"></span>LIVE</span>' : '') + '</div><div id="ccc-phases-content">' + renderPhases(data.phases) + '</div></div>';
            var hasTv = data.streamUrl || (data.players && data.players.some(function(p){ return p.twitch_url || p.youtube_url; }));
            if (hasTv) h += '<div class="ccc-section"><div class="ccc-section-title"><i class="fas fa-tv"></i> Live Stream</div>' + renderTVSection(data.streamUrl, data.players) + '</div>';
            h += await loadHistory();
            root.innerHTML = h;
            if (hasActivePhase) _startLivePolling();
        } catch(e) {
            root.innerHTML = '<div style="text-align:center;padding:3rem;color:rgba(255,255,255,0.4);">Errore caricamento CCC.</div>';
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
