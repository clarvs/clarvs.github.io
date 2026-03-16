'use strict';
const path = require('path');
const { supabase, supabaseAnon } = require('../config/supabase');

let maintenanceMode = false;

// Middleware manutenzione — blocca tutte le pagine HTML tranne admin/register/reset/maintenance
// Se l'utente ha il cookie clarvs_token ed è valido, bypassa la manutenzione.
async function maintenanceMiddleware(req, res, next) {
    // Carica stato manutenzione dinamico
    try {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'maintenance').single();
        if (data) {
            maintenanceMode = data.value.enabled || false;
            // Potremmo anche passare end_at via header o cookie se servisse al frontend offline,
            // ma lo leggerà direttamente dall'API o dal file html iniettato.
        }
    } catch (e) { console.error('[maintenance] Error:', e.message); }

    if (!maintenanceMode) return next();

    const p = req.path;

    // Solo questi endpoint sono accessibili durante manutenzione
    const MAINTENANCE_WHITELIST = [
      '/api/health',
      '/api/ready',
      '/api/auth/',
      '/api/admin/maintenance',
      '/api/maintenance-status',
    ];

    // Bypass per asset e pagine speciali
    const isSpecialPage = p.includes('admin.html') || p.includes('register.html') ||
        p.includes('reset-password.html') || p.includes('maintenance.html') ||
        p.match(/\.(css|js|png|ico|jpg|jpeg|gif|svg|woff|woff2|ttf)$/);

    if (isSpecialPage) return next();

    // PRIMA (bypassava TUTTI gli /api/*):
    // if (p.startsWith('/api/')) return next();

    // DOPO (solo whitelist specifica):
    if (MAINTENANCE_WHITELIST.some(allowed => p === allowed || p.startsWith(allowed.endsWith('/') ? allowed : allowed + '/'))) {
      return next();
    }

    // Bypass staff: se ha un cookie valido passa sempre, anche per le API
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        const match = cookieHeader.match(/clarvs_token=([^; ]+)/);
        if (match) {
            let token = match[1];
            try {
                token = decodeURIComponent(token).trim();
                const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
                if (user && !error) {
                    return next();
                }
                // Fallback service key
                const { data: { user: u2 }, error: e2 } = await supabase.auth.getUser(token);
                if (u2 && !e2) return next();
            } catch (e) {
                console.error('[maintenance] Errore bypass:', e.message);
            }
        }
    }

    // Blocca tutte le altre API per utenti non autenticati
    if (p.startsWith('/api/')) {
      return res.status(503).json({
        error: 'Servizio temporaneamente non disponibile per manutenzione',
        retryAfter: 3600
      });
    }

    res.sendFile(path.join(__dirname, '..', '..', 'public', 'maintenance.html'));
}

function getMaintenanceMode() { return maintenanceMode; }
function setMaintenanceMode(val) { maintenanceMode = val; }

module.exports = { maintenanceMiddleware, getMaintenanceMode, setMaintenanceMode };
