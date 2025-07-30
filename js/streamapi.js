// API Manager per Streaming Live
class StreamAPI {
    constructor() {
        // Configurazione canali da monitorare
        this.channels = {
            youtube: {
                'UCChannelID_Clarvs': 'Clarvs', // Sostituire con l'ID reale del canale
            },
            twitch: {
                'bettatv': 'BettaTV'
            }
        };
        
        // Cache per evitare troppe chiamate API
        this.cache = {
            youtube: {},
            twitch: {},
            lastCheck: 0
        };
        
        this.cacheTimeout = 60000; // 1 minuto
    }
    
    /**
     * Verifica se ci sono stream live attivi
     */
    async checkLiveStreams() {
        const now = Date.now();
        
        // Controlla cache
        if (now - this.cache.lastCheck < this.cacheTimeout) {
            return this.getCachedResults();
        }
        
        try {
            // Prova prima con il backend API (più sicuro)
            if (await this.isBackendAvailable()) {
                return await this.checkLiveStreamsViaBackend();
            } else {
                // Fallback: chiamate dirette (meno sicuro ma funzionale)
                console.warn('[StreamAPI] Backend non disponibile, uso chiamate dirette');
                const [youtubeStreams, twitchStreams] = await Promise.all([
                    this.checkYoutubeLive(),
                    this.checkTwitchLive()
                ]);
                
                const liveStreams = [...youtubeStreams, ...twitchStreams];
                
                // Aggiorna cache
                this.cache.lastCheck = now;
                this.cache.results = liveStreams;
                
                return liveStreams;
            }
        } catch (error) {
            console.error('Errore nel controllo stream live:', error);
            return this.getCachedResults() || [];
        }
    }
    
    /**
     * Controlla se il backend API è disponibile
     */
    async isBackendAvailable() {
        try {
            const response = await fetch('/api/status');
            return response.ok;
        } catch {
            return false;
        }
    }
    
    /**
     * Usa il backend per controllare i stream live
     */
    async checkLiveStreamsViaBackend() {
        try {
            const response = await fetch('/api/check-live');
            const data = await response.json();
            
            if (data.success) {
                // Aggiorna cache
                this.cache.lastCheck = Date.now();
                this.cache.results = data.streams;
                
                return data.streams;
            } else {
                throw new Error(data.error || 'Errore sconosciuto dal backend');
            }
        } catch (error) {
            console.error('Errore nel backend API:', error);
            throw error;
        }
    }
    
    /**
     * Controlla YouTube per stream live
     */
    async checkYoutubeLive() {
        const liveStreams = [];
        
        try {
            // ⚠️ ATTENZIONE: Queste API non funzioneranno su GitHub Pages
            // Le API keys sono state spostate nel backend per sicurezza
            // Questa funzione è mantenuta solo per riferimento
            console.warn('⚠️ API YouTube disabilitata per sicurezza - richiede backend');
            return [];
            
            // TODO: Implementare chiamata al backend
            // const response = await fetch('/api/youtube/live');
            // const data = await response.json();
            // return data;
        } catch (error) {
            console.error('Errore YouTube API:', error);
        }
        
        return liveStreams;
    }
    
    /**
     * Controlla Twitch per stream live
     */
    async checkTwitchLive() {
        const liveStreams = [];
        
        try {
            // ⚠️ ATTENZIONE: Queste API non funzioneranno su GitHub Pages
            // Le API keys sono state spostate nel backend per sicurezza
            // Questa funzione è mantenuta solo per riferimento
            console.warn('⚠️ API Twitch disabilitata per sicurezza - richiede backend');
            return [];
            
            // TODO: Implementare chiamata al backend
            // const response = await fetch('/api/twitch/live');
            // const data = await response.json();
            // return data;
        } catch (error) {
            console.error('Errore Twitch API:', error);
        }
        
        return liveStreams;
    }
    
    /**
     * ⚠️ FUNZIONE DISABILITATA PER SICUREZZA
     * Le API keys sono state spostate nel backend
     */
    async getTwitchAccessToken() {
        console.warn('⚠️ getTwitchAccessToken disabilitata per sicurezza');
        return null;
    }
    
    /**
     * Restituisce risultati dalla cache
     */
    getCachedResults() {
        return this.cache.results || [];
    }
}

// Esporta la classe
window.StreamAPI = StreamAPI;
