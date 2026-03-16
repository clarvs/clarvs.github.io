'use strict';
const rateLimit = require('express-rate-limit');
const { supabase, supabaseAnon } = require('../config/supabase');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Troppi tentativi, riprova tra 15 minuti' },
    standardHeaders: true,
    legacyHeaders: false,
});

async function requireAuth(req, res, next) {
    let token;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        token = header.slice(7);
    } else if (req.cookies && req.cookies.clarvs_token) {
        token = req.cookies.clarvs_token;
    }
    if (!token) return res.status(401).json({ error: 'Token mancante' });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
        console.error('[auth] Token check failed:', authErr?.message);
        return res.status(401).json({ error: 'Sessione scaduta' });
    }

    const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('nickname, role')
        .eq('id', user.id)
        .limit(1)
        .maybeSingle();

    if (profErr) {
        console.error(`[auth] Profile fetch ERROR for ${user.email}:`, profErr.message);
        // Non bloccare con 503 — usa il ruolo di default 'staff' con un avviso
        console.warn(`[auth] Fallback a ruolo 'staff' per ${user.email} a causa dell'errore sul profilo`);
    }

    req.user = {
        id: user.id,
        email: user.email,
        nickname: profile?.nickname || 'Utente',
        role: profile?.role || 'staff'
    };
    next();
}

function requireOwner(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== 'owner') {
            console.warn(`[auth] 403 FORBIDDEN: User ${req.user.email} (Role: ${req.user.role}) is NOT owner. Endpoint: ${req.originalUrl}`);
            return res.status(403).json({ error: "Accesso riservato all'owner" });
        }
        next();
    });
}

module.exports = { authLimiter, requireAuth, requireOwner };
