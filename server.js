const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const FortniteTrackerScraper = require('./scraper/fortnite-tracker-scraper');
const TalentScraper = require('./scraper/talent-scraper');
require('dotenv').config();

// Patch fs.rmSync: intercetta EPERM su dir temp di chrome-launcher (lighthouse.*)
// prima che la libreria le stampi nel log — errore non fatale su Windows.
{
    const _origRm = require('fs').rmSync;
    require('fs').rmSync = function(p, opts) {
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
        (err.path    && String(err.path).includes('lighthouse')) ||
        (err.message && err.message.includes('lighthouse'))
    )) return;
    console.error('[uncaughtException]', err);
    process.exit(1);
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve i file statici dalla root del progetto
app.use(express.static(path.join(__dirname)));

// === INIZIALIZZAZIONE SCRAPER ===
let fortniteScaper = null;
try {
    fortniteScaper = new FortniteTrackerScraper({ enableStartupTest: true });
    console.log('🎯 Fortnite Tracker Scraper avviato');
} catch (error) {
    console.error('❌ Errore inizializzazione scraper:', error.message);
}

let talentScraper = null;
try {
    talentScraper = new TalentScraper();
    console.log('🎯 Talent Scraper inizializzato');
} catch (error) {
    console.error('❌ Errore inizializzazione talent scraper:', error.message);
}

// === AUTH STAFF ===

const STAFF_MEMBERS = ['pyre', 'anass', 'calle', 'zak', 'enxyn', 'matto', 'bamba'];

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    if (!STAFF_MEMBERS.includes(username)) {
        return res.status(401).json({ error: 'Username non autorizzato' });
    }
    if (!process.env.STAFF_PASSWORD || password !== process.env.STAFF_PASSWORD) {
        return res.status(401).json({ error: 'Password incorretta' });
    }
    res.json({ ok: true });
});

// === API ENDPOINTS ROSTER ===

const ROSTER_FILE = path.join(__dirname, 'scraper', 'config', 'roster.json');
const fs = require('fs').promises;

async function readRoster() {
    const data = await fs.readFile(ROSTER_FILE, 'utf8');
    return JSON.parse(data);
}

async function writeRoster(roster) {
    await fs.writeFile(ROSTER_FILE, JSON.stringify(roster, null, 2), 'utf8');
}

app.get('/api/roster', async (req, res) => {
    try {
        const roster = await readRoster();
        res.json(roster);
    } catch (error) {
        res.status(500).json({ error: 'Errore lettura roster' });
    }
});

app.post('/api/roster', async (req, res) => {
    try {
        const roster = await readRoster();
        const maxId = roster.reduce((max, p) => Math.max(max, p.id || 0), 0);
        const newPlayer = { id: maxId + 1, ...req.body };
        roster.push(newPlayer);
        await writeRoster(roster);
        res.status(201).json(newPlayer);
    } catch (error) {
        res.status(500).json({ error: 'Errore aggiunta player' });
    }
});

app.put('/api/roster/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const roster = await readRoster();
        const index = roster.findIndex(p => p.id === id);
        if (index === -1) return res.status(404).json({ error: 'Player non trovato' });
        roster[index] = { ...roster[index], ...req.body, id };
        await writeRoster(roster);
        res.json(roster[index]);
    } catch (error) {
        res.status(500).json({ error: 'Errore modifica player' });
    }
});

app.delete('/api/roster/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const roster = await readRoster();
        const index = roster.findIndex(p => p.id === id);
        if (index === -1) return res.status(404).json({ error: 'Player non trovato' });
        roster.splice(index, 1);
        await writeRoster(roster);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Errore eliminazione player' });
    }
});

// === API ENDPOINTS HOME CONTENT ===

const HOME_CONTENT_FILE = path.join(__dirname, 'scraper', 'config', 'home-content.json');

async function readHomeContent() {
    try {
        const data = await fs.readFile(HOME_CONTENT_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return { news: [], events: [], social: { instagram: [], twitter: [] } };
    }
}

async function writeHomeContent(content) {
    await fs.writeFile(HOME_CONTENT_FILE, JSON.stringify(content, null, 2), 'utf8');
}

app.get('/api/home-content', async (req, res) => {
    try {
        res.json(await readHomeContent());
    } catch (error) {
        res.status(500).json({ error: 'Errore lettura home content' });
    }
});

app.put('/api/home-content', async (req, res) => {
    try {
        await writeHomeContent(req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Errore salvataggio home content' });
    }
});

// === API ENDPOINTS PER PLAYER STATS ===

// GET /api/players/stats - Ottieni statistiche di tutti i player
app.get('/api/players/stats', async (req, res) => {
    try {
        if (!fortniteScaper) {
            return res.status(503).json({ 
                error: 'Scraper non disponibile',
                players: []
            });
        }
        
        const stats = await fortniteScaper.getLatestStats();
        res.json({
            success: true,
            lastUpdate: stats.lastUpdate,
            players: stats.players || []
        });
        
    } catch (error) {
        console.error('❌ Errore API /api/players/stats:', error);
        res.status(500).json({ 
            error: 'Errore interno server',
            players: []
        });
    }
});

// GET /api/players/stats/:playerName - Ottieni stats di un player specifico
app.get('/api/players/stats/:playerName', async (req, res) => {
    try {
        if (!fortniteScaper) {
            return res.status(503).json({ error: 'Scraper non disponibile' });
        }
        
        const playerName = req.params.playerName;
        const stats = await fortniteScaper.getLatestStats();
        const player = stats.players?.find(p => 
            p.name.toLowerCase() === playerName.toLowerCase()
        );
        
        if (!player) {
            return res.status(404).json({ error: 'Player non trovato' });
        }
        
        res.json({
            success: true,
            player: player
        });
        
    } catch (error) {
        console.error(`❌ Errore API player ${req.params.playerName}:`, error);
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// POST /api/scraper/run - Avvia scraping manualmente (per test/admin)
app.post('/api/scraper/run', async (req, res) => {
    try {
        if (!fortniteScaper) {
            return res.status(503).json({ error: 'Scraper non disponibile' });
        }
        
        const { trigger = 'manual' } = req.body;
        
        // Avvia scraping in background
        fortniteScaper.runScraping(trigger).catch(error => {
            console.error('❌ Errore scraping manuale:', error);
        });
        
        res.json({
            success: true,
            message: 'Scraping avviato',
            trigger: trigger
        });
        
    } catch (error) {
        console.error('❌ Errore avvio scraping manuale:', error);
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// GET /api/scraper/status - Stato del scraper
app.get('/api/scraper/status', (req, res) => {
    try {
        if (!fortniteScaper) {
            return res.json({
                available: false,
                error: 'Scraper non inizializzato'
            });
        }
        
        const status = fortniteScaper.getStatus();
        res.json({
            available: true,
            ...status
        });
        
    } catch (error) {
        console.error('❌ Errore status scraper:', error);
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// === API ENDPOINTS TALENT SCOUTING ===

// GET /api/talents/stats
app.get('/api/talents/stats', async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        const stats = await talentScraper.getLatestStats();
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// GET /api/talents/urls
app.get('/api/talents/urls', async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ urls: [] });
        const urls = await talentScraper.getUrls();
        res.json({ urls });
    } catch (e) {
        res.status(500).json({ urls: [] });
    }
});

// POST /api/talents/urls/add
app.post('/api/talents/urls/add', async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL mancante' });
        const urls = await talentScraper.getUrls();
        if (!urls.includes(url)) {
            urls.push(url);
            await talentScraper.saveUrls(urls);
        }
        res.json({ success: true, urls });
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// DELETE /api/talents/urls/remove
app.delete('/api/talents/urls/remove', async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        const { index } = req.body;
        const urls = await talentScraper.getUrls();
        if (index >= 0 && index < urls.length) {
            urls.splice(index, 1);
            await talentScraper.saveUrls(urls);
        }
        res.json({ success: true, urls });
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// POST /api/talents/run
app.post('/api/talents/run', async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        talentScraper.runScraping().catch(e => console.error('❌ Errore talent scraping:', e));
        res.json({ success: true, message: 'Talent scouting avviato in background' });
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// GET /api/talents/status
app.get('/api/talents/status', (req, res) => {
    try {
        if (!talentScraper) return res.json({ isRunning: false });
        res.json(talentScraper.getStatus());
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// GET /api/tv/config — genera un Twitch access token fresco e restituisce la config al frontend
app.get('/api/tv/config', async (req, res) => {
    try {
        const clientId     = process.env.TWITCH_CLIENT_ID     || '';
        const clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
        let accessToken    = '';

        if (clientId && clientSecret) {
            const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'client_id=' + clientId + '&client_secret=' + clientSecret + '&grant_type=client_credentials'
            });
            const tokenData = await tokenRes.json();
            accessToken = tokenData.access_token || '';
        }

        res.json({
            twitch: { clientId, accessToken },
            youtube: { apiKey: process.env.YOUTUBE_API_KEY || '' }
        });
    } catch (e) {
        res.status(500).json({ error: 'Errore generazione token Twitch: ' + e.message });
    }
});

// POST /api/talents/lookup — scrapa un singolo profilo e restituisce le sue stats
app.post('/api/talents/lookup', async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        const { profileUrl } = req.body;
        if (!profileUrl) return res.status(400).json({ error: 'profileUrl mancante' });
        const result = await talentScraper.lookupPlayer(profileUrl);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// === SISTEMA CHAT LIVE ===
class ChatManager {
    constructor() {
        this.messages = []; // Messaggi in memoria
        this.users = new Map(); // Utenti connessi
        this.maxMessages = 1000; // Limite messaggi in memoria
        
        // Cleanup automatico messaggi vecchi ogni ora
        setInterval(() => this.cleanupOldMessages(), 60 * 60 * 1000);
    }
    
    addMessage(message) {
        message.timestamp = Date.now();
        message.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        this.messages.push(message);
        
        // Mantieni solo gli ultimi N messaggi
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }
        
        console.log(`[Chat] 💬 ${message.username}: ${message.text}`);
        return message;
    }
    
    getRecentMessages(limit = 50) {
        return this.messages.slice(-limit);
    }
    
    cleanupOldMessages() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 ore fa
        const oldCount = this.messages.length;
        
        this.messages = this.messages.filter(msg => msg.timestamp > oneDayAgo);
        
        const removed = oldCount - this.messages.length;
        if (removed > 0) {
            console.log(`[Chat] 🗑️ Rimossi ${removed} messaggi vecchi (>24h)`);
        }
    }
    
    addUser(socketId, username = null) {
        this.users.set(socketId, {
            id: socketId,
            username: username,
            joinTime: Date.now()
        });
    }
    
    removeUser(socketId) {
        this.users.delete(socketId);
    }
    
    getUserCount() {
        return this.users.size;
    }
    
    isValidMessage(message) {
        if (!message.text || !message.username) return false;
        if (message.text.length > 200) return false;
        if (message.username.length < 3 || message.username.length > 20) return false;
        
        // Filtro spam/caratteri pericolosi
        const cleanText = message.text.replace(/[<>&"']/g, '');
        if (cleanText.length !== message.text.length) return false;
        
        return true;
    }
}

const chatManager = new ChatManager();

// === SOCKET.IO EVENTS ===
io.on('connection', (socket) => {
    console.log(`[Chat] 🔗 Nuovo utente connesso: ${socket.id}`);
    
    // Aggiungi utente
    chatManager.addUser(socket.id);
    
    // Invia messaggi storici
    const recentMessages = chatManager.getRecentMessages();
    socket.emit('chat_history', recentMessages);
    
    // Invia contatore utenti
    io.emit('viewer_count', chatManager.getUserCount());
    
    // Gestisci nuovo messaggio
    socket.on('chat_message', (message) => {
        try {
            // Validazione messaggio
            if (!chatManager.isValidMessage(message)) {
                socket.emit('chat_error', { error: 'Messaggio non valido' });
                return;
            }
            
            // Rate limiting semplice (max 1 messaggio ogni 2 secondi)
            const user = chatManager.users.get(socket.id);
            if (user && user.lastMessage && Date.now() - user.lastMessage < 2000) {
                socket.emit('chat_error', { error: 'Stai scrivendo troppo veloce!' });
                return;
            }
            
            // Aggiungi messaggio
            const savedMessage = chatManager.addMessage(message);
            
            // Aggiorna timestamp ultimo messaggio utente
            if (user) {
                user.lastMessage = Date.now();
                user.username = message.username;
            }
            
            // Invia a tutti i client connessi
            io.emit('chat_message', savedMessage);
            
        } catch (error) {
            console.error('[Chat] ❌ Errore gestione messaggio:', error);
            socket.emit('chat_error', { error: 'Errore server' });
        }
    });
    
    // Gestisci disconnessione
    socket.on('disconnect', () => {
        console.log(`[Chat] 👋 Utente disconnesso: ${socket.id}`);
        chatManager.removeUser(socket.id);
        
        // Aggiorna contatore utenti
        io.emit('viewer_count', chatManager.getUserCount());
    });
    
    // Gestisci errori socket
    socket.on('error', (error) => {
        console.error('[Chat] ❌ Errore socket:', error);
    });
});

// Messaggi di benvenuto automatici ogni ora
setInterval(() => {
    const welcomeMessages = [
        "🎮 Benvenuti su Clarvs TV! Godetevi lo show!",
        "🔥 Non dimenticatevi di seguire @clarvs sui social!",
        "⚡ Cosa ne pensate della programmazione di oggi?",
        "🏆 Forza Clarvs! #ClarvsArmy"
    ];
    
    const randomMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const message = chatManager.addMessage({
        username: "🤖 Clarvs Bot",
        text: randomMsg
    });
    
    io.emit('chat_message', message);
}, 60 * 60 * 1000); // Ogni ora

// Tutte le richieste GET non gestite serviranno index.html (per il routing lato client)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🚀 Server Clarvs avviato su http://localhost:${PORT}`);
    console.log(`💬 Chat live attivata!`);
    console.log(`📺 Clarvs TV con chat disponibile su http://localhost:${PORT}/pagine/tv.html`);
}); 