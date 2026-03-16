'use strict';
const router = require('express').Router();
const { supabase } = require('../../config/supabase');
const { requireAuth } = require('../../middleware/auth');
const { auditLog } = require('../../middleware/audit');

async function readHomeContent() {
    const [newsRes, eventsRes, igRes, twRes] = await Promise.all([
        supabase.from('news').select('*').order('sort_order'),
        supabase.from('events').select('*').order('sort_order'),
        supabase.from('social_instagram').select('*').order('sort_order'),
        supabase.from('social_twitter').select('*').order('sort_order'),
    ]);
    return {
        news: (newsRes.data || []).map(r => ({ id: r.id, title: r.title, date: r.date, content: r.content, image: r.image })),
        events: (eventsRes.data || []).map(r => ({ id: r.id, title: r.title, date: r.date, time: r.time, type: r.type })),
        social: {
            instagram: (igRes.data || []).map(r => ({ id: r.id, permalink: r.permalink })),
            twitter: (twRes.data || []).map(r => ({ id: r.id, link: r.link, date: r.date }))
        }
    };
}

async function writeHomeContent(c) {
    // 1. Backup di tutte le tabelle prima di qualsiasi modifica
    const [newsBack, eventsBack, igBack, twBack] = await Promise.all([
        supabase.from('news').select('*'),
        supabase.from('events').select('*'),
        supabase.from('social_instagram').select('*'),
        supabase.from('social_twitter').select('*'),
    ]);
    const backups = {
        news: newsBack.data || [],
        events: eventsBack.data || [],
        social_instagram: igBack.data || [],
        social_twitter: twBack.data || [],
    };

    // 2. Rollback: ripristina le tabelle gia scritte in caso di errore
    async function rollback(completed) {
        for (const table of completed) {
            await supabase.from(table).delete().neq('id', 0);
            if (backups[table].length)
                await supabase.from(table).insert(backups[table]);
        }
    }

    const ops = [
        {
            table: 'news',
            rows: (c.news || []).map((n, i) => ({ title: n.title, date: n.date, content: n.content, image: n.image, sort_order: i })),
        },
        {
            table: 'events',
            rows: (c.events || []).map((e, i) => ({ title: e.title, date: e.date, time: e.time, type: e.type, sort_order: i })),
        },
        {
            table: 'social_instagram',
            rows: ((c.social && c.social.instagram) || []).map((s, i) => ({ permalink: s.permalink, sort_order: i })),
        },
        {
            table: 'social_twitter',
            rows: ((c.social && c.social.twitter) || []).map((s, i) => ({ link: s.link, date: s.date, sort_order: i })),
        },
    ];

    // 3. Esegui DELETE+INSERT sequenziale con rollback atomico su errore
    const completed = [];
    for (const { table, rows } of ops) {
        const { error: delError } = await supabase.from(table).delete().neq('id', 0);
        if (delError) {
            await rollback(completed);
            throw new Error('DELETE fallita su ' + table + ': ' + delError.message);
        }
        if (rows.length) {
            const { error: insError } = await supabase.from(table).insert(rows);
            if (insError) {
                completed.push(table); // tabella gia svuotata, includi nel rollback
                await rollback(completed);
                throw new Error('INSERT fallita su ' + table + ': ' + insError.message);
            }
        }
        completed.push(table);
    }
}

router.get('/home-content', async (req, res) => {
    try { res.json(await readHomeContent()); }
    catch (error) { res.status(500).json({ error: 'Errore lettura home content' }); }
});

router.put('/home-content', requireAuth, auditLog('home_content'), async (req, res) => {
    try { await writeHomeContent(req.body); res.json({ success: true }); }
    catch (error) { res.status(500).json({ error: error.message || 'Errore salvataggio home content' }); }
});

router.get('/links', async (req, res) => {
    try {
        const { data, error } = await supabase.from('site_links').select('*').order('sort_order');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Errore caricamento link' });
    }
});

module.exports = router;