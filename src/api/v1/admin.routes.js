'use strict';
const router = require('express').Router();
const { supabase } = require('../../config/supabase');
const { requireAuth, requireOwner } = require('../../middleware/auth');
const { setMaintenanceMode } = require('../../middleware/maintenance');

// GET /api/admin/maintenance — stato corrente
router.get('/admin/maintenance', requireAuth, async (req, res) => {
    try {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'maintenance').single();
        res.json(data ? data.value : { enabled: false, end_at: null, message: '', show_branding: true });
    } catch (e) {
        res.status(500).json({ error: 'Errore lettura manutenzione' });
    }
});

// GET /api/maintenance-status — pubblico per la pagina offline
router.get('/maintenance-status', async (req, res) => {
    try {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'maintenance').single();
        res.json(data ? data.value : { enabled: false, end_at: null, message: '', show_branding: true });
    } catch (e) {
        res.json({ enabled: false, end_at: null, message: '', show_branding: true });
    }
});

// POST /api/admin/maintenance — toggle e data (owner only)
router.post('/admin/maintenance', requireOwner, async (req, res) => {
    const { enabled, end_at, message, show_branding } = req.body || {};
    const newConfig = {
        enabled: !!enabled,
        end_at: end_at || null,
        message: message || "Il sito è attualmente in manutenzione.",
        show_branding: show_branding !== false
    };

    const { error } = await supabase.from('site_settings')
        .upsert({
            key: 'maintenance',
            value: newConfig,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('[maintenance]', error.message);
        return res.status(500).json({ error: error.message });
    }

    setMaintenanceMode(!!enabled);
    console.log('[maintenance]', !!enabled ? 'ON' : 'OFF', '| Message:', newConfig.message);
    res.json({ success: true, ...newConfig });
});

// PUT /api/admin/links (owner only)
router.put('/admin/links', requireOwner, async (req, res) => {
    try {
        const links = req.body; // Array di link
        if (!Array.isArray(links)) return res.status(400).json({ error: 'Dati non validi' });

        // Pulizia e inserimento massivo
        await supabase.from('site_links').delete().neq('id', 0);
        const { error } = await supabase.from('site_links').insert(links.map((l, i) => ({
            label: l.label,
            url: l.url,
            category: l.category || 'nav',
            icon: l.icon,
            sort_order: i,
            is_external: !!l.is_external
        })));

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('[links-update]', error.message);
        res.status(500).json({ error: 'Errore salvataggio link' });
    }
});

module.exports = router;
