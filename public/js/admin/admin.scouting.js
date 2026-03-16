// admin.scouting.js Ã¢Â€Â” requires admin.utils.js to be loaded first

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
        this.urlInput = document.getElementById('talent-url-input');
        this.addUrlBtn = document.getElementById('add-url-btn');
        this.urlList = document.getElementById('url-list');
        this.runScrapingBtn = document.getElementById('run-scraping-btn');
        this.scrapingStatus = document.getElementById('scraping-status');
        this.talentLboard = document.getElementById('talent-leaderboard');
        this.leaderboardInfo = document.getElementById('leaderboard-info');
        this.lookupInput = document.getElementById('lookup-url-input');
        this.lookupBtn = document.getElementById('lookup-btn');
        this.lookupStatus = document.getElementById('lookup-status');

        // Nuovi componenti scrape singolo
        this.singleInput = document.getElementById('single-scrape-input');
        this.singleBtn = document.getElementById('single-scrape-btn');
        this.singleStatus = document.getElementById('single-scrape-status');
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

        // Eventi scrape singolo
        this.singleBtn?.addEventListener('click', () => this.scrapeSinglePlayer());
        this.singleInput?.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.scrapeSinglePlayer();
        });

        document.getElementById('player-modal')?.addEventListener('click', e => {
            if (e.target.closest('.player-modal-close')) {
                document.getElementById('player-modal').style.display = 'none';
                if (this._playerModalFocusTrapCleanup) { this._playerModalFocusTrapCleanup(); this._playerModalFocusTrapCleanup = null; }
            }
        }, true); // usa capture per intercettare prima del focus trap
        document.getElementById('player-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('player-modal')) {
                document.getElementById('player-modal').style.display = 'none';
                if (this._playerModalFocusTrapCleanup) { this._playerModalFocusTrapCleanup(); this._playerModalFocusTrapCleanup = null; }
            }
        });
    }

    async scrapeSinglePlayer() {
        const url = this.singleInput?.value.trim();
        if (!url || !url.includes('fortnitetracker.com')) {
            this._setStatus(this.singleStatus, 'Inserisci un URL valido', 'warning');
            return;
        }

        this.singleBtn.disabled = true;
        this._setStatus(this.singleStatus, '<i class="fas fa-spinner fa-spin"></i> Scrape in corso...', 'running');

        try {
            const res = await fetch(API_BASE + '/api/talents/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileUrl: url, save: true }) // Passiamo 'save: true' per indicare al server di aggiungerlo al pool
            });

            if (res.ok) {
                this._setStatus(this.singleStatus, '<i class="fas fa-check"></i> Player aggiunto al pool!', 'success');
                this.singleInput.value = '';
                await this.loadTalentStats(); // Ricarica classifica
            } else {
                const err = await res.json();
                this._setStatus(this.singleStatus, 'Errore: ' + (err.error || 'Scrape fallito'), 'error');
            }
        } catch (e) {
            this._setStatus(this.singleStatus, 'Errore connessione', 'error');
        } finally {
            this.singleBtn.disabled = false;
        }
    }

    _setStatus(el, html, type) {
        if (!el) return;
        const colors = { success: '#2ecc71', warning: '#f39c12', error: '#e74c3c', running: '#00bcd4' };
        el.innerHTML = `<span style="color:${colors[type] || '#fff'}">${html}</span>`;
    }

    async loadData() {
        await Promise.all([this.loadUrls(), this.loadTalentStats()]);
    }

    async loadUrls() {
        try {
            const res = await fetch(API_BASE + '/api/talents/urls');
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
            if (this.urlInput) this.urlInput.disabled = false;
            if (this.addUrlBtn) { this.addUrlBtn.disabled = false; this.addUrlBtn.style.opacity = ''; }
            if (this.runScrapingBtn) { this.runScrapingBtn.disabled = false; this.runScrapingBtn.style.opacity = ''; }
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
            banner.innerHTML = `<i class="fas fa-info-circle"></i> <span>ModalitÃ  sola lettura â€” avvia il server in locale (<code>node server.js</code>) per gestire lo scouting.</span>`;
            this.scrapingStatus.parentElement?.insertBefore(banner, this.scrapingStatus.parentElement.firstChild);
        }
        if (this.urlInput) this.urlInput.disabled = true;
        if (this.addUrlBtn) { this.addUrlBtn.disabled = true; this.addUrlBtn.style.opacity = '0.4'; }
        if (this.runScrapingBtn) { this.runScrapingBtn.disabled = true; this.runScrapingBtn.style.opacity = '0.4'; }
    }

    async loadTalentStats() {
        try {
            try {
                const res = await fetch(API_BASE + '/api/talents/stats');
                if (res.ok) {
                    this.talentData = await res.json();
                    
                    // DATA VALIDATION: Warn if new metrics are missing for some players
                    if (this.talentData && this.talentData.players) {
                        this.talentData.players.forEach(p => {
                            if (p.eligible) {
                                if (p.prRecent10 === undefined || p.prRecent10 === null) {
                                    console.warn(`[ScoutingSystem] Player ${p.name} missing 'prRecent10' data.`);
                                }
                                // check talentMetrics if available (populated by computeTalentScores on backend)
                                if (p.talentMetrics && (p.talentMetrics.rank_delta_raw === undefined || p.talentMetrics.rank_delta_raw === null)) {
                                    console.warn(`[ScoutingSystem] Player ${p.name} missing 'rank_delta_raw' metric.`);
                                }
                            }
                        });
                    }

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
            const res = await fetch(API_BASE + '/api/talents/urls/add', {
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
            this.showStatus('Server non disponibile. Aggiungi l\'URL tramite il pannello admin se possibile.', 'warning');
        }
    }

    async removeUrl(index) {
        try {
            const res = await fetch(API_BASE + '/api/talents/urls/remove', {
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
            const res = await fetch(API_BASE + '/api/talents/run', {
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
        const doPoll = async () => {
            try {
                const res = await fetch(API_BASE + '/api/talents/status');
                if (!res.ok) return;
                const status = await res.json();

                const prog = status.progress || {};
                const pct = prog.pct ?? 0;
                const phase = prog.phase || 'In corso...';
                const done = prog.done ?? 0;
                const total = prog.total ?? 0;
                const totalLabel = total > 0 ? `${done}/${total}` : '';
                this.scrapingStatus.innerHTML =
                    `<div style="color:#60a5fa;margin-bottom:8px;font-size:0.85rem;"><i class="fas fa-spinner fa-spin"></i> ${this.escapeHtml(phase)}</div>` +
                    `<div style="background:rgba(255,255,255,0.08);border-radius:6px;overflow:hidden;height:10px;margin-bottom:6px;">` +
                        `<div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#3b82f6,#60a5fa);border-radius:6px;transition:width 0.6s ease;"></div>` +
                    `</div>` +
                    `<div style="display:flex;justify-content:space-between;font-size:0.75rem;color:rgba(255,255,255,0.5);">` +
                        `<span>${totalLabel}</span>` +
                        `<span style="font-weight:600;color:#60a5fa;">${pct}%</span>` +
                    `</div>`;

                if (!status.isRunning) {
                    clearInterval(this.pollInterval);
                    this.pollInterval = null;
                    this.runScrapingBtn.disabled = false;
                    this.showStatus('<i class="fas fa-check-circle" style="color:#2ecc71"></i> Scouting completato! Ricarico i dati...', 'success');
                    await this.loadTalentStats();
                }
            } catch {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
                this.runScrapingBtn.disabled = false;
            }
        };
        doPoll();
        this.pollInterval = setInterval(doPoll, 3000);
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
        // Dati giÃ  ordinati per talentScore desc dal scraper (eligible in cima, null in fondo)
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

        // -- Media Top N -------------------------------------------------------
        const TOP_N = Math.min(10, players.length);
        const topPlayers = players.slice(0, TOP_N);

        const withPR = topPlayers.filter(p => p.pr);
        const withScore = topPlayers.filter(p => p.talentScore != null);
        const withEarnings = topPlayers.filter(p => p.earnings);

        const avgPR = withPR.length ? Math.round(withPR.reduce((s, p) => s + p.pr, 0) / withPR.length) : null;
        const maxPR = withPR.length ? Math.max(...withPR.map(p => p.pr)) : null;
        const avgScore = withScore.length ? (withScore.reduce((s, p) => s + p.talentScore, 0) / withScore.length * 100).toFixed(1) : null;
        const avgEarnings = withEarnings.length ? Math.round(withEarnings.reduce((s, p) => s + p.earnings, 0) / withEarnings.length) : null;

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
            <div class="talent-table-wrapper" style="max-height: 550px; overflow-y: auto; scrollbar-width: thin; border: 1px solid rgba(0,188,212,0.2); border-radius: 10px; background: rgba(0,0,0,0.2);">
                <table class="talent-table" style="width:100%; border-collapse: collapse;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: #0a0a0f; box-shadow: 0 2px 10px rgba(0,0,0,0.5);">
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
        const pr = player.pr ? player.pr.toLocaleString('it-IT') : 'N/A';
        const earnings = player.earnings != null ? '$' + this.formatEarnings(player.earnings) : 'N/A';
        const score = player.talentScore != null
            ? `<span class="score-value">${(player.talentScore * 100).toFixed(1)}%</span>`
            : `<span style="color:#555;font-size:0.8rem">${player.eligible === false ? 'N/D' : 'â‚¬'}</span>`;
        const rowClass = player.success === false ? 'talent-row talent-row--error' : 'talent-row';

        return `
            <tr class="${rowClass}" data-name="${player.name.toLowerCase()}" onclick="window.scoutingSystem.showPlayerDetail(${index})" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.scoutingSystem.showPlayerDetail(${index})}">
                <td class="col-rank">${index + 1}</td>
                <td class="col-name">${this.escapeHtml(player.name)}</td>
                <td class="col-pr pr-value">${pr}</td>
                <td class="col-earnings">${earnings}</td>
                <td class="col-avgpr avgpr-value">${score}</td>
                <td class="col-link">
                    <a href="${player.profileUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="profile-link" aria-label="Apri profilo di ${this.escapeHtml(player.name)} su Fortnite Tracker">
                        <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                    </a>
                </td>
            </tr>
        `;
    }

    _initLeaderboardSearch() {
        const input = document.getElementById('leaderboard-search');
        if (!input) return;
        input.addEventListener('input', debounce(() => {
            const q = input.value.toLowerCase().trim();
            document.querySelectorAll('#talent-leaderboard .talent-row').forEach(row => {
                const name = row.dataset.name || '';
                row.style.display = !q || name.includes(q) ? '' : 'none';
            });
        }, 300));
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
        this._setLookupStatus('<i class="fas fa-circle-notch fa-spin"></i> Scansione in corso... potrebbe richiedere 30Ã¨60 secondi.', 'running');

        try {
            const res = await fetch(API_BASE + '/api/talents/lookup', {
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
                this._setLookupStatus(`Errore: ${escapeHtml(e.message)}`, 'error');
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
            // Badge "Lookup" per distinguerlo dai player giÃ  nel pool
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
                            <td class="${t.prEarned > 0 ? 'pr-positive' : ''}">${t.prEarned > 0 ? '+' + t.prEarned : 'â‚¬'}</td>
                        </tr>
                    `).join('')}</tbody>
               </table>`
            : '<p class="modal-no-stats">Nessun torneo trovato</p>';

        const m = player.talentMetrics;
        let metricsHtml = '';
        if (m) {
            // Mostra SOLO le metriche custom richieste: EARNEFF, PRDENSITY, RANKDELTA
            const allowedOrder = ['EARNEFF', 'PRDENSITY', 'RANKDELTA'];
            const entries = allowedOrder
                .map(key => [key, m[key]])
                .filter(([, val]) => val !== null && val !== undefined);

            if (entries.length > 0) {
                const itemsHtml = entries.map(([key, val]) => {
                    const label = this.escapeHtml(key);
                    let display = '';
                    if (typeof val === 'number') {
                        if (!isFinite(val)) {
                            display = 'N/D';
                        } else if (Math.abs(val) <= 1) {
                            display = (val * 100).toFixed(1) + '%';
                        } else {
                            display = val.toFixed(2);
                        }
                    } else {
                        display = this.escapeHtml(String(val));
                    }
                    return `
                        <div class="modal-metric-item">
                            <span class="modal-metric-label">${label}</span>
                            <span class="modal-metric-value">${display}</span>
                        </div>
                    `;
                }).join('');

                metricsHtml = `
                    <div class="modal-metrics-section">
                        <h3><i class="fas fa-chart-bar"></i> Metriche Talent Score${isLookup ? ' <small style="font-weight:400;font-size:0.75rem;color:#888;">(calcolato nel contesto del pool attuale)</small>' : ''}</h3>
                        <div class="modal-metrics-grid">
                            ${itemsHtml}
                        </div>
                    </div>
                `;
            }
        }

        const inactiveBanner = player.inactive
            ? `<div style="background:rgba(231,76,60,0.15);border:1px solid rgba(231,76,60,0.4);border-radius:8px;padding:0.6rem 1rem;margin-bottom:1rem;color:#e74c3c;font-size:0.85rem;">
                   <i class="fas fa-clock"></i> Player inattivo â€” ultimo evento piÃ¹ di 40 giorni fa (${player.lastEventDate || 'data non trovata'})
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

        const playerModal = document.getElementById('player-modal');
        playerModal.style.display = 'flex';
        requestAnimationFrame(() => {
            const focusable = Array.from(playerModal.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])'));
            const first = focusable.find(el => !el.disabled);
            if (first) first.focus();
        });
        if (this._playerModalFocusTrapCleanup) this._playerModalFocusTrapCleanup();
        this._playerModalFocusTrapCleanup = focusTrap(playerModal);
    }

    showStatus(message, type = 'info') {
        if (!this.scrapingStatus) return;
        const colors = { success: '#2ecc71', warning: '#f39c12', error: '#e74c3c', running: '#00bcd4', info: '#999' };
        this.scrapingStatus.innerHTML = `<span style="color:${colors[type] || colors.info}">${message}</span>`;
    }

    formatEarnings(n) {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
        return n.toString();
    }

    escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    _initLeaderboardSearch() {
        const input = document.getElementById('leaderboard-search');
        if (!input) return;
        input.addEventListener('input', debounce(() => {
            const q = input.value.toLowerCase().trim();
            document.querySelectorAll('#talent-leaderboard .talent-row').forEach(row => {
                const name = row.dataset.name || '';
                row.style.display = !q || name.includes(q) ? '' : 'none';
            });
        }, 300));
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
        this._setLookupStatus('<i class="fas fa-circle-notch fa-spin"></i> Scansione in corso... potrebbe richiedere 30Ã¨60 secondi.', 'running');

        try {
            const res = await fetch(API_BASE + '/api/talents/lookup', {
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
                this._setLookupStatus(`Errore: ${escapeHtml(e.message)}`, 'error');
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
            // Badge "Lookup" per distinguerlo dai player giÃ  nel pool
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
                            <td class="${t.prEarned > 0 ? 'pr-positive' : ''}">${t.prEarned > 0 ? '+' + t.prEarned : 'â‚¬'}</td>
                        </tr>
                    `).join('')}</tbody>
               </table>`
            : '<p class="modal-no-stats">Nessun torneo trovato</p>';

        const m = player.talentMetrics;
        let metricsHtml = '';
        if (m) {
            // Mostra SOLO le metriche custom richieste: EARNEFF, PRDENSITY, RANKDELTA
            const allowedOrder = ['EARNEFF', 'PRDENSITY', 'RANKDELTA'];
            const entries = allowedOrder
                .map(key => [key, m[key]])
                .filter(([, val]) => val !== null && val !== undefined);

            if (entries.length > 0) {
                const itemsHtml = entries.map(([key, val]) => {
                    const label = this.escapeHtml(key);
                    let display = '';
                    if (typeof val === 'number') {
                        if (!isFinite(val)) {
                            display = 'N/D';
                        } else if (Math.abs(val) <= 1) {
                            display = (val * 100).toFixed(1) + '%';
                        } else {
                            display = val.toFixed(2);
                        }
                    } else {
                        display = this.escapeHtml(String(val));
                    }
                    return `
                        <div class="modal-metric-item">
                            <span class="modal-metric-label">${label}</span>
                            <span class="modal-metric-value">${display}</span>
                        </div>
                    `;
                }).join('');

                metricsHtml = `
                    <div class="modal-metrics-section">
                        <h3><i class="fas fa-chart-bar"></i> Metriche Talent Score${isLookup ? ' <small style="font-weight:400;font-size:0.75rem;color:#888;">(calcolato nel contesto del pool attuale)</small>' : ''}</h3>
                        <div class="modal-metrics-grid">
                            ${itemsHtml}
                        </div>
                    </div>
                `;
            }
        }

        const inactiveBanner = player.inactive
            ? `<div style="background:rgba(231,76,60,0.15);border:1px solid rgba(231,76,60,0.4);border-radius:8px;padding:0.6rem 1rem;margin-bottom:1rem;color:#e74c3c;font-size:0.85rem;">
                   <i class="fas fa-clock"></i> Player inattivo â€” ultimo evento piÃ¹ di 40 giorni fa (${player.lastEventDate || 'data non trovata'})
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

        const playerModal = document.getElementById('player-modal');
        playerModal.style.display = 'flex';
        requestAnimationFrame(() => {
            const focusable = Array.from(playerModal.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])'));
            const first = focusable.find(el => !el.disabled);
            if (first) first.focus();
        });
        if (this._playerModalFocusTrapCleanup) this._playerModalFocusTrapCleanup();
        this._playerModalFocusTrapCleanup = focusTrap(playerModal);
    }

    showStatus(message, type = 'info') {
        if (!this.scrapingStatus) return;
        const colors = { success: '#2ecc71', warning: '#f39c12', error: '#e74c3c', running: '#00bcd4', info: '#999' };
        this.scrapingStatus.innerHTML = `<span style="color:${colors[type] || colors.info}">${message}</span>`;
    }

    formatEarnings(n) {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
        return n.toString();
    }

    escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}
