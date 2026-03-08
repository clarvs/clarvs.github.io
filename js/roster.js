document.addEventListener('DOMContentLoaded', function() {
    // Statistiche dinamiche dai server (se disponibili)
    let playerStats = {};
    let statsLoading = true;
    // Dati del roster organizzati per sezioni
    const rosterData = {
        proPlayers: [
            {
                name: 'Gabbs',
                role: 'Pro Player',
                game: 'Fortnite',
                image: '../assets/Images/players/gabbs.jpg',
                social: {
                    twitter: 'https://x.com/gabbsfn',
                    instagram: 'https://www.instagram.com/gabbsfn?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=='
                },
                tracker: {
                    url: 'https://fortnitetracker.com/profile/all/CLS%20GABBSAO/events',
                    username: 'CLS GABBSAO',
                    platform: 'all',
                    lastUpdated: null,
                    stats: {
                        wins: 0,
                        kills: 0,
                        kd: 0.0,
                        matches: 0,
                        rank: 'Unknown'
                    }
                }
            },
            {
                name: 'Iceleoh',
                role: 'Pro Player', 
                game: 'Fortnite',
                image: '../assets/Images/players/iceleoh.jpg',
                social: {
                    twitter: 'https://x.com/iceLeoh',
                    instagram: 'https://www.instagram.com/iceleoh?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=='
                },
                tracker: {
                    url: 'https://fortnitetracker.com/profile/kbm/iceleofvǃ/events?region=EU',
                    username: 'iceleofvǃ',
                    platform: 'kbm',
                    region: 'EU',
                    lastUpdated: null,
                    stats: {
                        wins: 0,
                        kills: 0,
                        kd: 0.0,
                        matches: 0,
                        rank: 'Unknown'
                    }
                }
            }
        ],
        talents: [],
        academy: [],
        contentCreator: [
            {
                name: 'BETTAtv',
                role: 'Content Creator',
                game: 'Content Creator',
                image: '../assets/Images/players/bettatv.jpg',
                social: {
                    instagram: 'https://www.instagram.com/bettatv_/',
                    youtube: 'https://www.youtube.com/@BETTAtv13',
                    twitch: 'https://www.twitch.tv/bettatv'
                }
            },
            {
                name: 'Mafix',
                role: 'Content Creator',
                game: 'Content Creator',
                image: '../assets/Images/players/mafix.jpg',
                social: {
                    tiktok: 'https://www.tiktok.com/@mafixfnrr?_r=1&_t=ZN-919L650SA5u',
                    instagram: 'https://www.instagram.com/mafix_w/'
                }
            }
        ]
    };

    const rosterContainer = document.getElementById('roster-grid');
    
    // === FUNZIONI STATS DINAMICHE ===
    
    /**
     * Carica le statistiche dei giocatori dall'API o da file JSON
     * Supporta sia server locale (con API) che GitHub Pages (file statico)
     */
    async function loadPlayerStats() {
        try {
            console.log('🎯 Caricamento stats giocatori...');
            statsLoading = true;
            
            let data = null;
            
            // Prova prima l'API (per server locale con Express)
            try {
                console.log('📡 Tentativo caricamento da API...');
                const apiResponse = await fetch('/api/players/stats');
                if (apiResponse.ok) {
                    data = await apiResponse.json();
                    console.log('✅ Dati caricati da API');
                } else {
                    throw new Error(`API response: ${apiResponse.status}`);
                }
            } catch (apiError) {
                // Fallback: carica direttamente il file JSON (per GitHub Pages)
                console.log('⚠️ API non disponibile, carico file JSON diretto');
                console.log('📄 Caricamento da: /scraper/data/player-stats.json');
                const jsonResponse = await fetch('/scraper/data/player-stats.json');
                data = await jsonResponse.json();
                console.log('✅ Dati caricati da file JSON statico');
            }
            
            console.log('📦 Dati ricevuti:', data);
            
            if (data && data.players) {
                // Converte array in oggetto per lookup rapido
                playerStats = {};
                data.players.forEach(player => {
                    playerStats[player.name] = player;
                    console.log(`👤 Player caricato: ${player.name}`, player);
                });
                
                console.log('✅ Stats caricate:', Object.keys(playerStats));
                console.log('📊 Player stats object:', playerStats);
                
                // Aggiorna UI se necessario
                updateStatsDisplay();
                
                // Mostra ultimo aggiornamento
                if (data.lastUpdate) {
                    showLastUpdateTime(data.lastUpdate);
                }
                
            } else {
                console.warn('⚠️ Nessuna stat disponibile nel response');
                console.log('📄 Response data:', data);
                playerStats = {};
            }
            
        } catch (error) {
            console.error('❌ Errore caricamento stats:', error);
            playerStats = {};
        } finally {
            console.log('🏁 Impostando statsLoading = false');
            statsLoading = false;
        }
    }
    
    /**
     * Aggiorna la visualizzazione delle statistiche nelle card esistenti
     */
    function updateStatsDisplay() {
        console.log('🎨 Aggiornando display stats...');
        document.querySelectorAll('.member-card').forEach(card => {
            const nameElement = card.querySelector('h3');
            const playerName = nameElement?.textContent;
            
            console.log(`🔍 Card trovata per player: "${playerName}"`);
            console.log(`📋 Player disponibili:`, Object.keys(playerStats));
            console.log(`✅ Player trovato in stats?`, playerName && playerStats[playerName] ? 'SÌ' : 'NO');
            
            // Rimuovi indicatore di caricamento
            const loadingElement = card.querySelector('.stats-loading');
            if (loadingElement) {
                console.log(`🗑️ Rimozione elemento loading per ${playerName}`);
                loadingElement.remove();
            }
            
            if (playerName && playerStats[playerName]) {
                console.log(`✅ Aggiungendo stats a ${playerName}:`, playerStats[playerName]);
                addStatsToCard(card, playerStats[playerName]);
            } else if (playerName && (playerName === 'Gabbs' || playerName === 'Iceleoh')) {
                // Mostra errore se è un pro-player ma non ha stats
                console.log(`❌ Aggiungendo error stats a ${playerName} (dati non disponibili)`);
                addErrorStatsToCard(card, playerName);
            } else {
                console.log(`🪺 Nessuna azione per ${playerName} (non è un pro-player o non ha nome)`);
            }
        });
    }
    
    /**
     * Aggiunge statistiche a una card giocatore
     */
    function addStatsToCard(card, stats) {
        // Cerca se esistono già stats nella card
        let existingStats = card.querySelector('.player-stats');
        
        if (existingStats) {
            existingStats.remove();
        }
        
        // Crea sezione stats
        const statsDiv = document.createElement('div');
        statsDiv.className = 'player-stats animate-fade-in';
        
        const timeSinceUpdate = getTimeSinceUpdate(stats.lastUpdated);
        const successIcon = stats.success ? '🟢' : '🔴';
        
        // Nuovo layout con PR, Earnings e Tornei
        statsDiv.innerHTML = `
            <div class="stats-header">
                <span class="stats-title">${successIcon} Competitive Stats</span>
                <span class="stats-update">${timeSinceUpdate}</span>
            </div>
            <div class="stats-main">
                <div class="pr-earnings-section">
                    <div class="stat-box pr-box">
                        <span class="stat-label">Power Ranking</span>
                        <span class="stat-value">${stats.stats.pr || 'N/A'}</span>
                    </div>
                    <div class="stat-box earnings-box">
                        <span class="stat-label">Earnings</span>
                        <span class="stat-value">$${formatEarnings(stats.stats.earnings || 0)}</span>
                    </div>
                </div>
                
                <div class="tournaments-section">
                    <h4 class="tournaments-title">🏆 Ultimi Tornei</h4>
                    <div class="tournaments-list">
                        ${renderTournaments(stats.stats.tournaments || [])}
                    </div>
                </div>
            </div>
            <div class="stats-footer">
                <small>📊 ${stats.platform} • Events Data</small>
            </div>
        `;
        
        // Inserisci le stats prima dei social links
        const memberInfo = card.querySelector('.member-info');
        const socialLinks = memberInfo.querySelector('.social-links');
        
        if (socialLinks) {
            memberInfo.insertBefore(statsDiv, socialLinks);
        } else {
            memberInfo.appendChild(statsDiv);
        }
    }
    
    /**
     * Aggiunge card di errore per stats non disponibili
     */
    function addErrorStatsToCard(card, playerName) {
        let existingStats = card.querySelector('.player-stats');
        
        if (existingStats) {
            existingStats.remove();
        }
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'player-stats stats-error animate-fade-in';
        
        statsDiv.innerHTML = `
            <div class="stats-header">
                <span class="stats-title">🔴 Stats non disponibili</span>
                <span class="stats-update">Aggiornamento fallito</span>
            </div>
            <div class="stats-error-message">
                <p>📊 Impossibile caricare le statistiche per ${playerName}</p>
                <small>Prossimo tentativo alle 16:00, 19:00 o 23:30</small>
            </div>
        `;
        
        const memberInfo = card.querySelector('.member-info');
        const socialLinks = memberInfo.querySelector('.social-links');
        
        if (socialLinks) {
            memberInfo.insertBefore(statsDiv, socialLinks);
        } else {
            memberInfo.appendChild(statsDiv);
        }
    }
    
    /**
     * Renderizza la lista dei tornei
     */
    function renderTournaments(tournaments) {
        if (!tournaments || tournaments.length === 0) {
            return '<div class="no-tournaments">Nessun torneo recente</div>';
        }
        
        return tournaments.slice(0, 5).map(tournament => `
            <div class="tournament-item">
                <div class="tournament-header">
                    <span class="tournament-name">${tournament.name || 'Torneo'}</span>
                    <span class="tournament-placement">#${tournament.placement || 'N/A'}</span>
                </div>
                <div class="tournament-stats">
                    <span class="tournament-kills">💀 ${tournament.kills || 0}</span>
                    <span class="tournament-points">⭐ ${tournament.points || 0} PR</span>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Formatta gli earnings
     */
    function formatEarnings(earnings) {
        if (earnings >= 1000000) {
            return (earnings / 1000000).toFixed(1) + 'M';
        } else if (earnings >= 1000) {
            return (earnings / 1000).toFixed(1) + 'K';
        } else if (earnings > 0) {
            return earnings.toString();
        }
        return '0';
    }
    
    /**
     * Mostra l'orario dell'ultimo aggiornamento generale
     */
    function showLastUpdateTime(lastUpdate) {
        // Cerca o crea elemento ultimo aggiornamento
        let updateElement = document.querySelector('.stats-last-update');
        
        if (!updateElement) {
            updateElement = document.createElement('div');
            updateElement.className = 'stats-last-update';
            rosterContainer.parentNode.insertBefore(updateElement, rosterContainer);
        }
        
        const updateTime = new Date(lastUpdate);
        const timeString = updateTime.toLocaleString();
        
        updateElement.innerHTML = `
            <div class="update-info">
                <i class="fas fa-clock"></i>
                Statistiche aggiornate: <strong>${timeString}</strong>
                <small>(Prossimo aggiornamento: 16:00, 19:00, 23:30)</small>
            </div>
        `;
    }
    
    /**
     * Calcola tempo trascorso dall'ultimo aggiornamento
     */
    function getTimeSinceUpdate(lastUpdated) {
        if (!lastUpdated) return 'Mai aggiornato';
        
        const now = new Date();
        const updated = new Date(lastUpdated);
        const diffMs = now - updated;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
            return `${diffHours}h ${diffMins}m fa`;
        } else if (diffMins > 0) {
            return `${diffMins}m fa`;
        } else {
            return 'Appena aggiornato';
        }
    }
    
    /**
     * Formatta numeri grandi con separatori
     */
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    // Funzione per ottenere l'icona social appropriata
    function getSocialIcon(platform) {
        const icons = {
            twitter: 'fab fa-twitter',
            instagram: 'fab fa-instagram',
            twitch: 'fab fa-twitch',
            youtube: 'fab fa-youtube',
            discord: 'fab fa-discord',
            tiktok: 'fab fa-tiktok'
        };
        return icons[platform] || 'fas fa-link';
    }
    
    // Funzione per ottenere il colore del ruolo
    function getRoleColor(role) {
        const colors = {
            'Pro Player': '#FF6B6B',
            'Talent': '#9B59B6',
            'Academy': '#2ECC71',
            'Content Creator': '#F39C12'
        };
        return colors[role] || '#00bcd4';
    }
    
    // Crea le sezioni
    Object.entries(rosterData).forEach(([sectionKey, members], sectionIndex) => {
        // Crea contenitore della sezione
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'roster-section';
        
        // Crea titolo della sezione
        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace(/([A-Z])/g, ' $1');
        sectionDiv.appendChild(sectionTitle);
        
        // Crea griglia per i membri della sezione
        const sectionGrid = document.createElement('div');
        sectionGrid.className = 'roster-grid';
        
        // Se la sezione è vuota, mostra un messaggio
        if (members.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-section-message';
            emptyMessage.textContent = 'Coming soon...';
            emptyMessage.style.cssText = 'text-align: center; color: #888; font-style: italic; padding: 2rem;';
            sectionGrid.appendChild(emptyMessage);
        } else {
            // Aggiungi membri alla sezione
            members.forEach((member, memberIndex) => {
                const memberCard = document.createElement('div');
                memberCard.className = 'member-card hover-lift';
                memberCard.style.animationDelay = `${(sectionIndex * 3 + memberIndex) * 0.1}s`;
                
                // Genera i link social dinamicamente
                let socialLinks = '';
                Object.entries(member.social).forEach(([platform, url]) => {
                    if (url && url !== '#') {
                        socialLinks += `<a href="${url}" target="_blank" title="${platform}"><i class="${getSocialIcon(platform)}"></i></a>`;
                    }
                });
                
                // Determina se è un pro-player per le stats
                const isProPlayer = sectionKey === 'proPlayers' && member.tracker;
                
                memberCard.innerHTML = `
                    <div class="member-image" style="background-image: url('${member.image}'); background-color: #333;"></div>
                    <div class="member-info">
                        <h3>${member.name}</h3>
                        <p class="role" style="color: ${getRoleColor(member.role)};">${member.role}</p>
                        <p class="game">${member.game}</p>
                        ${isProPlayer ? '<div class="stats-loading">🔄 Caricamento stats...</div>' : ''}
                        <div class="social-links">
                            ${socialLinks || '<span class="no-social">Social coming soon...</span>'}
                        </div>
                    </div>
                `;
                
                sectionGrid.appendChild(memberCard);
            });
        }
        
        sectionDiv.appendChild(sectionGrid);
        rosterContainer.appendChild(sectionDiv);
    });
    
    // Aggiungi animazioni di entrata
    const cards = document.querySelectorAll('.member-card');
    cards.forEach((card, index) => {
        card.classList.add('animate-scale-in');
    });
    
    // === AVVIO SISTEMA STATS ===
    
    // Carica stats al caricamento della pagina
    setTimeout(() => {
        loadPlayerStats();
    }, 1000); // Delay per permettere il render delle card
    
    // Ricarica stats ogni 10 minuti per aggiornamenti in tempo reale
    setInterval(() => {
        loadPlayerStats();
    }, 10 * 60 * 1000);
    
    // Inizializza funzionalità staff
    initStaffFeatures();
    
    // Esponi funzioni globalmente per debug/testing
    window.ClarvsRoster = {
        loadPlayerStats,
        updateStatsDisplay,
        playerStats,
        rosterData
    };
    
    console.log('🎮 Clarvs Roster System inizializzato');
    console.log('📊 Stats system attivo per pro-players');
    
    // Esponi funzioni globalmente per debug/testing
    window.ClarvsRoster = {
        loadPlayerStats,
        updateStatsDisplay,
        playerStats,
        rosterData
    };
});