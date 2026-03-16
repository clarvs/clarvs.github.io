// Sistema di Scouting per Clarvs - Riservato ai membri staff
class ScoutingSystem {
    constructor() {
        this.allPlayers = [];
        this.filteredPlayers = [];
        this.isDataLoaded = false;
        
        this.init();
    }
    
    init() {
        // Controlla l'accesso prima di procedere
        this.checkAccess();
        
        // Inizializza i componenti se l'utente ha accesso
        if (this.hasAccess()) {
            this.initializeComponents();
            this.loadPlayerData();
            this.bindEvents();
            this.updateQuickStats();
        }
    }
    
    checkAccess() {
        const hasAccess = this.hasAccess();
        const accessDenied = document.getElementById('access-denied');
        const staffElements = document.querySelectorAll('.staff-only');
        
        if (hasAccess) {
            // Mostra contenuto per staff
            accessDenied.style.display = 'none';
            staffElements.forEach(element => {
                element.style.display = 'block';
            });
            
            // Aggiorna messaggio di benvenuto
            this.updateWelcomeMessage();
        } else {
            // Mostra messaggio di accesso negato
            accessDenied.style.display = 'flex';
            staffElements.forEach(element => {
                element.style.display = 'none';
            });
        }
    }
    
    hasAccess() {
        return window.authSystem && window.authSystem.isStaffLoggedIn();
    }
    
    updateWelcomeMessage() {
        const welcomeElement = document.getElementById('staff-welcome');
        if (welcomeElement && window.authSystem) {
            const currentUser = window.authSystem.getCurrentUser();
            if (currentUser) {
                welcomeElement.innerHTML = `
                    <p><strong>Benvenuto ${currentUser}!</strong></p>
                    <p>Sistema di scouting riservato allo staff di Clarvs</p>
                `;
            }
        }
    }
    
    initializeComponents() {
        // Inizializza elementi DOM
        this.searchInput = document.getElementById('player-search');
        this.roleFilter = document.getElementById('role-filter');
        this.gameFilter = document.getElementById('game-filter');
        this.sortFilter = document.getElementById('sort-filter');
        this.searchBtn = document.getElementById('search-btn');
        this.clearBtn = document.getElementById('clear-search');
        this.playersGrid = document.getElementById('players-grid');
        this.resultsHeader = document.getElementById('results-header');
        this.resultsCount = document.getElementById('results-count');
        this.playerModal = document.getElementById('player-modal');
        this.modalPlayerName = document.getElementById('modal-player-name');
        this.modalPlayerContent = document.getElementById('modal-player-content');
        this.modalClose = document.querySelector('.player-modal-close');
        
        console.log('🎯 Scouting System: Componenti inizializzati');
    }
    
    loadPlayerData() {
        // Carica i dati dei giocatori dal roster esistente
        if (window.ClarvsRoster && window.ClarvsRoster.rosterData) {
            const rosterData = window.ClarvsRoster.rosterData;
            
            this.allPlayers = [
                ...rosterData.proPlayers || [],
                ...rosterData.contentCreators || [],
                ...rosterData.staff || [],
                ...rosterData.coaches || []
            ];
            
            this.filteredPlayers = [...this.allPlayers];
            this.isDataLoaded = true;
            
            console.log(`🎯 Scouting: Caricati ${this.allPlayers.length} giocatori`);
        } else {
            console.warn('🎯 Scouting: Dati roster non disponibili, riprovo tra 1 secondo...');
            setTimeout(() => this.loadPlayerData(), 1000);
        }
    }
    
    bindEvents() {
        // Eventi di ricerca
        let searchTimeout;
        this.searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch();
            }, 300);
        });
        
        this.searchBtn?.addEventListener('click', () => {
            this.performSearch();
        });
        
        // Eventi filtri
        this.roleFilter?.addEventListener('change', () => {
            this.performSearch();
        });
        
        this.gameFilter?.addEventListener('change', () => {
            this.performSearch();
        });
        
        this.sortFilter?.addEventListener('change', () => {
            this.performSearch();
        });
        
        // Pulisci ricerca
        this.clearBtn?.addEventListener('click', () => {
            this.clearSearch();
        });
        
        // Login redirect
        document.getElementById('login-redirect')?.addEventListener('click', () => {
            if (window.authSystem) {
                window.authSystem.showLoginModal();
            }
        });
        
        // Eventi modale giocatore
        this.modalClose?.addEventListener('click', () => {
            this.hidePlayerModal();
        });
        
        this.playerModal?.addEventListener('click', (e) => {
            if (e.target === this.playerModal) {
                this.hidePlayerModal();
            }
        });
        
        // Ricontrolla accesso periodicamente
        setInterval(() => {
            this.checkAccess();
        }, 2000);
    }
    
    performSearch() {
        if (!this.isDataLoaded) {
            console.warn('🎯 Dati non ancora caricati');
            return;
        }
        
        const searchTerm = this.searchInput?.value.toLowerCase().trim() || '';
        const roleFilter = this.roleFilter?.value || '';
        const gameFilter = this.gameFilter?.value || '';
        const sortFilter = this.sortFilter?.value || 'name-asc';
        
        // Filtra
        this.filteredPlayers = this.allPlayers.filter(player => {
            const matchesSearch = !searchTerm || 
                player.name.toLowerCase().includes(searchTerm) ||
                player.role.toLowerCase().includes(searchTerm) ||
                (player.game && player.game.toLowerCase().includes(searchTerm));
            
            const matchesRole = !roleFilter || player.role === roleFilter;
            const matchesGame = !gameFilter || player.game === gameFilter;
            
            return matchesSearch && matchesRole && matchesGame;
        });
        
        // Ordina
        this.filteredPlayers.sort((a, b) => {
            switch (sortFilter) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'role-asc':
                    return a.role.localeCompare(b.role);
                default:
                    return 0;
            }
        });
        
        this.displayResults();
    }
    
    displayResults() {
        if (!this.playersGrid) return;
        
        // Mostra/nascondi header risultati
        const isSearchActive = this.searchInput?.value.trim() || 
                              this.roleFilter?.value || 
                              this.gameFilter?.value;
        
        if (isSearchActive) {
            this.resultsHeader.style.display = 'flex';
            this.resultsCount.textContent = `Trovati ${this.filteredPlayers.length} giocatori`;
        } else {
            this.resultsHeader.style.display = 'none';
        }
        
        // Mostra risultati
        if (this.filteredPlayers.length === 0) {
            this.playersGrid.innerHTML = isSearchActive ? `
                <div class="no-results">
                    <i class="fas fa-search-minus"></i>
                    <p>Nessun giocatore trovato con i criteri di ricerca</p>
                </div>
            ` : `
                <div class="initial-message">
                    <i class="fas fa-search-plus"></i>
                    <p>Utilizza la barra di ricerca per trovare giocatori nel team</p>
                </div>
            `;
        } else {
            const playersHTML = this.filteredPlayers.map(player => 
                this.createPlayerCard(player)
            ).join('');
            
            this.playersGrid.innerHTML = playersHTML;
            
            // Aggiungi eventi alle card
            this.bindPlayerCardEvents();
        }
    }
    
    createPlayerCard(player) {
        const socialLinks = player.social ? Object.entries(player.social)
            .map(([platform, url]) => `
                <a href="${url}" target="_blank" class="social-link" title="${platform}">
                    <i class="fab fa-${platform}"></i>
                </a>
            `).join('') : '';
        
        const hasStats = player.tracker && player.tracker.stats;
        const stats = hasStats ? player.tracker.stats : null;
        
        const statsHTML = hasStats ? `
            <div class="player-stats">
                <div class="stats-row">
                    <span>Vittorie:</span>
                    <span class="stat-value">${stats.wins || 0}</span>
                </div>
                <div class="stats-row">
                    <span>Eliminazioni:</span>
                    <span class="stat-value">${stats.kills || 0}</span>
                </div>
                <div class="stats-row">
                    <span>K/D Ratio:</span>
                    <span class="stat-value">${stats.kd || '0.00'}</span>
                </div>
                <div class="stats-row">
                    <span>Partite:</span>
                    <span class="stat-value">${stats.matches || 0}</span>
                </div>
            </div>
        ` : '<p class="no-stats">Statistiche non disponibili</p>';
        
        return `
            <div class="player-card" data-player="${player.name}">
                <div class="player-card-header">
                    <div class="player-avatar">
                        <img src="${player.image}" alt="${player.name}" onload="this.classList.add('loaded')">
                    </div>
                    <div class="player-info">
                        <h3>${player.name}</h3>
                        <p class="player-role">${player.role}</p>
                        ${player.game ? `<p class="player-game">${player.game}</p>` : ''}
                    </div>
                </div>
                <div class="player-details">
                    <div class="player-social">
                        ${socialLinks || '<span class="no-social">Social non disponibili</span>'}
                    </div>
                    ${statsHTML}
                </div>
            </div>
        `;
    }
    
    bindPlayerCardEvents() {
        const cards = document.querySelectorAll('.player-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Evita click sui link social
                if (e.target.closest('.social-link')) return;
                
                const playerName = card.dataset.player;
                this.showPlayerDetails(playerName);
            });
        });
    }
    
    showPlayerDetails(playerName) {
        const player = this.allPlayers.find(p => p.name === playerName);
        if (!player) return;
        
        this.modalPlayerName.textContent = `Dettagli: ${player.name}`;
        
        const socialLinks = player.social ? Object.entries(player.social)
            .map(([platform, url]) => `
                <a href="${url}" target="_blank" class="modal-social-link" title="${platform}">
                    <i class="fab fa-${platform}"></i>
                </a>
            `).join('') : '<span style="color: #666; font-style: italic;">Nessun social disponibile</span>';
        
        const hasStats = player.tracker && player.tracker.stats;
        const stats = hasStats ? player.tracker.stats : null;
        
        const statsSection = hasStats ? `
            <div class="modal-stats-section">
                <h3 class="modal-stats-title">
                    <i class="fas fa-chart-line"></i>
                    Statistiche di Gioco
                </h3>
                <div class="modal-stats-grid">
                    <div class="modal-stat-item">
                        <span class="modal-stat-value">${stats.wins || 0}</span>
                        <div class="modal-stat-label">Vittorie</div>
                    </div>
                    <div class="modal-stat-item">
                        <span class="modal-stat-value">${stats.kills || 0}</span>
                        <div class="modal-stat-label">Eliminazioni</div>
                    </div>
                    <div class="modal-stat-item">
                        <span class="modal-stat-value">${stats.kd || '0.00'}</span>
                        <div class="modal-stat-label">K/D Ratio</div>
                    </div>
                    <div class="modal-stat-item">
                        <span class="modal-stat-value">${stats.matches || 0}</span>
                        <div class="modal-stat-label">Partite</div>
                    </div>
                </div>
                ${player.tracker.username ? `
                    <div class="modal-tracker-info">
                        <strong>Tracker Username:</strong> ${player.tracker.username}
                        ${player.tracker.platform ? `<br><strong>Piattaforma:</strong> ${player.tracker.platform}` : ''}
                        ${player.tracker.region ? `<br><strong>Regione:</strong> ${player.tracker.region}` : ''}
                    </div>
                ` : ''}
            </div>
        ` : `
            <div class="modal-stats-section">
                <h3 class="modal-stats-title">
                    <i class="fas fa-chart-line"></i>
                    Statistiche di Gioco
                </h3>
                <div class="modal-no-stats">
                    <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p>Statistiche non disponibili per questo giocatore</p>
                </div>
            </div>
        `;
        
        this.modalPlayerContent.innerHTML = `
            <div class="modal-player-card">
                <div class="modal-player-avatar">
                    <img src="${player.image}" alt="${player.name}">
                </div>
                <div class="modal-player-info">
                    <h3>${player.name}</h3>
                    <p class="modal-player-role">${player.role}</p>
                    ${player.game ? `<p class="modal-player-game">${player.game}</p>` : ''}
                    <div class="modal-social-links">
                        <strong>Social:</strong>
                        ${socialLinks}
                    </div>
                </div>
            </div>
            ${statsSection}
        `;
        
        this.playerModal.style.display = 'flex';
    }
    
    hidePlayerModal() {
        this.playerModal.style.display = 'none';
    }
    
    clearSearch() {
        if (this.searchInput) this.searchInput.value = '';
        if (this.roleFilter) this.roleFilter.value = '';
        if (this.gameFilter) this.gameFilter.value = '';
        if (this.sortFilter) this.sortFilter.value = 'name-asc';
        
        this.filteredPlayers = [...this.allPlayers];
        // Applica ordinamento di default
        this.filteredPlayers.sort((a, b) => a.name.localeCompare(b.name));
        this.displayResults();
    }
    
    updateQuickStats() {
        if (!this.isDataLoaded) {
            setTimeout(() => this.updateQuickStats(), 1000);
            return;
        }
        
        const totalPlayers = this.allPlayers.length;
        const proPlayers = this.allPlayers.filter(p => p.role === 'Pro Player').length;
        const contentCreators = this.allPlayers.filter(p => p.role === 'Content Creator').length;
        const coachesStaff = this.allPlayers.filter(p => 
            p.role === 'Coach' || p.role === 'Manager' || p.role === 'Social Media'
        ).length;
        
        document.getElementById('total-players').textContent = totalPlayers;
        document.getElementById('pro-players').textContent = proPlayers;
        document.getElementById('content-creators').textContent = contentCreators;
        document.getElementById('coaches-staff').textContent = coachesStaff;
    }
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    // Attendi che il sistema di auth sia pronto
    function initScouting() {
        if (window.authSystem) {
            window.scoutingSystem = new ScoutingSystem();
            console.log('🎯 Clarvs Scouting System inizializzato');
        } else {
            setTimeout(initScouting, 500);
        }
    }
    
    initScouting();
});