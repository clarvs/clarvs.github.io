'use strict';
require('dotenv').config();
// ÔöÇÔöÇ Windows fs.rmSync patch + uncaughtException handler ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
// Patch fs.rmSync: intercetta EPERM su dir temp di chrome-launcher (lighthouse.*)
// prima che la libreria le stampi nel log ÔÇö errore non fatale su Windows.
{
    const _origRm = require('fs').rmSync;
    require('fs').rmSync = function (p, opts) {
        try { return _origRm(p, opts); }
        catch (e) {
            if (e.code === 'EPERM' && String(p).includes('lighthouse')) return;
            throw e;
        }
    };
}
// Previene il crash del processo per errori EPERM residui di chrome-launcher su Windows
process.on('uncaughtException', (err) => {
    if (err.code === 'EPERM' && (
        (err.path && String(err.path).includes('lighthouse')) ||
        (err.message && err.message.includes('lighthouse'))
    )) return;
    console.error('[uncaughtException]', err);
    process.exit(1);
});
const express      = require('express');
const http         = require('http');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');
const socketIo     = require('socket.io');
const rateLimit    = require('express-rate-limit');
// Config & middleware
const { maintenanceMiddleware } = require('./src/middleware/maintenance');
const { initChatSocket }        = require('./src/socket/chat.socket');
const PORT           = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.APP_URL || 'http://localhost:3000';
// ÔöÇÔöÇ Rate limiters ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
// Rate limiter globale: 100 richieste/minuto per IP
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Troppe richieste, riprova tra un minuto' },
    skip: (req) => {
        if (req.path === "/api/health" || req.path === "/api/ready") return true;
        const ext = req.path.split(".").pop().toLowerCase();
        return ["css","js","png","jpg","jpeg","gif","svg","ico","woff","woff2","ttf","eot","webp","mp4","webm"].includes(ext);
    },
});
// Rate limiter scraper: 5 richieste/ora per IP
// Applicato su /api/talents/lookup (scraping singolo profilo) e /api/talents/run (scraping batch)
const scraperLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Limite scraper raggiunto, riprova tra un ora' },
});
// ÔöÇÔöÇ App setup ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const app    = express();
const server = http.createServer(app);
const io     = socketIo(server, {
    cors: {
        origin: ALLOWED_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
    }
});
// ÔöÇÔöÇ Core middleware ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
app.use(globalLimiter);
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(maintenanceMiddleware);
app.use(express.static(path.join(__dirname, 'public')));
// ÔöÇÔöÇ API Routes ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
app.use('/api', require('./src/api/v1/auth.routes'));
app.use('/api/roster', require('./src/api/v1/roster.routes'));
app.use('/api/staff',  require('./src/api/v1/staff.routes'));
app.use('/api', require('./src/api/v1/home-content.routes'));
app.use('/api', require('./src/api/v1/admin.routes'));
app.use('/api', require('./src/api/v1/players.routes'));
app.use('/api/talents/lookup', scraperLimiter);
app.use('/api/talents/run', scraperLimiter);
app.use('/api/talents', require('./src/api/v1/talents.routes'));
app.use('/api/tv', require('./src/api/v1/tv.routes'));
app.use('/api/ccc', require('./src/api/v1/ccc.routes'));
// ÔöÇÔöÇ Socket.io ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
initChatSocket(io);
// ÔöÇÔöÇ Catch-all ÔåÆ SPA index ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// ÔöÇÔöÇ Global error handler ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack || err.message || err);
    res.status(err.status || 500).json({ error: err.message || 'Errore interno del server.' });
});
// ÔöÇÔöÇ Start ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
server.listen(PORT, () => {
    console.log(`[Clarvs] Server avviato su porta ${PORT}`);
});
// ÔöÇÔöÇÔöÇ Graceful Shutdown ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const shutdown = async (signal) => {
  console.log('[Clarvs] Ricevuto segnale ' + signal + ', avvio graceful shutdown...');
  // 1. Smetti di accettare nuove connessioni HTTP
  server.close(async () => {
    console.log('[Clarvs] Server HTTP chiuso');
    // 2. Chiudi Socket.io (drain connessioni attive)
    if (io) {
      io.close(() => console.log('[Clarvs] Socket.io chiuso'));
    }
    console.log('[Clarvs] Shutdown completato');
    process.exit(0);
  });
  // Timeout di sicurezza: forza exit dopo 30s se qualcosa si blocca
  setTimeout(() => {
    console.error('[Clarvs] Shutdown timeout ÔÇö forzo exit');
    process.exit(1);
  }, 30_000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));