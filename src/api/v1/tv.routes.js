'use strict';
const router = require('express').Router();
const { supabase } = require('../../config/supabase');
const { requireAuth } = require('../../middleware/auth');

// GET /config — genera un Twitch access token fresco e restituisce la config al frontend
// SECURITY: clientSecret NON viene mai incluso nella risposta JSON.
// Viene usato solo server-side per ottenere un access token da Twitch (client_credentials flow).
// Il client riceve solo clientId (pubblico) e l'access token temporaneo.
router.get('/config', async (req, res) => {
    try {
        const clientId = process.env.TWITCH_CLIENT_ID || '';
        // clientSecret usato SOLO server-side — mai esposto al client
        const clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
        let accessToken = '';

        if (clientId && clientSecret) {
            const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'client_id=' + clientId + '&client_secret=' + clientSecret + '&grant_type=client_credentials'
            });
            const tokenData = await tokenRes.json();
            accessToken = tokenData.access_token || '';
        }

        // SECURITY: risposta esplicita — clientSecret escluso intenzionalmente
        res.json({
            twitch: {
                clientId,       // pubblico: può essere condiviso col frontend
                accessToken     // token temporaneo generato server-side
                // clientSecret gestito esclusivamente server-side
            },
            youtube: { apiKey: process.env.YOUTUBE_API_KEY || '' }
        });
    } catch (e) {
        res.status(500).json({ error: 'Errore generazione token Twitch' });
    }
});

// GET /streamers — legge la lista streamers da site_settings
router.get('/streamers', async (req, res) => {
    try {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'tv_streamers').single();
        res.json(data ? (data.value || []) : []);
    } catch (e) { res.json([]); }
});

// PUT /streamers — aggiorna la lista streamers (richiede auth)
router.put('/streamers', requireAuth, async (req, res) => {
    try {
        const streamers = Array.isArray(req.body) ? req.body : [];
        const { error } = await supabase.from('site_settings')
            .upsert({ key: 'tv_streamers', value: streamers, updated_at: new Date().toISOString() });
        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
