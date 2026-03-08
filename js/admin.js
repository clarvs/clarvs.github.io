/**
 * Admin System - Pannello Admin Clarvs
 * Tab Roster: CRUD completo player da roster.json via API
 * Tab Scouting: Scouting talenti Fortnite Tracker
 */

// ─── SCOUTING SYSTEM ─────────────────────────────────────────────────────────

class ScoutingSystem {
    constructor() {
        this.talentData = null;
        this.configuredUrls = [];
        this.pollInterval = null;
        this.initComponents();
        this.bindEvents();
        this.loadData();
    }

    initComponents() {
        this.urlInput        = document.getElementById('talent-url-input');
        this.addUrlBtn       = document.getElementById('add-url-btn');
        this.urlList         = document.getElementById('url-list');
        this.runScrapingBtn  = document.getElementById('run-scraping-btn');
        this.scrapingStatus  = document.getElementById('scraping-status');
        this.talentLboard    = document.getElementById('talent-leaderboard');
        this.leaderboardInfo = document.getElementById('leaderboard-info');
        this.lookupInput     = document.getElementById('lookup-url-input');
        this.lookupBtn       = document.getElementById('lookup-btn');
        this.lookupStatus    = document.getElementById('lookup-status');
    }

    bindEvents() {
        this.addUrlBtn?.addEventListener('click', () => this.addUrl());
        this.urlInput?.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.addUrl();
        });
        this.runScrapingBtn?.addEventListener('click', () => this.runScraping());

        this.lookupBtn?.addEventListener('click', () => this.lookupPlayer());
        this.lookupInput?.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.lookupPlayer();
        });

        document.querySelector('.player-modal-close')?.addEventListener('click', () => {
            document.getElementById('player-modal').style.display = 'none';
        });
        document.getElementById('player-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('player-modal')) {
                document.getElementById('player-modal').style.display = 'none';
            }
        });
    }

    async loadData() {
        await Promise.all([this.loadUrls(), this.loadTalentStats()]);
    }

    async loadUrls() {
        try {
            const res = await fetch('/api/talents/urls');
            if (res.ok) {
                const data = await res.json();
                this.configuredUrls = data.urls || [];
                this._setScoutingReadonly(false);
            } else {
                this.configuredUrls = [];
                this._setScoutingReadonly(true);
            }
        } catch {
            this.configuredUrls = [];
            this._setScoutingReadonly(true);
        }
        this.renderUrlList();
    }

    _setScoutingReadonly(readonly) {
        const existing = document.getElementById('scouting-readonly-banner');
        if (!readonly) {
            if (existing) existing.remove();
            if (this.urlInput)      this.urlInput.disabled = false;
            if (this.addUrlBtn)     { this.addUrlBtn.disabled = false; this.addUrlBtn.style.opacity = ''; }
            if (this.runScrapingBtn){ this.runScrapingBtn.disabled = false; this.runScrapingBtn.style.opacity = ''; }
            return;
        }
        if (!existing && this.scrapingStatus) {
            const banner = document.createElement('div');
            banner.id = 'scouting-readonly-banner';
            banner.style.cssText = `
                background: rgba(243,156,18,0.15); border: 1px solid rgba(243,156,18,0.4);
                border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem;
                color: #f39c12; font-size: 0.9rem; display: flex; align-items: center; gap: 0.6rem;
            `;
            banner.innerHTML = `<i class="fas fa-info-circle"></i> <span>Modalità sola lettura — avvia il server in locale (<code>node server.js</code>) per gestire lo scouting.</span>`;
            this.scrapingStatus.parentElement?.insertBefore(banner, this.scrapingStatus.parentElement.firstChild);
        }
        if (this.urlInput)      this.urlInput.disabled = true;
        if (this.addUrlBtn)     { this.addUrlBtn.disabled = true; this.addUrlBtn.style.opacity = '0.4'; }
        if (this.runScrapingBtn){ this.runScrapingBtn.disabled = true; this.runScrapingBtn.style.opacity = '0.4'; }
    }

    async loadTalentStats() {
        try {
            try {
                const res = await fetch('/api/talents/stats');
                if (res.ok) {
                    this.talentData = await res.json();
                    this.renderLeaderboard();
                    return;
                }
            } catch { /* server non disponibile */ }

            const res = await fetch('/scraper/data/talent-stats.json');
            if (res.ok) {
                this.talentData = await res.json();
                this.renderLeaderboard();
            }
        } catch (e) {
            console.error('Errore caricamento talent stats:', e);
        }
    }

    async addUrl() {
        const url = this.urlInput?.value.trim();
        if (!url) return;
        if (!url.includes('fortnitetracker.com')) {
            this.showStatus('Inserisci un URL valido di fortnitetracker.com', 'warning');
            return;
        }
        if (this.configuredUrls.includes(url)) {
            this.showStatus('URL gia presente nella lista', 'warning');
            return;
        }
        try {
            const res = await fetch('/api/talents/urls/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            if (res.ok) {
                this.configuredUrls.push(url);
                this.urlInput.value = '';
                this.renderUrlList();
                this.showStatus('URL aggiunto con successo', 'success');
            } else {
                this.showStatus('Errore durante l\'aggiunta', 'error');
            }
        } catch {
            this.showStatus('Server non disponibile. Aggiungi l\'URL manualmente in scraper/config/talent-urls.json', 'warning');
        }
    }

    async removeUrl(index) {
        try {
            const res = await fetch('/api/talents/urls/remove', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index })
            });
            if (res.ok) {
                this.configuredUrls.splice(index, 1);
                this.renderUrlList();
                this.showStatus('URL rimosso', 'success');
            }
        } catch {
            this.showStatus('Funzione disponibile solo in locale con server avviato', 'warning');
        }
    }

    async runScraping() {
        if (this.configuredUrls.length === 0) {
            this.showStatus('Aggiungi almeno un URL prima di avviare lo scouting', 'warning');
            return;
        }
        try {
            const res = await fetch('/api/talents/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                this.showStatus('Scouting avviato! Potrebbe richiedere diversi minuti...', 'running');
                this.runScrapingBtn.disabled = true;
                this.startPolling();
            } else {
                this.showStatus('Errore avvio scraping', 'error');
            }
        } catch {
            this.showStatus('Server non disponibile. Su GitHub, vai su Actions -> Update Fortnite Stats -> Run workflow', 'warning');
        }
    }

    startPolling() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(async () => {
            try {
                const res = await fetch('/api/talents/status');
                if (res.ok) {
                    const status = await res.json();
                    if (!status.isRunning) {
                        clearInterval(this.pollInterval);
                        this.pollInterval = null;
                        this.runScrapingBtn.disabled = false;
                        this.showStatus('Scouting completato! Ricarico i dati...', 'success');
                        await this.loadTalentStats();
                    }
                }
            } catch {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
                this.runScrapingBtn.disabled = false;
            }
        }, 15000);
    }

    renderUrlList() {
        if (!this.urlList) return;
        if (this.configuredUrls.length === 0) {
            this.urlList.innerHTML = `<div class="url-empty"><i class="fas fa-info-circle"></i> Nessun URL configurato. Aggiungi un link della classifica di Fortnite Tracker.</div>`;
            return;
        }
        this.urlList.innerHTML = this.configuredUrls.map((url, index) => `
            <div class="url-item">
                <span class="url-text" title="${url}">${url}</span>
                <button class="url-remove-btn" onclick="window.scoutingSystem.removeUrl(${index})" title="Rimuovi URL">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    renderLeaderboard() {
        if (!this.talentLboard || !this.talentData) return;
        // Dati già ordinati per talentScore desc dal scraper (eligible in cima, null in fondo)
        const players = this.talentData.players || [];

        if (this.leaderboardInfo) {
            const lastUpdate = this.talentData.lastUpdate
                ? new Date(this.talentData.lastUpdate).toLocaleString('it-IT')
                : 'Mai';
            const eligibleCount = players.filter(p => p.eligible).length;
            this.leaderboardInfo.innerHTML = `
                <span><i class="fas fa-clock"></i> Aggiornato: <strong>${lastUpdate}</strong></span>
                <span><i class="fas fa-users"></i> <strong>${eligibleCount}</strong> / ${players.length} talenti classificati</span>
            `;
        }

        if (players.length === 0) {
            this.talentLboard.innerHTML = `<div class="leaderboard-empty"><i class="fas fa-search"></i><p>Nessun talento trovato. Aggiungi gli URL e avvia lo scouting.</p></div>`;
            return;
        }

        // ── Media Top N ───────────────────────────────────────────────────────
        const TOP_N = Math.min(10, players.length);
        const topPlayers = players.slice(0, TOP_N);

        const withPR       = topPlayers.filter(p => p.pr);
        const withScore    = topPlayers.filter(p => p.talentScore != null);
        const withEarnings = topPlayers.filter(p => p.earnings);

        const avgPR       = withPR.length      ? Math.round(withPR.reduce((s, p) => s + p.pr, 0) / withPR.length)                         : null;
        const maxPR       = withPR.length      ? Math.max(...withPR.map(p => p.pr))                                                        : null;
        const avgScore    = withScore.length   ? (withScore.reduce((s, p) => s + p.talentScore, 0) / withScore.length * 100).toFixed(1)     : null;
        const avgEarnings = withEarnings.length ? Math.round(withEarnings.reduce((s, p) => s + p.earnings, 0) / withEarnings.length)        : null;

        const summaryHtml = `
            <div class="top-summary">
                <div class="summary-label-row">Media Top ${TOP_N}</div>
                <div class="summary-stats">
                    <div class="summary-item">
                        <span class="summary-value">${avgPR ? avgPR.toLocaleString('it-IT') : 'N/A'}</span>
                        <span class="summary-stat-label">PR Medio</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-value">${maxPR ? maxPR.toLocaleString('it-IT') : 'N/A'}</span>
                        <span class="summary-stat-label">PR Massimo</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-value">${avgScore != null ? avgScore + '%' : 'N/A'}</span>
                        <span class="summary-stat-label">Talent Score Medio</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-value">${avgEarnings ? '$' + this.formatEarnings(avgEarnings) : 'N/A'}</span>
                        <span class="summary-stat-label">Earnings Medi</span>
                    </div>
                </div>
            </div>
        `;

        this.talentLboard.innerHTML = summaryHtml + `
            <div class="leaderboard-search-bar">
                <input type="text" id="leaderboard-search" class="search-input" placeholder="&#xf002; Cerca giocatore..." style="width:100%;margin-bottom:1rem;font-family:inherit;">
            </div>
            <div class="talent-table-wrapper">
                <table class="talent-table">
                    <thead>
                        <tr>
                            <th class="col-rank">#</th>
                            <th class="col-name">Giocatore</th>
                            <th class="col-pr">PR EU</th>
                            <th class="col-earnings">Earnings</th>
                            <th class="col-avgpr">Talent Score</th>
                            <th class="col-link">Profilo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${players.map((p, i) => this.renderRow(p, i)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        this._initLeaderboardSearch();
    }

    renderRow(player, index) {
        const pr       = player.pr      ? player.pr.toLocaleString('it-IT')         : 'N/A';
        const earnings = player.earnings ? `$${this.formatEarnings(player.earnings)}` : '—';
        const score    = player.talentScore != null
            ? `<span class="score-value">${(player.talentScore * 100).toFixed(1)}%</span>`
            : `<span style="color:#555;font-size:0.8rem">${player.eligible === false ? 'N/D' : '—'}</span>`;
        const rowClass = player.success === false ? 'talent-row talent-row--error' : 'talent-row';

        return `
            <tr class="${rowClass}" data-name="${player.name.toLowerCase()}" onclick="window.scoutingSystem.showPlayerDetail(${index})">
                <td class="col-rank">${index + 1}</td>
                <td class="col-name">${this.escapeHtml(player.name)}</td>
                <td class="col-pr pr-value">${pr}</td>
                <td class="col-earnings">${earnings}</td>
                <td class="col-avgpr avgpr-value">${score}</td>
                <td class="col-link">
                    <a href="${player.profileUrl}" target="_blank" onclick="event.stopPropagation()" class="profile-link" title="Apri su Fortnite Tracker">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </td>
            </tr>
        `;
    }

    _initLeaderboardSearch() {
        const input = document.getElementById('leaderboard-search');
        if (!input) return;
        input.addEventListener('input', () => {
            const q = input.value.toLowerCase().trim();
            document.querySelectorAll('#talent-leaderboard .talent-row').forEach(row => {
                const name = row.dataset.name || '';
                row.style.display = !q || name.includes(q) ? '' : 'none';
            });
        });
    }

    showPlayerDetail(index) {
        const player = this.talentData?.players?.[index];
        if (!player) return;
        this._openPlayerModal(player, false);
    }

    async lookupPlayer() {
        const url = this.lookupInput?.value.trim();
        if (!url) return;
        if (!url.includes('fortnitetracker.com')) {
            this._setLookupStatus('Inserisci un URL valido di fortnitetracker.com/profile/...', 'warning');
            return;
        }

        if (this.lookupBtn) this.lookupBtn.disabled = true;
        this._setLookupStatus('<i class="fas fa-circle-notch fa-spin"></i> Scansione in corso... potrebbe richiedere 30–60 secondi.', 'running');

        try {
            const res = await fetch('/api/talents/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileUrl: url })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Errore server (${res.status})`);
            }
            const player = await res.json();
            this._setLookupStatus('', '');
            this._openPlayerModal(player, true);
        } catch (e) {
            if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
                this._setLookupStatus('Server non disponibile. Avvia il server locale con <code>node server.js</code> per usare questa funzione.', 'warning');
            } else {
                this._setLookupStatus(`Errore: ${e.message}`, 'error');
            }
        } finally {
            if (this.lookupBtn) this.lookupBtn.disabled = false;
        }
    }

    _setLookupStatus(html, type) {
        if (!this.lookupStatus) return;
        const colors = { success: '#2ecc71', warning: '#f39c12', error: '#e74c3c', running: '#00bcd4', info: '#999' };
        this.lookupStatus.innerHTML = html
            ? `<span style="color:${colors[type] || colors.info};display:flex;align-items:center;gap:0.5rem;">${html}</span>`
            : '';
    }

    _openPlayerModal(player, isLookup) {
        const nameEl = document.getElementById('modal-player-name');
        if (nameEl) {
            nameEl.textContent = player.name;
            // Badge "Lookup" per distinguerlo dai player già nel pool
            const badge = isLookup
                ? ` <span style="font-size:0.65rem;background:rgba(0,188,212,0.2);color:#00bcd4;border:1px solid rgba(0,188,212,0.4);border-radius:4px;padding:2px 6px;vertical-align:middle;">LOOKUP</span>`
                : '';
            nameEl.innerHTML = this.escapeHtml(player.name) + badge;
        }

        const tournaments = player.top10Tournaments || [];
        const tourHtml = tournaments.length > 0
            ? `<table class="modal-tournaments-table">
                    <thead><tr><th>Torneo</th><th>Placement</th><th>PR</th></tr></thead>
                    <tbody>${tournaments.map(t => `
                        <tr>
                            <td>${this.escapeHtml(t.name)}</td>
                            <td>#${t.placement}</td>
                            <td class="${t.prEarned > 0 ? 'pr-positive' : ''}">${t.prEarned > 0 ? '+' + t.prEarned : '—'}</td>
                        </tr>
                    `).join('')}</tbody>
               </table>`
            : '<p class="modal-no-stats">Nessun torneo trovato</p>';

        const m = player.talentMetrics;
        const metricsHtml = m ? `
            <div class="modal-metrics-section">
                <h3><i class="fas fa-chart-bar"></i> Metriche Talent Score${isLookup ? ' <small style="font-weight:400;font-size:0.75rem;color:#888;">(calcolato nel contesto del pool attuale)</small>' : ''}</h3>
                <div class="modal-metrics-grid">
                    <div class="modal-metric-item" title="Media pesata PR (recenti ×1.5)">
                        <span class="modal-metric-label">RPQ</span>
                        <span class="modal-metric-value">${m.RPQ}</span>
                    </div>
                    <div class="modal-metric-item" title="Trend crescita (media ultimi 4 / media 5-10)">
                        <span class="modal-metric-label">GT</span>
                        <span class="modal-metric-value">${m.GT}×</span>
                    </div>
                    <div class="modal-metric-item" title="Earnings signal (sotto radar del mercato)">
                        <span class="modal-metric-label">E</span>
                        <span class="modal-metric-value">${(m.E * 100).toFixed(1)}%</span>
                    </div>
                    <div class="modal-metric-item" title="Frequenza eventi a punti su 10">
                        <span class="modal-metric-label">F</span>
                        <span class="modal-metric-value">${(m.F * 10).toFixed(0)}/10</span>
                    </div>
                    <div class="modal-metric-item" title="Undervaluation signal">
                        <span class="modal-metric-label">US</span>
                        <span class="modal-metric-value">${(m.US * 100).toFixed(1)}%</span>
                    </div>
                    <div class="modal-metric-item" title="Peak recentness index">
                        <span class="modal-metric-label">PRI</span>
                        <span class="modal-metric-value">${(m.PRI * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        ` : '';

        const inactiveBanner = player.inactive
            ? `<div style="background:rgba(231,76,60,0.15);border:1px solid rgba(231,76,60,0.4);border-radius:8px;padding:0.6rem 1rem;margin-bottom:1rem;color:#e74c3c;font-size:0.85rem;">
                   <i class="fas fa-clock"></i> Player inattivo — ultimo evento più di 60 giorni fa (${player.lastEventDate || 'data non trovata'})
               </div>`
            : '';

        document.getElementById('modal-player-content').innerHTML = `
            ${inactiveBanner}
            <div class="modal-talent-stats">
                <div class="modal-stat-item">
                    <span class="modal-stat-value">${player.pr?.toLocaleString('it-IT') || 'N/A'}</span>
                    <div class="modal-stat-label">PR EU</div>
                </div>
                <div class="modal-stat-item">
                    <span class="modal-stat-value">$${this.formatEarnings(player.earnings || 0)}</span>
                    <div class="modal-stat-label">Earnings Totali</div>
                </div>
                <div class="modal-stat-item">
                    <span class="modal-stat-value">${player.talentScore != null ? (player.talentScore * 100).toFixed(1) + '%' : 'N/D'}</span>
                    <div class="modal-stat-label">Talent Score</div>
                </div>
                <div class="modal-stat-item">
                    <span class="modal-stat-value">${tournaments.filter(t => t.prEarned > 0).length}/${tournaments.length}</span>
                    <div class="modal-stat-label">Tornei a punti</div>
                </div>
            </div>
            ${metricsHtml}
            <div class="modal-tournaments-section">
                <h3><i class="fas fa-trophy"></i> Ultimi 10 tornei</h3>
                ${tourHtml}
            </div>
            <div style="margin-top:1.5rem;text-align:center;">
                <a href="${player.profileUrl}" target="_blank" class="access-btn" style="padding:0.6rem 1.2rem;font-size:0.9rem;">
                    <i class="fas fa-external-link-alt"></i> Apri su Fortnite Tracker
                </a>
            </div>
        `;

        document.getElementById('player-modal').style.display = 'flex';
    }

    showStatus(message, type = 'info') {
        if (!this.scrapingStatus) return;
        const colors = { success: '#2ecc71', warning: '#f39c12', error: '#e74c3c', running: '#00bcd4', info: '#999' };
        this.scrapingStatus.innerHTML = `<span style="color:${colors[type] || colors.info}">${message}</span>`;
    }

    formatEarnings(n) {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
        return n.toString();
    }

    escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}

// ─── ROSTER SYSTEM ────────────────────────────────────────────────────────────

class RosterSystem {
    constructor() {
        this.roster    = [];
        this.editingId = null;
        this.serverAvailable = false;

        this.bindEvents();
        this.loadRoster();
    }

    bindEvents() {
        document.getElementById('add-player-btn')?.addEventListener('click', () => this.openModal());
        document.getElementById('roster-modal-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('form-cancel-btn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('roster-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('roster-modal')) this.closeModal();
        });
        document.getElementById('roster-form')?.addEventListener('submit', e => {
            e.preventDefault();
            this.savePlayer();
        });

        document.getElementById('delete-confirm-btn')?.addEventListener('click', () => this._closeDeleteConfirm(true));
        document.getElementById('delete-cancel-btn')?.addEventListener('click', () => this._closeDeleteConfirm(false));
        document.getElementById('delete-confirm-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('delete-confirm-modal')) this._closeDeleteConfirm(false);
        });
    }

    showDeleteConfirm(playerName) {
        return new Promise(resolve => {
            document.getElementById('delete-player-name').textContent = playerName;
            document.getElementById('delete-confirm-modal').style.display = 'flex';
            this._deleteResolve = resolve;
        });
    }

    _closeDeleteConfirm(result) {
        document.getElementById('delete-confirm-modal').style.display = 'none';
        if (this._deleteResolve) {
            this._deleteResolve(result);
            this._deleteResolve = null;
        }
    }

    async loadRoster() {
        try {
            let data = null;
            try {
                const res = await fetch('/api/roster');
                if (res.ok) {
                    data = await res.json();
                    this.serverAvailable = true;
                }
            } catch { /* server non disponibile */ }

            if (!data) {
                this.serverAvailable = false;
                const res = await fetch('/scraper/config/roster.json');
                if (res.ok) data = await res.json();
            }

            this.roster = data || [];
        } catch (e) {
            console.error('Errore caricamento roster:', e);
            this.roster = [];
        }
        this._updateReadonlyBanner();
        this.renderTable();
    }

    _updateReadonlyBanner() {
        const existing = document.getElementById('roster-readonly-banner');
        if (this.serverAvailable) {
            if (existing) existing.remove();
            document.getElementById('add-player-btn')?.removeAttribute('disabled');
            return;
        }

        if (!existing) {
            const banner = document.createElement('div');
            banner.id = 'roster-readonly-banner';
            banner.style.cssText = `
                background: rgba(243,156,18,0.15); border: 1px solid rgba(243,156,18,0.4);
                border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem;
                color: #f39c12; font-size: 0.9rem; display: flex; align-items: center; gap: 0.6rem;
            `;
            banner.innerHTML = `<i class="fas fa-info-circle"></i> <span>Modalità sola lettura — avvia il server in locale (<code>node server.js</code>) per aggiungere o modificare player.</span>`;
            const table = document.getElementById('roster-tbody')?.closest('table') || document.getElementById('add-player-btn')?.parentElement;
            table?.parentElement?.insertBefore(banner, table.parentElement.firstChild);
        }

        const addBtn = document.getElementById('add-player-btn');
        if (addBtn) { addBtn.disabled = true; addBtn.style.opacity = '0.4'; addBtn.style.cursor = 'not-allowed'; }
    }

    renderTable() {
        const tbody = document.getElementById('roster-tbody');
        if (!tbody) return;

        if (this.roster.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:2rem">Nessun player nel roster.</td></tr>';
            return;
        }

        tbody.innerHTML = this.roster.map(p => `
            <tr class="roster-row">
                <td class="roster-name">${this.escapeHtml(p.name)}</td>
                <td><span class="category-badge category-${p.category}">${this.formatCategory(p.category)}</span></td>
                <td>${this.escapeHtml(p.role)}</td>
                <td class="roster-socials">${this.renderSocials(p.socials || {})}</td>
                <td class="tracker-cell">${p.ftTrackerUrl ? '<span class="tracker-yes" title="Tracker configurato">&#10003;</span>' : '<span class="tracker-no" title="Nessun tracker">&#10007;</span>'}</td>
                <td class="roster-actions">
                    <button class="action-btn edit-btn" onclick="window.rosterSystem.openModal(${p.id})" title="Modifica" ${!this.serverAvailable ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="window.rosterSystem.deletePlayer(${p.id})" title="Elimina" ${!this.serverAvailable ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderSocials(socials) {
        const icons = {
            twitter:   'fab fa-twitter',
            instagram: 'fab fa-instagram',
            twitch:    'fab fa-twitch',
            youtube:   'fab fa-youtube',
            tiktok:    'fab fa-tiktok'
        };
        const links = Object.entries(socials)
            .filter(([, url]) => url)
            .map(([p, url]) => `<a href="${url}" target="_blank" class="social-mini" title="${p}"><i class="${icons[p] || 'fas fa-link'}"></i></a>`)
            .join('');
        return links || '<span style="color:#666">—</span>';
    }

    formatCategory(cat) {
        const map = {
            proPlayer:      'Pro Player',
            talent:         'Talent',
            academy:        'Academy',
            contentCreator: 'Content Creator'
        };
        return map[cat] || cat;
    }

    openModal(id = null) {
        this.editingId = id;
        const modal = document.getElementById('roster-modal');
        const title = document.getElementById('roster-modal-title');

        if (id !== null) {
            const player = this.roster.find(p => p.id === id);
            if (!player) return;
            title.textContent = `Modifica: ${player.name}`;
            this.fillForm(player);
        } else {
            title.textContent = 'Aggiungi Player';
            document.getElementById('roster-form').reset();
        }

        modal.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('roster-modal').style.display = 'none';
        this.editingId = null;
    }

    fillForm(player) {
        document.getElementById('f-name').value            = player.name             || '';
        document.getElementById('f-category').value        = player.category         || 'proPlayer';
        document.getElementById('f-role').value            = player.role             || '';
        document.getElementById('f-game').value            = player.game             || '';
        document.getElementById('f-imageUrl').value        = player.imageUrl         || '';
        document.getElementById('f-ftTrackerUrl').value    = player.ftTrackerUrl     || '';
        document.getElementById('f-ftTrackerUsername').value = player.ftTrackerUsername || '';
        document.getElementById('f-ftPlatform').value      = player.ftPlatform       || '';
        document.getElementById('f-ftRegion').value        = player.ftRegion         || '';
        document.getElementById('f-twitter').value         = player.socials?.twitter   || '';
        document.getElementById('f-instagram').value       = player.socials?.instagram || '';
        document.getElementById('f-twitch').value          = player.socials?.twitch    || '';
        document.getElementById('f-youtube').value         = player.socials?.youtube   || '';
        document.getElementById('f-tiktok').value          = player.socials?.tiktok    || '';
    }

    buildPlayerFromForm() {
        const v = id => document.getElementById(id)?.value.trim() || null;
        return {
            name:               v('f-name'),
            category:           document.getElementById('f-category').value,
            role:               v('f-role'),
            game:               v('f-game'),
            imageUrl:           v('f-imageUrl'),
            ftTrackerUrl:       v('f-ftTrackerUrl'),
            ftTrackerUsername:  v('f-ftTrackerUsername'),
            ftPlatform:         v('f-ftPlatform'),
            ftRegion:           v('f-ftRegion'),
            socials: {
                twitter:   v('f-twitter'),
                instagram: v('f-instagram'),
                twitch:    v('f-twitch'),
                youtube:   v('f-youtube'),
                tiktok:    v('f-tiktok')
            }
        };
    }

    async savePlayer() {
        const playerData = this.buildPlayerFromForm();

        try {
            let res;
            if (this.editingId !== null) {
                res = await fetch(`/api/roster/${this.editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(playerData)
                });
            } else {
                res = await fetch('/api/roster', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(playerData)
                });
            }

            if (res.ok) {
                this.closeModal();
                await this.loadRoster();
            } else {
                this.showToast('Errore nel salvataggio del player', 'error');
            }
        } catch {
            this.showToast('Server non disponibile', 'error');
        }
    }

    async deletePlayer(id) {
        const player = this.roster.find(p => p.id === id);
        if (!player) return;
        const confirmed = await this.showDeleteConfirm(player.name);
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/roster/${id}`, { method: 'DELETE' });
            if (res.ok) {
                this.showToast(`${player.name} eliminato dal roster`, 'success');
                await this.loadRoster();
            } else {
                this.showToast('Errore nella eliminazione', 'error');
            }
        } catch {
            this.showToast('Server non disponibile', 'error');
        }
    }

    showToast(message, type = 'info') {
        const colors = { success: '#2ecc71', error: '#e74c3c', info: '#00bcd4' };
        const icons  = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };

        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 2rem; right: 2rem; z-index: 99999;
            background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(26,26,46,0.95));
            border: 1px solid ${colors[type]}55;
            border-left: 4px solid ${colors[type]};
            color: #fff; padding: 1rem 1.5rem; border-radius: 10px;
            display: flex; align-items: center; gap: 0.75rem;
            font-size: 0.95rem; font-weight: 500;
            box-shadow: 0 8px 30px rgba(0,0,0,0.4);
            animation: slideInRight 0.3s ease;
            max-width: 340px;
        `;
        toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]};font-size:1.1rem;flex-shrink:0"></i><span>${message}</span>`;

        if (!document.getElementById('toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.textContent = `
                @keyframes slideInRight { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeOut { from { opacity:1; } to { opacity:0; transform:translateX(60px); } }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}

// ─── TV SYSTEM ────────────────────────────────────────────────────────────────
// Gestisce la lista streamer della Clarvs TV e le credenziali API.

class TVSystem {
    constructor() {
        this.streamers = [];
        this.editingId = null;
        this.init();
    }

    async init() {
        await Promise.all([this.loadRosterStreamers(), this.loadManualStreamers()]);
        this.bindEvents();
        this.renderTable();
    }

    // ── Streamer CRUD ─────────────────────────────────────────────────────────

    /** Carica i player del Roster che hanno Twitch o YouTube (sola lettura) */
    async loadRosterStreamers() {
        this.rosterStreamers = [];
        try {
            let data = null;
            try { const r = await fetch('/api/roster'); if (r.ok) data = await r.json(); } catch {}
            if (!data) { const r = await fetch('/scraper/config/roster.json'); if (r.ok) data = await r.json(); }
            if (!data) return;

            for (const p of data) {
                const twitch   = this._parseTwitch(p.socials?.twitch);
                const ytHandle = this._parseYt(p.socials?.youtube);
                if (!twitch && !ytHandle) continue;
                this.rosterStreamers.push({
                    id:            `roster_${p.id}`,
                    name:          p.name,
                    avatar:        p.imageUrl || null,
                    twitch:        twitch,
                    youtubeUrl:    p.socials?.youtube || null,
                    youtubeHandle: ytHandle,
                    source:        'roster'
                });
            }
        } catch (e) { console.error('[TVSystem] Errore roster:', e); }
    }

    /** Carica la lista manuale salvata (persone non nel Roster) */
    async loadManualStreamers() {
        this.streamers = [];
        try {
            const res = await fetch('/api/tv/streamers');
            if (res.ok) { this.streamers = await res.json(); return; }
        } catch { /* server offline */ }
        try {
            const raw = localStorage.getItem('clarvsTV_streamers');
            if (raw) this.streamers = JSON.parse(raw);
        } catch { this.streamers = []; }
    }

    async persistStreamers() {
        localStorage.setItem('clarvsTV_streamers', JSON.stringify(this.streamers));
        try {
            await fetch('/api/tv/streamers', {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(this.streamers)
            });
        } catch { /* server offline – localStorage è sufficiente */ }
    }

    bindEvents() {
        // Streamer table
        document.getElementById('add-tv-streamer-btn')?.addEventListener('click', () => this.openModal());
        document.getElementById('tv-streamer-modal-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('tvs-cancel-btn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('tv-streamer-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('tv-streamer-modal')) this.closeModal();
        });
        document.getElementById('tv-streamer-form')?.addEventListener('submit', e => {
            e.preventDefault();
            this.saveStreamer();
        });

    }

    renderTable() {
        const tbody = document.getElementById('tv-streamers-tbody');
        if (!tbody) return;

        const rosterRows = (this.rosterStreamers || []);
        const manualRows = (this.streamers        || []);

        // Deduplicazione: escludi dalla lista manuale chi è già nel roster
        const rosterKeys = new Set(rosterRows.map(s => `${s.twitch || ''}|${s.youtubeHandle || ''}`));
        const uniqueManual = manualRows.filter(s => !rosterKeys.has(`${s.twitch || ''}|${s.youtubeHandle || ''}`));

        if (!rosterRows.length && !uniqueManual.length) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;padding:2rem;">
                Nessun streamer trovato. Aggiungi link Twitch/YouTube ai player nel <strong>Roster</strong>,
                oppure clicca <strong>Aggiungi Streamer</strong> per inserirli manualmente.
            </td></tr>`;
            return;
        }

        const rowHtml = (s, isAutomatic) => `
            <tr class="roster-row">
                <td class="roster-name">
                    ${s.avatar ? `<img src="${this.esc(s.avatar)}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;margin-right:8px;vertical-align:middle;border:1px solid rgba(0,188,212,0.3)">` : ''}
                    ${this.esc(s.name)}
                    ${isAutomatic ? `<span style="font-size:0.68rem;color:rgba(0,188,212,0.6);margin-left:6px;padding:1px 6px;border:1px solid rgba(0,188,212,0.25);border-radius:10px;">Roster</span>` : ''}
                </td>
                <td>
                    ${s.twitch
                        ? `<a href="https://twitch.tv/${this.esc(s.twitch)}" target="_blank" class="social-mini"><i class="fab fa-twitch"></i> ${this.esc(s.twitch)}</a>`
                        : '<span style="color:#555">—</span>'}
                </td>
                <td>
                    ${s.youtubeUrl
                        ? `<a href="${this.esc(s.youtubeUrl)}" target="_blank" class="social-mini"><i class="fab fa-youtube"></i> ${this.esc(s.youtubeHandle || s.youtubeUrl)}</a>`
                        : '<span style="color:#555">—</span>'}
                </td>
                <td class="roster-actions">
                    ${isAutomatic
                        ? `<span style="font-size:0.75rem;color:rgba(255,255,255,0.25);padding:0 0.5rem;" title="Gestito dal Roster">auto</span>`
                        : `<button class="action-btn edit-btn"   onclick="window.tvSystem.openModal(${s.id})"      title="Modifica"><i class="fas fa-edit"></i></button>
                           <button class="action-btn delete-btn" onclick="window.tvSystem.deleteStreamer(${s.id})"  title="Elimina"><i class="fas fa-trash"></i></button>`}
                </td>
            </tr>`;

        tbody.innerHTML =
            rosterRows.map(s  => rowHtml(s, true)).join('') +
            uniqueManual.map(s => rowHtml(s, false)).join('');
    }

    openModal(id = null) {
        this.editingId = id;
        const modal = document.getElementById('tv-streamer-modal');
        const title = document.getElementById('tv-streamer-modal-title');
        const form  = document.getElementById('tv-streamer-form');

        if (id !== null) {
            const s = this.streamers.find(x => x.id === id);
            if (!s) return;
            title.textContent = `Modifica: ${s.name}`;
            document.getElementById('tvs-name').value    = s.name       || '';
            document.getElementById('tvs-avatar').value  = s.avatar     || '';
            document.getElementById('tvs-twitch').value  = s.twitch     || '';
            document.getElementById('tvs-youtube').value = s.youtubeUrl || '';
        } else {
            title.textContent = 'Aggiungi Streamer';
            form.reset();
        }
        modal.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('tv-streamer-modal').style.display = 'none';
        this.editingId = null;
    }

    async saveStreamer() {
        const v = id => document.getElementById(id)?.value.trim() || '';

        const name       = v('tvs-name');
        const avatar     = v('tvs-avatar');
        const youtubeUrl = v('tvs-youtube');

        // Estrai username Twitch (accetta sia "bettatv" che "https://twitch.tv/bettatv")
        let twitch = v('tvs-twitch');
        const twitchMatch = twitch.match(/twitch\.tv\/([^/?#\s]+)/i);
        if (twitchMatch) twitch = twitchMatch[1];
        twitch = twitch.toLowerCase().replace(/^@/, '');

        // Estrai handle YouTube dall'URL
        let youtubeHandle = null;
        if (youtubeUrl) {
            const m = youtubeUrl.match(/youtube\.com\/((?:@|channel\/|c\/)[^/?#\s]+)/i);
            youtubeHandle = m ? m[1] : null;
        }

        if (!name) return;

        const data = { name, avatar, twitch: twitch || null, youtubeUrl: youtubeUrl || null, youtubeHandle };

        if (this.editingId !== null) {
            const idx = this.streamers.findIndex(s => s.id === this.editingId);
            if (idx >= 0) this.streamers[idx] = { ...this.streamers[idx], ...data };
        } else {
            const newId = this.streamers.length
                ? Math.max(...this.streamers.map(s => s.id)) + 1 : 1;
            this.streamers.push({ id: newId, ...data });
        }

        await this.persistStreamers();
        this.closeModal();
        this.renderTable();
        this.toast(`${name} salvato con successo.`, 'success');
    }

    async deleteStreamer(id) {
        const s = this.streamers.find(x => x.id === id);
        if (!s || !confirm(`Rimuovere "${s.name}" dalla Clarvs TV?`)) return;
        this.streamers = this.streamers.filter(x => x.id !== id);
        await this.persistStreamers();
        this.renderTable();
        this.toast(`${s.name} rimosso.`, 'success');
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    _parseTwitch(val) {
        if (!val) return null;
        const m = val.match(/twitch\.tv\/([^/?#\s]+)/i);
        return ((m ? m[1] : val).toLowerCase().trim()) || null;
    }

    _parseYt(val) {
        if (!val) return null;
        const m = val.match(/youtube\.com\/((?:@|channel\/|c\/)[^/?#\s]+)/i);
        return m ? m[1] : null;
    }

    toast(msg, type = 'info') {
        window.rosterSystem?.showToast(msg, type);
    }

    esc(str) {
        return String(str || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
}

// ─── HOME CONTENT SYSTEM ──────────────────────────────────────────────────────

class HomeContentSystem {
    constructor() {
        this.content = { news: [], events: [], social: { instagram: [], twitter: [] } };
        this.serverAvailable = false;
        this.editingNewsId   = null;
        this.editingEventId  = null;
        this.init();
    }

    async init() {
        await this.loadContent();
        this.bindEvents();
        this.renderAll();
    }

    async loadContent() {
        try {
            let data = null;
            try {
                const res = await fetch('/api/home-content');
                if (res.ok) { data = await res.json(); this.serverAvailable = true; }
            } catch { /* server offline */ }
            if (!data) {
                const res = await fetch('/scraper/config/home-content.json');
                if (res.ok) data = await res.json();
            }
            if (data) this.content = data;
        } catch (e) {
            console.error('Errore caricamento home content:', e);
        }
        this._updateBanner();
    }

    _updateBanner() {
        const existing = document.getElementById('home-readonly-banner');
        if (this.serverAvailable) { if (existing) existing.remove(); return; }
        if (!existing) {
            const banner = document.createElement('div');
            banner.id = 'home-readonly-banner';
            banner.style.cssText = `
                background: rgba(243,156,18,0.15); border: 1px solid rgba(243,156,18,0.4);
                border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem;
                color: #f39c12; font-size: 0.9rem; display: flex; align-items: center; gap: 0.6rem;
            `;
            banner.innerHTML = `<i class="fas fa-info-circle"></i> <span>Modalità sola lettura — avvia il server (<code>node server.js</code>) per salvare le modifiche.</span>`;
            const newsTable = document.getElementById('news-tbody')?.closest('table');
            newsTable?.parentElement?.parentElement?.insertBefore(banner, newsTable.parentElement.parentElement.firstChild);
        }
    }

    bindEvents() {
        // News
        document.getElementById('add-news-btn')?.addEventListener('click', () => this.openNewsModal());
        document.getElementById('news-modal-close')?.addEventListener('click', () => this.closeNewsModal());
        document.getElementById('news-cancel-btn')?.addEventListener('click', () => this.closeNewsModal());
        document.getElementById('news-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('news-modal')) this.closeNewsModal();
        });
        document.getElementById('news-form')?.addEventListener('submit', e => { e.preventDefault(); this.saveNews(); });

        // Events
        document.getElementById('add-event-btn')?.addEventListener('click', () => this.openEventModal());
        document.getElementById('event-modal-close')?.addEventListener('click', () => this.closeEventModal());
        document.getElementById('event-cancel-btn')?.addEventListener('click', () => this.closeEventModal());
        document.getElementById('event-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('event-modal')) this.closeEventModal();
        });
        document.getElementById('event-form')?.addEventListener('submit', e => { e.preventDefault(); this.saveEvent(); });

        // Social
        document.getElementById('add-instagram-btn')?.addEventListener('click', () => this.addSocialRow('instagram'));
        document.getElementById('add-twitter-btn')?.addEventListener('click', () => this.addSocialRow('twitter'));
        document.getElementById('save-social-btn')?.addEventListener('click', () => this.saveSocial());
    }

    renderAll() {
        this.renderNewsTable();
        this.renderEventsTable();
        this.renderSocialLists();
    }

    // ── News ──────────────────────────────────────────────────────────────────

    renderNewsTable() {
        const tbody = document.getElementById('news-tbody');
        if (!tbody) return;
        const news = this.content.news || [];
        if (news.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;padding:2rem">Nessuna notizia. Clicca "Aggiungi Notizia".</td></tr>';
            return;
        }
        tbody.innerHTML = news.map(n => `
            <tr class="roster-row">
                <td class="roster-name">${this.esc(n.title)}</td>
                <td>${this.esc(n.date)}</td>
                <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(255,255,255,0.6);font-size:0.85rem">${this.esc(n.content)}</td>
                <td class="roster-actions">
                    <button class="action-btn edit-btn"   onclick="window.homeContentSystem.openNewsModal(${n.id})" title="Modifica"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="window.homeContentSystem.deleteNews(${n.id})"    title="Elimina"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    openNewsModal(id = null) {
        this.editingNewsId = id;
        document.getElementById('news-modal-title').textContent = id ? 'Modifica Notizia' : 'Aggiungi Notizia';
        if (id !== null) {
            const n = this.content.news.find(x => x.id === id);
            if (!n) return;
            document.getElementById('fn-title').value   = n.title   || '';
            document.getElementById('fn-date').value    = n.date    || '';
            document.getElementById('fn-image').value   = n.image   || '';
            document.getElementById('fn-content').value = n.content || '';
        } else {
            document.getElementById('news-form').reset();
        }
        document.getElementById('news-modal').style.display = 'flex';
    }

    closeNewsModal() {
        document.getElementById('news-modal').style.display = 'none';
        this.editingNewsId = null;
    }

    async saveNews() {
        const v = id => document.getElementById(id)?.value.trim() || '';
        const data = { title: v('fn-title'), date: v('fn-date'), image: v('fn-image'), content: v('fn-content') };

        if (this.editingNewsId !== null) {
            const idx = this.content.news.findIndex(x => x.id === this.editingNewsId);
            if (idx >= 0) this.content.news[idx] = { ...this.content.news[idx], ...data };
        } else {
            const maxId = this.content.news.reduce((m, x) => Math.max(m, x.id || 0), 0);
            this.content.news.push({ id: maxId + 1, ...data });
        }

        this.closeNewsModal();
        this.renderNewsTable();
        await this.persist();
    }

    async deleteNews(id) {
        const n = this.content.news.find(x => x.id === id);
        if (!n || !confirm(`Eliminare la notizia "${n.title}"?`)) return;
        this.content.news = this.content.news.filter(x => x.id !== id);
        this.renderNewsTable();
        await this.persist();
    }

    // ── Events ────────────────────────────────────────────────────────────────

    renderEventsTable() {
        const tbody = document.getElementById('events-tbody');
        if (!tbody) return;
        const events = this.content.events || [];
        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:2rem">Nessun evento. Clicca "Aggiungi Evento".</td></tr>';
            return;
        }
        tbody.innerHTML = events.map(ev => `
            <tr class="roster-row">
                <td class="roster-name">${this.esc(ev.title)}</td>
                <td>${this.esc(ev.date)}</td>
                <td>${this.esc(ev.time)}</td>
                <td><span class="category-badge" style="background:rgba(0,188,212,0.15);color:#00bcd4;border:1px solid rgba(0,188,212,0.3);padding:2px 8px;border-radius:10px;font-size:0.78rem;">${this.esc(ev.type)}</span></td>
                <td class="roster-actions">
                    <button class="action-btn edit-btn"   onclick="window.homeContentSystem.openEventModal(${ev.id})" title="Modifica"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="window.homeContentSystem.deleteEvent(${ev.id})"    title="Elimina"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    openEventModal(id = null) {
        this.editingEventId = id;
        document.getElementById('event-modal-title').textContent = id ? 'Modifica Evento' : 'Aggiungi Evento';
        if (id !== null) {
            const ev = this.content.events.find(x => x.id === id);
            if (!ev) return;
            document.getElementById('fe-title').value = ev.title || '';
            document.getElementById('fe-date').value  = ev.date  || '';
            document.getElementById('fe-time').value  = ev.time  || '';
            document.getElementById('fe-type').value  = ev.type  || '';
        } else {
            document.getElementById('event-form').reset();
        }
        document.getElementById('event-modal').style.display = 'flex';
    }

    closeEventModal() {
        document.getElementById('event-modal').style.display = 'none';
        this.editingEventId = null;
    }

    async saveEvent() {
        const v = id => document.getElementById(id)?.value.trim() || '';
        const data = { title: v('fe-title'), date: v('fe-date'), time: v('fe-time'), type: v('fe-type') };

        if (this.editingEventId !== null) {
            const idx = this.content.events.findIndex(x => x.id === this.editingEventId);
            if (idx >= 0) this.content.events[idx] = { ...this.content.events[idx], ...data };
        } else {
            const maxId = this.content.events.reduce((m, x) => Math.max(m, x.id || 0), 0);
            this.content.events.push({ id: maxId + 1, ...data });
        }

        this.closeEventModal();
        this.renderEventsTable();
        await this.persist();
    }

    async deleteEvent(id) {
        const ev = this.content.events.find(x => x.id === id);
        if (!ev || !confirm(`Eliminare l'evento "${ev.title}"?`)) return;
        this.content.events = this.content.events.filter(x => x.id !== id);
        this.renderEventsTable();
        await this.persist();
    }

    // ── Social ────────────────────────────────────────────────────────────────

    renderSocialLists() {
        this._renderSocialPlatform('instagram', 'instagram-links-list', 'permalink', 'URL post Instagram (es. https://www.instagram.com/p/XXX/)');
        this._renderSocialPlatform('twitter',   'twitter-links-list',   'link',      'URL tweet (es. https://twitter.com/user/status/XXX)');
    }

    _renderSocialPlatform(platform, containerId, field, placeholder) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = this.content.social?.[platform] || [];
        if (items.length === 0) {
            container.innerHTML = `<div style="color:rgba(255,255,255,0.35);font-size:0.85rem;padding:0.5rem 0;">Nessun link configurato.</div>`;
            return;
        }
        container.innerHTML = items.map((item, idx) => `
            <div class="url-item" style="margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;">
                <input type="text" value="${this.esc(item[field] || '')}"
                    data-platform="${platform}" data-idx="${idx}" data-field="${field}"
                    placeholder="${placeholder}"
                    style="flex:1;background:rgba(0,0,0,0.3);border:1px solid rgba(0,188,212,0.2);border-radius:8px;padding:0.5rem 0.75rem;color:#fff;font-size:0.85rem;"
                    oninput="window.homeContentSystem.onSocialInput(this)">
                ${platform === 'twitter' ? `<input type="text" value="${this.esc(item.date || '')}"
                    data-platform="${platform}" data-idx="${idx}" data-field="date"
                    placeholder="Data (es. December 17, 2024)"
                    style="width:200px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,188,212,0.2);border-radius:8px;padding:0.5rem 0.75rem;color:#fff;font-size:0.85rem;"
                    oninput="window.homeContentSystem.onSocialInput(this)">` : ''}
                <button class="action-btn delete-btn" onclick="window.homeContentSystem.removeSocialItem('${platform}', ${idx})" title="Rimuovi">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    onSocialInput(input) {
        const platform = input.dataset.platform;
        const idx      = parseInt(input.dataset.idx);
        const field    = input.dataset.field;
        if (!this.content.social[platform]) return;
        if (!this.content.social[platform][idx]) return;
        this.content.social[platform][idx][field] = input.value;
    }

    addSocialRow(platform) {
        if (!this.content.social[platform]) this.content.social[platform] = [];
        const maxId = this.content.social[platform].reduce((m, x) => Math.max(m, x.id || 0), 0);
        if (platform === 'instagram') {
            this.content.social[platform].push({ id: maxId + 1, permalink: '' });
        } else {
            this.content.social[platform].push({ id: maxId + 1, link: '', date: '' });
        }
        this.renderSocialLists();
    }

    removeSocialItem(platform, idx) {
        if (!this.content.social[platform]) return;
        this.content.social[platform].splice(idx, 1);
        this.renderSocialLists();
    }

    async saveSocial() {
        const statusEl = document.getElementById('social-save-status');
        await this.persist(statusEl);
    }

    // ── Persist ───────────────────────────────────────────────────────────────

    async persist(statusEl = null) {
        if (!this.serverAvailable) {
            window.rosterSystem?.showToast('Server non disponibile — avvia node server.js per salvare', 'error');
            return;
        }
        try {
            const res = await fetch('/api/home-content', {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(this.content)
            });
            if (res.ok) {
                window.rosterSystem?.showToast('Home aggiornata con successo', 'success');
                if (statusEl) statusEl.innerHTML = '<span style="color:#2ecc71"><i class="fas fa-check"></i> Salvato</span>';
            } else {
                window.rosterSystem?.showToast('Errore nel salvataggio', 'error');
            }
        } catch {
            window.rosterSystem?.showToast('Errore di connessione', 'error');
        }
        if (statusEl) setTimeout(() => { statusEl.innerHTML = ''; }, 3000);
    }

    esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}

// ─── ADMIN SYSTEM ─────────────────────────────────────────────────────────────


// ─── FORCE SCAN SYSTEM ────────────────────────────────────────────────────────
class ForceScanSystem {
    constructor() {
        this.btn    = document.getElementById('force-scan-btn');
        this.status = document.getElementById('force-scan-status');
        this.pollInterval = null;
        this.btn?.addEventListener('click', () => this.run());
    }

    async run() {
        if (!this.btn) return;
        this.btn.disabled = true;
        this.btn.style.opacity = '0.5';
        this.showStatus('Scansione avviata... potrebbe richiedere qualche minuto.', 'running');

        try {
            const res = await fetch('/api/scraper/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trigger: 'manual' })
            });

            if (res.ok) {
                this.startPolling();
            } else {
                this.showStatus('Errore avvio scansione', 'error');
                this.reset();
            }
        } catch {
            this.showStatus('Server non disponibile', 'warning');
            this.reset();
        }
    }

    startPolling() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(async () => {
            try {
                const res = await fetch('/api/scraper/status');
                if (!res.ok) return;
                const data = await res.json();
                if (!data.isRunning) {
                    clearInterval(this.pollInterval);
                    this.pollInterval = null;
                    this.showStatus('Statistiche aggiornate!', 'success');
                    this.reset();
                }
            } catch {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
                this.reset();
            }
        }, 8000);
    }

    showStatus(msg, type) {
        if (!this.status) return;
        const colors = { running: '#60a5fa', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' };
        this.status.innerHTML = `<span style="color:${colors[type] || '#aaa'}"><i class="fas fa-${type === 'running' ? 'spinner fa-spin' : type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${msg}</span>`;
    }

    reset() {
        if (this.btn) { this.btn.disabled = false; this.btn.style.opacity = ''; }
    }
}

class AdminSystem {
    constructor() {
        this.checkAccess();
        if (this.hasAccess()) {
            this.initTabs();
            this.updateWelcomeMessage();
            window.rosterSystem      = new RosterSystem();
            window.forceScanSystem    = new ForceScanSystem();
            window.scoutingSystem    = new ScoutingSystem();
            window.tvSystem          = new TVSystem();
            window.homeContentSystem = new HomeContentSystem();
        }
        setInterval(() => this.checkAccess(), 2000);
    }

    checkAccess() {
        const ok = this.hasAccess();
        document.getElementById('access-denied').style.display = ok ? 'none' : 'flex';
        document.querySelectorAll('.staff-only').forEach(el => {
            el.style.display = ok ? 'block' : 'none';
        });
        if (ok) this.updateWelcomeMessage();
    }

    hasAccess() {
        return window.authSystem && window.authSystem.isStaffLoggedIn();
    }

    updateWelcomeMessage() {
        const el = document.getElementById('staff-welcome');
        if (!el || !window.authSystem) return;
        const user = window.authSystem.getCurrentUser();
        if (user) {
            el.innerHTML = `<p><strong>Benvenuto ${user}!</strong> Pannello di amministrazione Clarvs</p>`;
        }
    }

    initTabs() {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => {
                    c.classList.remove('active');
                    c.style.display = 'none';
                });
                tab.classList.add('active');
                const content = document.getElementById(`tab-${tab.dataset.tab}`);
                if (content) {
                    content.classList.add('active');
                    content.style.display = 'block';
                }
            });
        });
    }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    function initAdmin() {
        if (window.authSystem) {
            window.adminSystem = new AdminSystem();
            console.log('Admin System inizializzato');
        } else {
            setTimeout(initAdmin, 500);
        }
    }
    initAdmin();

    document.getElementById('login-redirect')?.addEventListener('click', () => {
        window.authSystem?.showLoginModal();
    });
});
