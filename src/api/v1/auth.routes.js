'use strict';
const logger = require('../../utils/logger');
const crypto = require('crypto');
const router = require('express').Router();
const { supabase, supabaseAnon } = require('../../config/supabase');
const { authLimiter, requireAuth, requireOwner } = require('../../middleware/auth');

// NOTE: This router is mounted at /api in server.js.
// router.post('/auth/login') -> /api/auth/login

router.post('/auth/login', authLimiter, async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email e password richiesti' });
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email: email.toLowerCase().trim(), password });
    if (error) {
        logger.error('[login] Errore Supabase:', error.message);
        return res.status(401).json({ error: 'Credenziali non valide: ' + error.message });
    }
    const { data: profile } = await supabase.from('profiles').select('nickname, role').eq('id', data.user.id).single();
    res.cookie('clarvs_token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({
        token: data.session.access_token,
        user: { id: data.user.id, email: data.user.email, nickname: profile?.nickname, role: profile?.role || 'staff' }
    });
});

// GET /api/auth/me
router.get('/auth/me', requireAuth, (req, res) => res.json(req.user));

// POST /api/auth/logout â€” cancella il cookie httpOnly
router.post('/auth/logout', (req, res) => {
    res.clearCookie('clarvs_token', { httpOnly: true, sameSite: 'Strict', path: '/' });
    res.json({ success: true });
});

// POST /api/auth/invite â€” owner invia email di invito tramite Supabase
router.post('/auth/invite', requireOwner, async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email richiesta' });
    const el = email.toLowerCase().trim();
    const base = process.env.APP_URL || 'http://localhost:3000';
    const { error } = await supabase.auth.admin.inviteUserByEmail(el, {
        redirectTo: base + '/pages/register.html',
        data: { invited_by: req.user.id }
    });
    if (error) {
        logger.error('[invite]', error.message);
        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('email rate')) {
            return res.status(429).json({ error: 'Limite email Supabase raggiunto (max ~4/ora sul piano free). Attendi 30-60 minuti oppure configura un SMTP personalizzato in Supabase > Auth > SMTP Settings.' });
        }
        if (error.message.includes('already been registered') || error.message.includes('already registered')) {
            return res.status(409).json({ error: 'Email gia invitata e in attesa di registrazione.' });
        }
        return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, message: 'Email di invito inviata a ' + el });
});

// GET /api/auth/invite-info?token=xxx â€” verifica token da register.html
router.get('/auth/invite-info', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token mancante' });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(404).json({ error: 'Token non valido o scaduto' });
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
    if (profile) return res.status(409).json({ error: 'Account gia configurato. Fai login.' });
    res.json({ email: user.email });
});

// POST /api/auth/complete-registration â€” imposta password e nickname dopo invito
router.post('/auth/complete-registration', async (req, res) => {
    const { token, nickname, password } = req.body || {};
    if (!token || !nickname || !password) return res.status(400).json({ error: 'Tutti i campi sono richiesti' });
    if (password.length < 8) return res.status(400).json({ error: 'Password minimo 8 caratteri' });
    if (nickname.length < 3 || nickname.length > 20) return res.status(400).json({ error: 'Nickname 3-20 caratteri' });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Token non valido o scaduto' });
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).single();
    if (existing) return res.status(409).json({ error: 'Account gia configurato' });
    const { data: nickTaken } = await supabase.from('profiles').select('id').eq('nickname', nickname).single();
    if (nickTaken) return res.status(409).json({ error: 'Nickname gia in uso' });
    const { error: pwErr } = await supabase.auth.admin.updateUserById(user.id, { password });
    if (pwErr) return res.status(500).json({ error: 'Errore impostazione password: ' + pwErr.message });
    const rawInvitedBy = (user.user_metadata && user.user_metadata.invited_by) || null;
    // Verify invited_by actually exists in profiles to avoid FK violation
    let invitedBy = null;
    if (rawInvitedBy) {
        const { data: inviterProfile } = await supabase.from('profiles').select('id').eq('id', rawInvitedBy).single();
        invitedBy = inviterProfile ? rawInvitedBy : null;
    }
    const { error: profErr } = await supabase.from('profiles').insert({ id: user.id, nickname, role: 'staff', invited_by: invitedBy });
    if (profErr) { logger.error('[complete-registration] profile insert error:', profErr); return res.status(500).json({ error: 'Errore salvataggio profilo: ' + profErr.message }); }
    res.json({ success: true });
});

// GET /api/auth/staff â€” lista staff + inviti pendenti (owner only)
router.get('/auth/staff', requireOwner, async (req, res) => {
    const { data: profiles } = await supabase.from('profiles').select('id, nickname, role, created_at').order('created_at');
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const profileIds = new Set((profiles || []).map(function (p) { return p.id; }));
    const emailMap = {};
    (users || []).forEach(function (u) { emailMap[u.id] = u.email; });
    const accounts = (profiles || []).map(function (p) { return Object.assign({}, p, { email: emailMap[p.id] || null }); });
    const pending = (users || []).filter(function (u) { return !profileIds.has(u.id); });
    res.json({
        accounts: accounts,
        pending: pending.map(function (u) { return { id: u.id, email: u.email, created_at: u.created_at || u.invited_at }; })
    });
});

// DELETE /api/auth/staff/:id â€” revoca account (owner only)
router.delete('/auth/staff/:id', requireOwner, async (req, res) => {
    const { data: target } = await supabase.from('profiles').select('role').eq('id', req.params.id).single();
    if (!target) return res.status(404).json({ error: 'Account non trovato' });
    if (target.role === 'owner') return res.status(403).json({ error: "Non puoi revocare l'owner" });

    // Elimina prima il profilo, poi l'utente auth per garantire pulizia completa
    await supabase.from('profiles').delete().eq('id', req.params.id);
    const { error } = await supabase.auth.admin.deleteUser(req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// DELETE /api/auth/invite/:id â€” annulla invito pendente (owner only)
router.delete('/auth/invite/:id', requireOwner, async (req, res) => {
    const { error } = await supabase.auth.admin.deleteUser(req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});


// POST /api/setup/owner â€” crea l'owner al primo deploy (richiede SETUP_SECRET)
router.post('/setup/owner', async (req, res) => {
    const { email, nickname, password, secret } = req.body || {};
    // Protezione: se SETUP_SECRET non e' configurata, l'endpoint e' disabilitato
    if (!process.env.SETUP_SECRET) {
        return res.status(503).json({ error: 'Setup endpoint disabled -- configure SETUP_SECRET' });
    }
    // Verifica secret con confronto timing-safe (stessa lunghezza per evitare eccezioni)
    const secretBuf = Buffer.from(secret || '');
    const expectedBuf = Buffer.from(process.env.SETUP_SECRET);
    if (secretBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(secretBuf, expectedBuf)) {
        return res.status(403).json({ error: 'Secret non valido' });
    }
    const { data: existing } = await supabase.from('profiles').select('id').eq('role', 'owner');
    if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Owner gia esistente' });
    }
    if (!email || !nickname || !password) return res.status(400).json({ error: 'Tutti i campi richiesti' });
    if (password.length < 8) return res.status(400).json({ error: 'Password min 8 caratteri' });
    const { data, error } = await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(), password, email_confirm: true
    });
    if (error) return res.status(500).json({ error: error.message });
    const { error: profErr } = await supabase.from('profiles').insert({
        id: data.user.id, nickname: nickname.trim(), role: 'owner'
    });
    if (profErr) {
        await supabase.auth.admin.deleteUser(data.user.id);
        return res.status(500).json({ error: profErr.message });
    }
    res.json({ success: true, message: 'Owner creato: ' + nickname });
});

// POST /api/auth/exchange-code â€” scambia PKCE code con access_token (per reset password)
router.post('/auth/exchange-code', async (req, res) => {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Code mancante' });
    try {
        // Usa l'exchangeCodeForSession con il client service-key
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return res.status(400).json({ error: error.message });
        res.json({ access_token: data.session.access_token, token_type: 'recovery' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/auth/reset-password-request â€” invia email di reset
router.post('/auth/reset-password-request', authLimiter, async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email richiesta' });
    const el = email.toLowerCase().trim();
    // Verifica che l'email esista e abbia un profilo attivo
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const found = (users || []).find(function (u) { return u.email && u.email.toLowerCase() === el; });
    if (!found) return res.status(200).json({ message: "Se l'email esiste nel sistema, riceverai un link di reset." });
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', found.id).single();
    if (!profile) return res.status(400).json({ error: 'Account non ancora attivato. Completa la registrazione tramite il link di invito.' });
    const base = process.env.APP_URL || 'http://localhost:3000';
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(el, {
        redirectTo: base + '/pages/reset-password.html'
    });
    if (error) {
        logger.error('[reset-password]', error.message);
        if (error.message.toLowerCase().includes('rate limit')) {
            return res.status(429).json({ error: 'Limite email raggiunto. Attendi 30-60 minuti e riprova.' });
        }
        return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
});

// POST /api/auth/reset-password-complete â€” imposta nuova password dopo il link email
router.post('/auth/reset-password-complete', async (req, res) => {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: 'Token e password richiesti' });
    if (password.length < 8) return res.status(400).json({ error: 'Password minimo 8 caratteri' });
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: 'Token non valido o scaduto' });
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});
module.exports = router;