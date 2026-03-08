/**
 * CLARVS TV - CHAT LIVE SYSTEM
 * Sistema di chat in tempo reale per Clarvs TV
 * Features: Real-time messaging, timezone locale, auto-cleanup 24h
 */

console.log('[Clarvs Chat] 🚀 Inizializzazione chat live...');

class ClarvsChat {
    constructor() {
        this.socket = null;
        this.username = null;
        this.isConnected = false;
        this.messageCount = 0;
        this.viewerCount = 0;
        
        // DOM Elements
        this.elements = {
            chatMessages: document.getElementById('chat-messages'),
            chatInput: document.getElementById('chat-input'),
            sendBtn: document.getElementById('chat-send-btn'),
            usernameInput: document.getElementById('username-input'),
            usernameSetBtn: document.getElementById('username-set-btn'),
            usernameSetup: document.getElementById('username-setup'),
            viewerCount: document.getElementById('viewer-count')
        };
        
        this.init();
    }
    
    init() {
        console.log('[Clarvs Chat] 📡 Connessione al server...');
        
        // Connetti al server Socket.io
        this.connectSocket();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Carica username salvato
        this.loadSavedUsername();
        
        console.log('[Clarvs Chat] ✅ Chat inizializzata!');
    }
    
    connectSocket() {
        try {
            // Connetti al server locale (più specifico e affidabile)
            const serverUrl = window.location.protocol + '//' + window.location.hostname + ':3000';
            console.log('[Clarvs Chat] 🔗 Connessione a:', serverUrl);
            
            this.socket = io(serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 10000,
                forceNew: true
            });
            
            this.socket.on('connect', () => {
                console.log('[Clarvs Chat] ✅ Connesso al server!');
                this.isConnected = true;
                this.updateConnectionStatus(true);
            });
            
            this.socket.on('disconnect', () => {
                console.log('[Clarvs Chat] ❌ Disconnesso dal server');
                this.isConnected = false;
                this.updateConnectionStatus(false);
            });
            
            this.socket.on('connect_error', (error) => {
                console.error('[Clarvs Chat] ❌ Errore connessione:', error);
                this.showError('Impossibile connettersi alla chat');
            });
            
            // Ricevi messaggi
            this.socket.on('chat_message', (message) => {
                this.displayMessage(message);
            });
            
            // Aggiorna contatore utenti online
            this.socket.on('viewer_count', (count) => {
                this.updateViewerCount(count);
            });
            
            // Carica messaggi storici (ultimi 50)
            this.socket.on('chat_history', (messages) => {
                messages.forEach(message => this.displayMessage(message, false));
            });
            
            // Gestisci errori chat
            this.socket.on('chat_error', (data) => {
                this.showError(data.error || 'Errore chat');
            });
            
        } catch (error) {
            console.error('[Clarvs Chat] ❌ Errore connessione:', error);
            this.showOfflineMessage();
        }
    }
    
    setupEventListeners() {
        // Invio messaggio con Enter
        this.elements.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Invio messaggio con button
        this.elements.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Controllo lunghezza messaggio
        this.elements.chatInput.addEventListener('input', () => {
            const text = this.elements.chatInput.value.trim();
            const isValid = text.length > 0 && text.length <= 200 && this.username;
            this.elements.sendBtn.disabled = !isValid;
        });
        
        // Setup username con Enter
        this.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.setUsername();
            }
        });
        
        // Setup username con button
        this.elements.usernameSetBtn.addEventListener('click', () => {
            this.setUsername();
        });
        
        // Controllo validità username
        this.elements.usernameInput.addEventListener('input', () => {
            const username = this.elements.usernameInput.value.trim();
            const isValid = username.length >= 3 && username.length <= 20;
            this.elements.usernameSetBtn.disabled = !isValid;
        });
    }
    
    setUsername() {
        const username = this.elements.usernameInput.value.trim();
        
        // Validazione username
        if (username.length < 3 || username.length > 20) {
            this.showError('Il nickname deve essere tra 3 e 20 caratteri');
            return;
        }
        
        // Filtra caratteri speciali
        const cleanUsername = username.replace(/[^\w\-_àèéìíîòóù]/g, '');
        if (cleanUsername !== username) {
            this.showError('Il nickname può contenere solo lettere, numeri e _ -');
            return;
        }
        
        this.username = cleanUsername;
        localStorage.setItem('clarvs_chat_username', this.username);
        
        // Nascondi setup username, mostra chat
        this.elements.usernameSetup.style.display = 'none';
        this.elements.chatInput.style.display = 'block';
        this.elements.sendBtn.style.display = 'flex';
        
        this.showSuccessMessage(`Bentornato, ${this.username}! 🎮`);
        
        console.log(`[Clarvs Chat] 👤 Username impostato: ${this.username}`);
    }
    
    loadSavedUsername() {
        const saved = localStorage.getItem('clarvs_chat_username');
        if (saved && saved.length >= 3) {
            this.elements.usernameInput.value = saved;
            this.setUsername();
        }
    }
    
    sendMessage() {
        console.log('[Clarvs Chat] 📤 Tentativo invio messaggio...');
        
        if (!this.isConnected) {
            this.showError('Chat non connessa al server');
            return;
        }
        
        if (!this.username) {
            this.showError('Username non impostato');
            return;
        }
        
        const text = this.elements.chatInput.value.trim();
        if (!text) {
            this.showError('Messaggio vuoto');
            return;
        }
        
        if (text.length > 200) {
            this.showError('Messaggio troppo lungo (max 200 caratteri)');
            return;
        }
        
        // Prepara messaggio
        const message = {
            username: this.username,
            text: text,
            timestamp: Date.now(),
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };
        
        console.log('[Clarvs Chat] 💬 Invio messaggio:', message);
        
        // Invia al server
        this.socket.emit('chat_message', message);
        
        // Pulisci input
        this.elements.chatInput.value = '';
        this.elements.sendBtn.disabled = true;
        
        console.log('[Clarvs Chat] ✅ Messaggio inviato successfully');
    }
    
    displayMessage(message, animate = true) {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';
        messageEl.dataset.messageId = message.id;
        
        // Timestamp locale
        const date = new Date(message.timestamp);
        const timeStr = date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        messageEl.innerHTML = `
            <div class="chat-message-header">
                <span class="chat-username">${this.escapeHtml(message.username)}</span>
                <span class="chat-timestamp">${timeStr}</span>
            </div>
            <div class="chat-text">${this.escapeHtml(message.text)}</div>
        `;
        
        // Aggiungi animazione se richiesta
        if (!animate) {
            messageEl.style.animation = 'none';
        }
        
        this.elements.chatMessages.appendChild(messageEl);
        
        // Auto-scroll al bottom
        this.scrollToBottom();
        
        // Rimuovi messaggi vecchi (max 100)
        this.cleanupOldMessages();
        
        this.messageCount++;
    }
    
    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }
    
    cleanupOldMessages() {
        const messages = this.elements.chatMessages.querySelectorAll('.chat-message');
        if (messages.length > 100) {
            // Rimuovi i messaggi più vecchi
            for (let i = 0; i < messages.length - 100; i++) {
                messages[i].remove();
            }
        }
    }
    
    updateViewerCount(count) {
        this.viewerCount = count;
        if (this.elements.viewerCount) {
            this.elements.viewerCount.textContent = count;
        }
    }
    
    updateConnectionStatus(connected) {
        // Puoi aggiungere un indicatore di connessione se vuoi
        if (connected) {
            console.log('[Clarvs Chat] 🟢 Chat online');
        } else {
            console.log('[Clarvs Chat] 🔴 Chat offline');
            this.showError('Connessione chat persa, riconnessione...');
        }
    }
    
    showSuccessMessage(text) {
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message';
        msgEl.style.borderLeftColor = '#4caf50';
        msgEl.innerHTML = `
            <div class="chat-text" style="color: #4caf50; text-align: center;">
                <i class="fas fa-check-circle"></i> ${text}
            </div>
        `;
        this.elements.chatMessages.appendChild(msgEl);
        this.scrollToBottom();
    }
    
    showError(text) {
        console.warn('[Clarvs Chat] ⚠️', text);
        
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message';
        msgEl.style.borderLeftColor = '#f44336';
        msgEl.innerHTML = `
            <div class="chat-text" style="color: #f44336; text-align: center;">
                <i class="fas fa-exclamation-triangle"></i> ${text}
            </div>
        `;
        this.elements.chatMessages.appendChild(msgEl);
        this.scrollToBottom();
        
        // Rimuovi dopo 5 secondi
        setTimeout(() => {
            if (msgEl.parentNode) {
                msgEl.remove();
            }
        }, 5000);
    }
    
    showOfflineMessage() {
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-welcome';
        msgEl.innerHTML = `
            <i class="fas fa-wifi" style="color: #f44336;"></i>
            <p style="color: #f44336;">Chat temporaneamente offline</p>
            <p>Riprova tra qualche minuto 🔄</p>
        `;
        this.elements.chatMessages.appendChild(msgEl);
    }
    
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Inizializza chat quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    // Attendi un momento per assicurarsi che tutto sia caricato
    setTimeout(() => {
        if (typeof io !== 'undefined') {
            window.clarvsChat = new ClarvsChat();
        } else {
            console.error('[Clarvs Chat] ❌ Socket.io non caricato');
        }
    }, 100);
});

console.log('[Clarvs Chat] 📋 Script caricato!');