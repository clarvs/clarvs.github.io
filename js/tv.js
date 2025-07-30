document.addEventListener('DOMContentLoaded', function() {
    console.log('[Clarvs TV] 🚀 Avvio sistema TV...');
    
    // Verifica elementi DOM
    const tvScreen = document.getElementById('tv-screen');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const streamStatus = document.getElementById('stream-status');
    const scheduleList = document.getElementById('schedule-list');
    
    if (!tvScreen) {
        console.error('[Clarvs TV] ❌ ERRORE: Elemento tv-screen non trovato!');
        return;
    }
    
    console.log('[Clarvs TV] ✅ Elementi DOM trovati');
    console.log('[Clarvs TV] 📱 User Agent:', navigator.userAgent);
    console.log('[Clarvs TV] 🌐 URL:', window.location.href);
    
    // Verifica disponibilità StreamAPI
    if (typeof StreamAPI === 'undefined') {
        console.warn('[Clarvs TV] ⚠️ StreamAPI non disponibile, modalità solo playlist');
    } else {
        console.log('[Clarvs TV] ✅ StreamAPI disponibile');
    }
    
    // Inizializza API Manager (se disponibile)
    let streamAPI = null;
    if (typeof StreamAPI !== 'undefined') {
        streamAPI = new StreamAPI();
    }
    
    let currentMode = 'playlist'; // 'playlist' o 'live'
    let liveCheckInterval;
    
    // --- CONFIGURAZIONE TV SINCRONIZZATA ---
    // Array degli ID video della playlist YouTube
    const playlistVideos = [
        'Tl5Z8aqEcMU', 'QBr_0RzUJ3E', 'eFYgX4xwcxI', 'wlk1wxWgMTE', 'rQDnrlmv54E',
        'ePdTfo382Ro', 'ShwlHQ3n4D0', 'F4kQH_Pmn0Y', 'nRRZtX9skw', 'CicIEmh0uhY',
        '7UIelBCPgiM', 'nP5rqzJbP1s', 'rh88yZ9Gj-4', 'EKTjq6anV4M', 'koa1GICyPxg',
        'ucdZtsdl7Bo', 'koGqeb-GVtk', '0VZrU9WkIl0', 'L18VUJ7_b-E', 'Fi7ciPu_bAY',
        'KoYTH4c-IY8', 'A_bIHfNCR54', '7x-2_1x66Z4', 'Zkn4MYkLdtw', 'qSBAeBtsJgo',
        'UvZk5y5ai78', 'E1CVz6Zku7c', 'orqDVsYulLY', 'WvmTqk5LufY', 'K-W3-smxo4g',
        '-9csAIF5OEU', 'gETwja_8ZO8', 'xefdWCxCvZM', 'KhWs5rXYzu4', 'SshJW8opNkc',
        'HD_xogNYVEs', 'h1Z82_BPuHM'
    ];
    
    // Durate in secondi di ciascun video (nell'ordine della playlist)
    const durations = [
        20862, 11317, 600, 423, 1678, 418, 501, 1041, 726, 1099, 856, 949, 508, 644, 
        487, 803, 198, 1329, 1550, 567, 1465, 2039, 2599, 3331, 915, 1463, 1294, 365, 
        212, 137, 290, 159, 1709, 13211, 14592, 10705, 10524
    ];
    
    // Orario di partenza della playlist (00:00:00 UTC)
    const playlistStartHour = 0;
    const playlistStartMinute = 0;
    const playlistStartSecond = 0;

    // --- FUNZIONI PRINCIPALI ---
    
    /**
     * Inizializza la TV con controllo automatico live/playlist
     */
    async function initializeTV() {
        console.log('[Clarvs TV] Inizializzazione...');
        
        // Inizializza sempre con la playlist
        console.log('[Clarvs TV] Avvio playlist predefinita...');
        switchToPlaylist();
        
        // Controlla subito se ci sono stream live
        await checkAndSwitchMode();
        
        // Imposta controllo periodico ogni 2 minuti
        liveCheckInterval = setInterval(checkAndSwitchMode, 120000);
        
        // Inizializza controlli
        initializeControls();
        
        console.log('[Clarvs TV] Inizializzazione completata');
    }
    
    /**
     * Controlla stream live e cambia modalità se necessario
     */
    async function checkAndSwitchMode() {
        try {
            // Se StreamAPI non è disponibile, resta in modalità playlist
            if (!streamAPI) {
                console.log('[Clarvs TV] StreamAPI non disponibile - modalità solo playlist');
                if (currentMode !== 'playlist') {
                    switchToPlaylist();
                }
                return;
            }
            
            console.log('[Clarvs TV] Controllo stream live...');
            const liveStreams = await streamAPI.checkLiveStreams();
            
            if (liveStreams && liveStreams.length > 0) {
                // Priorità: prendi il primo stream live disponibile
                const primaryStream = liveStreams[0];
                
                if (currentMode !== 'live') {
                    console.log(`[Clarvs TV] 🔴 LIVE ATTIVA: ${primaryStream.channelName} - ${primaryStream.title}`);
                    switchToLive(primaryStream);
                }
            } else {
                if (currentMode !== 'playlist') {
                    console.log('[Clarvs TV] 📺 Torno alla playlist programmata');
                    switchToPlaylist();
                }
            }
        } catch (error) {
            console.error('[Clarvs TV] Errore nel controllo live:', error);
            // In caso di errore, assicurati che la playlist sia attiva
            if (currentMode !== 'playlist') {
                console.log('[Clarvs TV] Errore API - Avvio playlist di sicurezza');
                switchToPlaylist();
            }
        }
    }
    
    /**
     * Passa alla modalità live
     */
    function switchToLive(stream) {
        currentMode = 'live';
        
        tvScreen.innerHTML = `
            <iframe
                src="${stream.embedUrl}"
                frameborder="0" 
                allow="autoplay; fullscreen" 
                allowfullscreen
                title="${stream.channelName} Live Stream">
            </iframe>
        `;
        
        updateStreamStatus(true, stream);
        showLiveNotification(stream);
    }
    
    /**
     * Passa alla modalità playlist
     */
    function switchToPlaylist() {
        currentMode = 'playlist';
        showSyncedTV();
        
        // Aggiorna ogni 30 secondi per mantenere la sincronizzazione
        if (window.playlistInterval) {
            clearInterval(window.playlistInterval);
        }
        window.playlistInterval = setInterval(showSyncedTV, 30000);
    }
    
    /**
     * Mostra notifica quando va in live
     */
    function showLiveNotification(stream) {
        // Crea notifica
        const notification = document.createElement('div');
        notification.className = 'live-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-broadcast-tower"></i>
                <div>
                    <strong>🔴 LIVE ORA!</strong>
                    <p>${stream.channelName} è in diretta</p>
                    <span>${stream.title}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Rimuovi dopo 5 secondi
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    /**
     * Calcola quale video deve essere riprodotto in base all'orario corrente
     * e a quale secondo del video deve partire
     */
    function getCurrentVideoAndTime() {
        const now = new Date();
        
        // Calcola i secondi passati dall'inizio del giorno (UTC)
        const nowUTCSeconds = now.getUTCHours() * 3600 + 
                             now.getUTCMinutes() * 60 + 
                             now.getUTCSeconds();
        
        // Calcola i secondi dall'inizio della playlist
        const playlistStartSeconds = playlistStartHour * 3600 + 
                                   playlistStartMinute * 60 + 
                                   playlistStartSecond;
        
        // Calcola i secondi dall'inizio del ciclo corrente della playlist
        const totalDuration = durations.reduce((a, b) => a + b, 0);
        let secondsSincePlaylistStart = (nowUTCSeconds - playlistStartSeconds + totalDuration) % totalDuration;
        
        // Trova il video corretto e il punto di inizio
        let videoIndex = 0;
        let secondsIntoVideo = secondsSincePlaylistStart;
        
        while (videoIndex < durations.length && secondsIntoVideo >= durations[videoIndex]) {
            secondsIntoVideo -= durations[videoIndex];
            videoIndex++;
        }
        
        // Debug: mostra informazioni nella console
        console.log(`[TV Sync] Ora UTC: ${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}`);
        console.log(`[TV Sync] Riproduco video ${videoIndex + 1}/${playlistVideos.length} (ID: ${playlistVideos[videoIndex]})`);
        console.log(`[TV Sync] Al secondo: ${Math.floor(secondsIntoVideo)}/${durations[videoIndex]}`);
        
        return { 
            videoId: playlistVideos[videoIndex], 
            start: Math.floor(secondsIntoVideo)
        };
    }

    /**
     * Mostra il video corretto nella TV in base all'orario sincronizzato
     */
    function showSyncedTV() {
        try {
            const { videoId, start } = getCurrentVideoAndTime();
            
            console.log(`[TV Sync] Caricamento video: https://www.youtube.com/embed/${videoId}`);
            
            // Crea l'iframe YouTube con i parametri per:
            // - autoplay
            // - partire dal secondo corretto
            // - nascondere i controlli
            // - disabilitare la tastiera
            // - minimizzare i branding
            // - disabilitare i video correlati
            tvScreen.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&start=${start}&controls=0&disablekb=1&modestbranding=1&rel=0&enablejsapi=1"
                    frameborder="0" 
                    allow="autoplay; fullscreen" 
                    allowfullscreen
                    width="100%"
                    height="100%"
                    title="Clarvs TV Player">
                </iframe>
            `;
            
            // Aggiorna lo stato
            updateStreamStatus(false); // false perché è playlist, non live
            
            console.log(`[TV Sync] Video caricato con successo`);
            
        } catch (error) {
            console.error("[TV Sync] Errore nel caricamento del video:", error);
            
            // Mostra un messaggio di errore con opzione di ricarica manuale
            tvScreen.innerHTML = `
                <div class="tv-error" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; background: #111; color: white; text-align: center;">
                    <h3>⚠️ Errore nel caricamento</h3>
                    <p>Impossibile caricare il contenuto della playlist</p>
                    <button onclick="location.reload()" style="background: #00bcd4; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px; cursor: pointer;">
                        🔄 Ricarica Pagina
                    </button>
                </div>
            `;
            
            updateStreamStatus(false);
        }
    }

    /**
     * Aggiorna lo stato dello stream
     */
    function updateStreamStatus(isLive, streamInfo = null) {
        if (isLive && streamInfo) {
            streamStatus.innerHTML = `
                <span class="dot live"></span>
                <span>🔴 LIVE: ${streamInfo.channelName}</span>
            `;
            streamStatus.className = 'stream-status live';
        } else if (isLive) {
            streamStatus.innerHTML = `
                <span class="dot live"></span>
                <span>🔴 LIVE: Streaming attivo</span>
            `;
            streamStatus.className = 'stream-status live';
        } else {
            streamStatus.innerHTML = `
                <span class="dot"></span>
                <span>📺 Playlist programmata</span>
            `;
            streamStatus.className = 'stream-status';
        }
    }
    
    /**
     * Inizializza i controlli della TV
     */
    function initializeControls() {
        // Bottone fullscreen migliorato
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                toggleFullscreen();
            });
        }
        
        // Controllo manuale per forzare check live
        const forceCheckBtn = document.createElement('button');
        forceCheckBtn.textContent = 'Controlla Live';
        forceCheckBtn.className = 'force-check-btn';
        forceCheckBtn.addEventListener('click', checkAndSwitchMode);
        
        if (document.querySelector('.tv-controls')) {
            document.querySelector('.tv-controls').appendChild(forceCheckBtn);
        }
        
        // Gestione eventi fullscreen
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    }
    
    /**
     * Gestisce il toggle fullscreen
     */
    function toggleFullscreen() {
        const tvContainer = document.querySelector('.tv-container');
        
        if (!tvContainer) {
            console.error('[Clarvs TV] Container non trovato per fullscreen');
            return;
        }
        
        try {
            if (!document.fullscreenElement && 
                !document.webkitFullscreenElement && 
                !document.mozFullScreenElement) {
                
                // Entra in fullscreen
                if (tvContainer.requestFullscreen) {
                    tvContainer.requestFullscreen();
                } else if (tvContainer.webkitRequestFullscreen) {
                    tvContainer.webkitRequestFullscreen();
                } else if (tvContainer.mozRequestFullScreen) {
                    tvContainer.mozRequestFullScreen();
                } else {
                    console.warn('[Clarvs TV] Fullscreen non supportato');
                }
            } else {
                // Esci da fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                }
            }
        } catch (error) {
            console.error('[Clarvs TV] Errore fullscreen:', error);
        }
    }
    
    /**
     * Gestisce i cambiamenti di stato fullscreen
     */
    function handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement);
        
        if (fullscreenBtn) {
            fullscreenBtn.textContent = isFullscreen ? 'Esci da Schermo Intero' : 'Schermo Intero';
        }
        
        console.log(`[Clarvs TV] Fullscreen: ${isFullscreen ? 'ON' : 'OFF'}`);
    }

    // --- INIZIALIZZAZIONE ---
    
    // Inizializza la TV con controllo live/playlist
    initializeTV();
    
    // Debug
    console.log("[Clarvs TV] Sistema inizializzato con controllo live automatico");
});