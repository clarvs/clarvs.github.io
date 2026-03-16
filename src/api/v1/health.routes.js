'use strict';
const router = require('express').Router();
const { supabase } = require('../../config/supabase');

// GET /health
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// GET /ready
router.get('/ready', async (req, res) => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    res.json({ status: 'ready', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', db: 'disconnected', error: err.message });
  }
});

module.exports = router;
