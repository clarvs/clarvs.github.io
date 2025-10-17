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
    
    // --- CONFIGURAZIONE CANALI LIVE ---
    const LIVE_CHANNELS = {
        clarvs: {
            name: 'Clarvs',
            platform: 'youtube',
            channelId: 'UCxxxxxxxxxxxx', // Sarà estratto dinamicamente
            channelUrl: 'https://www.youtube.com/@clarvs',
            checkUrl: 'https://www.youtube.com/@clarvs/live'
        },
        bettatv: {
            name: 'BettaTV',
            platform: 'twitch',
            channelName: 'bettatv',
            channelUrl: 'https://www.twitch.tv/bettatv'
        }
    };

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
        
        // Controlla subito se ci sono stream live (con delay per permettere il caricamento)
        setTimeout(() => {
            checkAndSwitchMode();
        }, 3000);
        
        // Imposta controllo periodico ogni 90 secondi
        liveCheckInterval = setInterval(checkAndSwitchMode, 90000);
        
        // Inizializza controlli
        initializeControls();
        
        console.log('[Clarvs TV] Inizializzazione completata con controllo live automatico');
    }
    
    /**
     * Controlla se ci sono stream live attivi (senza API)
     */
    async function checkLiveStreams() {
        console.log('[Live Check] Controllo stream live...');
        const liveStreams = [];

        try {
            // Controlla YouTube Clarvs
            const youtubeStatus = await checkYouTubeLive();
            if (youtubeStatus.isLive) {
                liveStreams.push({
                    channel: 'clarvs',
                    platform: 'youtube',
                    title: youtubeStatus.title || 'Live Stream',
                    embedUrl: youtubeStatus.embedUrl,
                    channelName: 'Clarvs'
                });
            }

            // Controlla Twitch BettaTV
            const twitchStatus = await checkTwitchLive();
            if (twitchStatus.isLive) {
                liveStreams.push({
                    channel: 'bettatv',
                    platform: 'twitch',
                    title: twitchStatus.title || 'Live Stream',
                    embedUrl: twitchStatus.embedUrl,
                    channelName: 'BettaTV'
                });
            }

        } catch (error) {
            console.error('[Live Check] Errore nel controllo live:', error);
        }

        return liveStreams;
    }

    /**
     * Controlla se Clarvs è live su YouTube (senza API)
     */
    async function checkYouTubeLive() {
        try {
            console.log('[YouTube Check] Controllo Clarvs...');
            
            // Prova a caricare la pagina live
            const response = await fetch('https://www.youtube.com/@clarvs/live', {
                method: 'HEAD',
                mode: 'no-cors'
            });

            // Metodo alternativo: controlla tramite iframe test
            return new Promise((resolve) => {
                const testFrame = document.createElement('iframe');
                testFrame.style.display = 'none';
                testFrame.style.position = 'absolute';
                testFrame.style.width = '1px';
                testFrame.style.height = '1px';
                
                // URL che reindirizza alla live se attiva
                testFrame.src = 'https://www.youtube.com/@clarvs/live';
                
                testFrame.onload = () => {
                    try {
                        // Se l'iframe carica senza errori, potrebbe esserci una live
                        setTimeout(() => {
                            // Controlla se l'URL dell'iframe è cambiato (indica live attiva)
                            try {
                                const currentSrc = testFrame.contentWindow?.location?.href;
                                if (currentSrc && currentSrc.includes('/watch?v=')) {
                                    const videoId = currentSrc.split('v=')[1]?.split('&')[0];
                                    if (videoId) {
                                        resolve({
                                            isLive: true,
                                            title: 'Clarvs Live Stream',
                                            embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`
                                        });
                                        testFrame.remove();
                                        return;
                                    }
                                }
                            } catch (e) {
                                console.log('[YouTube Check] CORS limitation, usando metodo alternativo');
                            }
                            
                            // Metodo fallback: prova a caricare embed live diretto
                            checkYouTubeLiveAlternative().then(resolve);
                            testFrame.remove();
                        }, 2000);
                    } catch (error) {
                        resolve({ isLive: false });
                        testFrame.remove();
                    }
                };

                testFrame.onerror = () => {
                    resolve({ isLive: false });
                    testFrame.remove();
                };

                document.body.appendChild(testFrame);
            });

        } catch (error) {
            console.log('[YouTube Check] Errore:', error);
            return { isLive: false };
        }
    }

    /**
     * Metodo alternativo per YouTube usando embed test
     */
    async function checkYouTubeLiveAlternative() {
        return new Promise((resolve) => {
            // Testa l'embed live diretto
            const testEmbed = document.createElement('iframe');
            testEmbed.style.display = 'none';
            testEmbed.style.position = 'absolute';
            testEmbed.style.width = '1px';
            testEmbed.style.height = '1px';
            
            // URL embed per il canale live
            testEmbed.src = 'https://www.youtube.com/embed/live_stream?channel=UCpCdPCwKOJmMPRWsVA2ljQ&autoplay=0&mute=1';
            
            testEmbed.onload = () => {
                setTimeout(() => {
                    // Se l'embed si carica senza errori, assume live attiva
                    resolve({
                        isLive: true,
                        title: 'Clarvs Live Stream',
                        embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCpCdPCwKOJmMPRWsVA2ljQ&autoplay=1&mute=0'
                    });
                    testEmbed.remove();
                }, 1500);
            };

            testEmbed.onerror = () => {
                resolve({ isLive: false });
                testEmbed.remove();
            };

            document.body.appendChild(testEmbed);
        });
    }

    /**
     * Controlla se BettaTV è live su Twitch (senza API) - Metodo migliorato
     */
    async function checkTwitchLive() {
        try {
            console.log('[Twitch Check] Controllo BettaTV...');
            
            // Prova prima il metodo di fetch della pagina Twitch
            try {
                const response = await fetch('https://www.twitch.tv/bettatv', {
                    method: 'HEAD',
                    mode: 'no-cors'
                });
                console.log('[Twitch Check] Fetch response ricevuta');
            } catch (e) {
                console.log('[Twitch Check] Fetch bloccata da CORS, uso metodo alternativo');
            }
            
            return new Promise((resolve) => {
                // Metodo 1: Prova a caricare la pagina Twitch in un iframe invisibile
                const testFrame = document.createElement('iframe');
                testFrame.style.display = 'none';
                testFrame.style.position = 'absolute';
                testFrame.style.width = '1px';
                testFrame.style.height = '1px';
                
                // Carica la pagina del canale (non il player)
                testFrame.src = 'https://www.twitch.tv/bettatv';
                
                let resolved = false;
                
                testFrame.onload = () => {
                    if (resolved) return;
                    
                    setTimeout(() => {
                        if (resolved) return;
                        
                        // Prova metodo 2: Test del player embed con parametri specifici per live
                        testPlayerEmbed(resolve);
                        testFrame.remove();
                    }, 3000);
                };

                testFrame.onerror = () => {
                    if (resolved) return;
                    resolved = true;
                    console.log('[Twitch Check] Errore caricamento pagina Twitch');
                    resolve({ isLive: false });
                    testFrame.remove();
                };

                document.body.appendChild(testFrame);
                
                // Timeout di sicurezza
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        console.log('[Twitch Check] Timeout - assumo non live');
                        resolve({ isLive: false });
                        testFrame.remove();
                    }
                }, 8000);
            });

        } catch (error) {
            console.log('[Twitch Check] Errore:', error);
            return { isLive: false };
        }
    }
    
    /**
     * Testa il player embed Twitch con controlli più specifici
     */
    function testPlayerEmbed(resolve) {
        const playerTest = document.createElement('iframe');
        playerTest.style.display = 'none';
        playerTest.style.position = 'absolute';
        playerTest.style.width = '1px';
        playerTest.style.height = '1px';
        
        // Usa parametri che dovrebbero funzionare solo con live stream attive
        const hostname = window.location.hostname || 'localhost';
        playerTest.src = `https://player.twitch.tv/?channel=bettatv&parent=${hostname}&muted=true&autoplay=false&allowfullscreen=false`;
        
        let playerResolved = false;
        
        playerTest.onload = () => {
            if (playerResolved) return;
            
            setTimeout(() => {
                if (playerResolved) return;
                playerResolved = true;
                
                // Se il player si carica, potrebbe essere live, ma non è garantito
                // Per ora assumiamo che NON sia live per evitare falsi positivi
                console.log('[Twitch Check] Player caricato ma assumo non live (evito falsi positivi)');
                resolve({ isLive: false });
                playerTest.remove();
            }, 2000);
        };

        playerTest.onerror = () => {
            if (playerResolved) return;
            playerResolved = true;
            console.log('[Twitch Check] Errore player - non live');
            resolve({ isLive: false });
            playerTest.remove();
        };

        document.body.appendChild(playerTest);
    }

    /**
     * Controlla stream live e cambia modalità se necessario
     */
    async function checkAndSwitchMode() {
        try {
            console.log('[Clarvs TV] Controllo stream live...');
            const liveStreams = await checkLiveStreams();
            
            if (liveStreams && liveStreams.length > 0) {
                // Priorità: YouTube Clarvs prima di Twitch BettaTV
                const primaryStream = liveStreams.find(s => s.channel === 'clarvs') || liveStreams[0];
                
                if (currentMode !== 'live' || currentLiveStream?.channel !== primaryStream.channel) {
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
                console.log('[Clarvs TV] Errore controllo - Avvio playlist di sicurezza');
                switchToPlaylist();
            }
        }
    }
    
    let currentLiveStream = null; // Traccia lo stream live corrente

    /**
     * Passa alla modalità live
     */
    function switchToLive(stream) {
        currentMode = 'live';
        currentLiveStream = stream;
        
        console.log(`[Clarvs TV] Switching to live: ${stream.channelName} (${stream.platform})`);
        
        tvScreen.innerHTML = `
            <iframe
                src="${stream.embedUrl}"
                frameborder="0" 
                allow="autoplay; fullscreen; microphone; camera" 
                allowfullscreen
                width="100%"
                height="100%"
                title="${stream.channelName} Live Stream">
            </iframe>
        `;
        
        updateStreamStatus(true, stream);
        showLiveNotification(stream);
        
        // Ferma l'aggiornamento della playlist
        if (window.playlistInterval) {
            clearInterval(window.playlistInterval);
        }
    }
    
    /**
     * Passa alla modalità playlist
     */
    function switchToPlaylist() {
        currentMode = 'playlist';
        currentLiveStream = null;
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