'use strict';
const router = require('express').Router();
const { supabase } = require('../../config/supabase');
const { requireAuth } = require('../../middleware/auth');
const { auditLog } = require('../../middleware/audit');

function dbToStaff(row) {
    return {
        id:        row.id,
        name:      row.name,
        section:   row.section,
        role:      row.role,
        game:      row.game,
        imageUrl:  row.image_url,
        sortOrder: row.sort_order
    };
}

function staffToDb(body) {
    return {
        name:       body.name,
        section:    body.section || 'staffer',
        role:       body.role,
        game:       body.game,
        image_url:  body.imageUrl,
        sort_order: body.sortOrder != null ? parseInt(body.sortOrder) : 0
    };
}

// GET /api/staff — pubblico
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .order('section')
            .order('sort_order')
            .order('id');
        if (error) throw error;
        res.json(data.map(dbToStaff));
    } catch (e) {
        res.status(500).json({ error: 'Errore lettura staff' });
    }
});

// POST /api/staff — requireAuth
router.post('/', requireAuth, auditLog('staff'), async (req, res) => {
    try {
        const { data, error } = await supabase.from('staff').insert(staffToDb(req.body)).select().single();
        if (error) throw error;
        res.status(201).json(dbToStaff(data));
    } catch (e) {
        res.status(500).json({ error: 'Errore aggiunta staffer' });
    }
});

// PUT /api/staff/:id — requireAuth
router.put('/:id', requireAuth, auditLog('staff'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { data, error } = await supabase.from('staff').update(staffToDb(req.body)).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Staffer non trovato' });
        res.json(dbToStaff(data));
    } catch (e) {
        res.status(500).json({ error: 'Errore modifica staffer' });
    }
});

// DELETE /api/staff/:id — requireAuth
router.delete('/:id', requireAuth, auditLog('staff'), async (req, res) => {
    try {
        const { error } = await supabase.from('staff').delete().eq('id', parseInt(req.params.id));
        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Errore eliminazione staffer' });
    }
});

module.exports = router;
