'use strict';
const { supabase } = require('../config/supabase');

/**
 * Middleware audit log per operazioni admin.
 * Logga automaticamente POST/PUT/DELETE sulle route API.
 * Usa dopo requireAuth per avere accesso a req.user.
 */
function auditLog(tableName) {
  return async (req, res, next) => {
    // Intercetta la risposta per loggare dopo il completamento
    const originalJson = res.json.bind(res);
    res.json = async function(data) {
      // Logga solo operazioni mutanti
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const action = req.method === 'POST' ? 'create'
          : req.method === 'DELETE' ? 'delete' : 'update';

        const userId = req.user?.id || null;
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
          || req.socket?.remoteAddress || null;
        const ua = req.headers['user-agent'] || null;

        // Fire-and-forget: audit non deve bloccare la risposta
        supabase.from('audit_log').insert({
          user_id: userId,
          action,
          table_name: tableName,
          record_id: req.params?.id || null,
          new_data: req.method !== 'DELETE' ? req.body : null,
          ip_address: ip,
          user_agent: ua,
        }).then(({ error }) => {
          if (error) console.error('[audit] Insert failed:', error.message);
        });
      }
      return originalJson(data);
    };
    next();
  };
}

module.exports = { auditLog };