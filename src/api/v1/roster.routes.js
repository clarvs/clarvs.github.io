'use strict';
const router = require('express').Router();
const { supabase } = require('../../config/supabase');
const { requireAuth } = require('../../middleware/auth');
const { auditLog } = require('../../middleware/audit');

function normalizeImageUrl(url) {
    if (!url) return null;
    // Rimuove http://localhost:PORT o http://127.0.0.1:PORT dai percorsi immagine
    // In modo che funzionino sia in locale sia su Render
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
}

function dbToPlayer(row) {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        role: row.role,
        game: row.game,
        imageUrl: normalizeImageUrl(row.image_url),
        ftTrackerUrl: row.ft_tracker_url,
        ftTrackerUsername: row.ft_tracker_username,
        ftPlatform: row.ft_platform,
        ftRegion: row.ft_region,
        socials: row.socials || { twitter: null, instagram: null, twitch: null, youtube: null, tiktok: null }
    };
}

function playerToDb(body) {
    return {
        name: body.name,
        category: body.category,
        role: body.role,
        game: body.game,
        image_url: body.imageUrl,
        ft_tracker_url: body.ftTrackerUrl,
        ft_tracker_username: body.ftTrackerUsername,
        ft_platform: body.ftPlatform,
        ft_region: body.ftRegion,
        socials: body.socials || {}
    };
}

router.get('/', async (req, res) => {
    try {
        const page = Math.max(0, parseInt(req.query.page) || 0);
        const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
        const { data, error, count } = await supabase
            .from('roster')
            .select('*', { count: 'exact' })
            .order('id')
            .range(page * limit, (page + 1) * limit - 1);
        if (error) throw error;
        // Se non ci sono parametri di paginazione, compatibilita backward: restituisce array
        if (!req.query.page && !req.query.limit) {
            return res.json(data.map(dbToPlayer));
        }
        res.json({ data: data.map(dbToPlayer), page, limit, total: count });
    } catch (error) { res.status(500).json({ error: 'Errore lettura roster' }); }
});

router.post('/', requireAuth, auditLog('roster'), async (req, res) => {
    try {
        const { data, error } = await supabase.from('roster').insert(playerToDb(req.body)).select().single();
        if (error) throw error;
        res.status(201).json(dbToPlayer(data));
    } catch (error) { res.status(500).json({ error: 'Errore aggiunta player' }); }
});

router.put('/:id', requireAuth, auditLog('roster'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { data, error } = await supabase.from('roster').update(playerToDb(req.body)).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Player non trovato' });
        res.json(dbToPlayer(data));
    } catch (error) { res.status(500).json({ error: 'Errore modifica player' }); }
});

router.delete('/:id', requireAuth, auditLog('roster'), async (req, res) => {
    try {
        const { error } = await supabase.from('roster').delete().eq('id', parseInt(req.params.id));
        if (error) throw error;
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Errore eliminazione player' }); }
});

module.exports = router;
