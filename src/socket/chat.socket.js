'use strict';
const logger = require('../utils/logger');
const { supabase } = require('../config/supabase');

class ChatManager {
    constructor() {
        this.messages = []; // Messaggi in memoria
        this.users = new Map(); // Utenti connessi
        this.maxMessages = 1000; // Limite messaggi in memoria

        // Cleanup automatico messaggi vecchi ogni ora
        setInterval(() => this.cleanupOldMessages(), 60 * 60 * 1000);
    }

    async addMessage(message, socket = null) {
        message.timestamp = Date.now();
        message.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        this.messages.push(message);

        // Mantieni solo gli ultimi N messaggi
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }

        // Salva su DB con await e gestione errore
        try {
            const { error } = await supabase.from('chat_history').insert({
                username: message.username,
                text: message.text,
                msg_id: message.id,
                timestamp: new Date(message.timestamp).toISOString()
            });
            if (error) {
                logger.error('[chat] INSERT fallita:', error.message);
                if (socket) socket.emit('message_error', { message: 'Errore salvataggio messaggio' });
            }
        } catch (dbErr) {
            logger.error('[chat] Eccezione INSERT:', dbErr.message);
            if (socket) socket.emit('message_error', { message: 'Errore salvataggio messaggio' });
        }

        logger.info(`[Chat] 💬 ${message.username}: ${message.text}`);
        return message;
    }

    async loadFromDB(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('chat_history')
                .select('username, text, msg_id, timestamp')
                .order('timestamp', { ascending: false })
                .limit(limit);
            if (error || !data) return [];
            return data.reverse().map(r => ({
                username: r.username,
                text: r.text,
                id: r.msg_id,
                timestamp: new Date(r.timestamp).getTime()
            }));
        } catch (e) {
            logger.error('[Chat] DB load error:', e.message);
            return [];
        }
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
            logger.info(`[Chat] 🗑️ Rimossi ${removed} messaggi vecchi (>24h)`);
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

function initChatSocket(io) {
    const chatManager = new ChatManager();

    // === SOCKET.IO EVENTS ===
    io.on('connection', (socket) => {
        logger.info(`[Chat] 🔗 Nuovo utente connesso: ${socket.id}`);

        // Aggiungi utente
        chatManager.addUser(socket.id);

        // Invia messaggi storici — prova DB, fallback su cache in-memory
        chatManager.loadFromDB(50).then(dbMessages => {
            const history = dbMessages.length > 0 ? dbMessages : chatManager.getRecentMessages();
            // Aggiorna la cache in-memory con i messaggi dal DB (evita duplicati al restart)
            if (dbMessages.length > 0 && chatManager.messages.length === 0) {
                chatManager.messages = dbMessages;
            }
            socket.emit('chat_history', history);
        }).catch(() => {
            socket.emit('chat_history', chatManager.getRecentMessages());
        });

        // Invia contatore utenti
        io.emit('viewer_count', chatManager.getUserCount());

        // Gestisci nuovo messaggio
        socket.on('chat_message', async (message) => {
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

                // Aggiungi messaggio (async: salva su DB con await)
                const savedMessage = await chatManager.addMessage(message, socket);

                // Aggiorna timestamp ultimo messaggio utente
                if (user) {
                    user.lastMessage = Date.now();
                    user.username = message.username;
                }

                // Invia a tutti i client connessi
                io.emit('chat_message', savedMessage);

            } catch (error) {
                logger.error('[Chat] ❌ Errore gestione messaggio:', error);
                socket.emit('chat_error', { error: 'Errore server' });
            }
        });

        // Gestisci disconnessione
        socket.on('disconnect', () => {
            logger.info(`[Chat] 👋 Utente disconnesso: ${socket.id}`);
            chatManager.removeUser(socket.id);

            // Aggiorna contatore utenti
            io.emit('viewer_count', chatManager.getUserCount());
        });

        // Gestisci errori socket
        socket.on('error', (error) => {
            logger.error('[Chat] ❌ Errore socket:', error);
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
}

module.exports = { initChatSocket };
