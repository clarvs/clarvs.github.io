// admin.roster.js — requires admin.utils.js to be loaded first. Provides window.rosterSystem.showToast() used by other systems.

// --- ROSTER SYSTEM ------------------------------------------------------------

class RosterSystem {
    constructor() {
        this.roster = [];
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
            const deleteModal = document.getElementById('delete-confirm-modal');
            deleteModal.style.display = 'flex';
            requestAnimationFrame(() => {
                const focusable = Array.from(deleteModal.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])'));
                const first = focusable.find(el => !el.disabled);
                if (first) first.focus();
            });
            if (this._deleteFocusTrapCleanup) this._deleteFocusTrapCleanup();
            this._deleteFocusTrapCleanup = focusTrap(deleteModal);
            this._deleteResolve = resolve;
        });
    }

    _closeDeleteConfirm(result) {
        document.getElementById('delete-confirm-modal').style.display = 'none';
        if (this._deleteFocusTrapCleanup) { this._deleteFocusTrapCleanup(); this._deleteFocusTrapCleanup = null; }
        if (this._deleteResolve) {
            this._deleteResolve(result);
            this._deleteResolve = null;
        }
    }

    async loadRoster() {
        try {
            const res = await fetch(API_BASE + '/api/roster');
            if (res.ok) {
                this.roster = await res.json();
                this.serverAvailable = true;
            } else {
                this.serverAvailable = false;
                this.roster = [];
            }
        } catch (e) {
            console.error('Errore caricamento roster:', e);
            this.serverAvailable = false;
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
            banner.innerHTML = `<i class="fas fa-info-circle"></i> <span>Modalit� sola lettura � avvia il server in locale (<code>node server.js</code>) per aggiungere o modificare player.</span>`;
            const table = document.getElementById('roster-tbody')?.closest('table') || document.getElementById('add-player-btn')?.parentElement;
            table?.parentElement?.insertBefore(banner, table.parentElement.firstChild);
        }

        const addBtn = document.getElementById('add-player-btn');
        if (addBtn) { addBtn.disabled = true; addBtn.style.opacity = '0.4'; addBtn.style.cursor = 'not-allowed'; }
    }

    renderTable() {
        const container = document.getElementById('roster-tbody');
        if (!container) return;

        if (this.roster.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#888;padding:2rem;grid-column:1/-1">Nessun player nel roster.</div>';
            return;
        }

        container.innerHTML = this.roster.map(p => `
            <div class="roster-card" role="listitem">
                <div class="roster-card-header">
                    <span class="roster-name">${this.escapeHtml(p.name)}</span>
                    <span class="category-badge category-${p.category}">${this.formatCategory(p.category)}</span>
                </div>
                <div class="roster-card-fields">
                    <div class="card-field">
                        <span class="card-field-label">Ruolo</span>
                        <span>${this.escapeHtml(p.role)}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-field-label">Social</span>
                        <div class="roster-socials">${this.renderSocials(p.socials || {})}</div>
                    </div>
                    <div class="card-field">
                        <span class="card-field-label">Tracker</span>
                        <span>${p.ftTrackerUrl ? '<span class="tracker-yes">✓</span>' : '<span class="tracker-no">✗</span>'}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn edit-btn btn-touch-44" onclick="window.rosterSystem.openModal(${p.id})" aria-label="Modifica ${this.escapeHtml(p.name)}" ${!this.serverAvailable ? 'disabled' : ''}>
                        <i class="fas fa-edit" aria-hidden="true"></i> Modifica
                    </button>
                    <button class="action-btn delete-btn btn-touch-44" onclick="window.rosterSystem.deletePlayer(${p.id})" aria-label="Elimina ${this.escapeHtml(p.name)}" ${!this.serverAvailable ? 'disabled' : ''}>
                        <i class="fas fa-trash" aria-hidden="true"></i> Elimina
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSocials(socials) {
        const icons = {
            twitter: 'fab fa-twitter',
            instagram: 'fab fa-instagram',
            twitch: 'fab fa-twitch',
            youtube: 'fab fa-youtube',
            tiktok: 'fab fa-tiktok'
        };
        const labels = { twitter: 'Twitter', instagram: 'Instagram', twitch: 'Twitch', youtube: 'YouTube', tiktok: 'TikTok' };
        const links = Object.entries(socials)
            .filter(([, url]) => url)
            .map(([p, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="social-mini" aria-label="${labels[p] || p}"><i class="${icons[p] || 'fas fa-link'}" aria-hidden="true"></i></a>`)
            .join('');
        return links || '<span style="color:#666" aria-label="Nessun social">—</span>';
    }

    formatCategory(cat) {
        const map = {
            proPlayer: 'Pro Player',
            talent: 'Talent',
            academy: 'Academy',
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
        requestAnimationFrame(() => {
            const focusable = Array.from(modal.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])'));
            const first = focusable.find(el => !el.disabled);
            if (first) first.focus();
        });
        if (this._focusTrapCleanup) this._focusTrapCleanup();
        this._focusTrapCleanup = focusTrap(modal);
    }

    closeModal() {
        document.getElementById('roster-modal').style.display = 'none';
        this.editingId = null;
        if (this._focusTrapCleanup) { this._focusTrapCleanup(); this._focusTrapCleanup = null; }
    }

    fillForm(player) {
        document.getElementById('f-name').value = player.name || '';
        document.getElementById('f-category').value = player.category || 'proPlayer';
        document.getElementById('f-role').value = player.role || '';
        document.getElementById('f-game').value = player.game || '';
        document.getElementById('f-imageUrl').value = player.imageUrl || '';
        document.getElementById('f-ftTrackerUrl').value = player.ftTrackerUrl || '';
        document.getElementById('f-ftTrackerUsername').value = player.ftTrackerUsername || '';
        document.getElementById('f-ftPlatform').value = player.ftPlatform || '';
        document.getElementById('f-ftRegion').value = player.ftRegion || '';
        document.getElementById('f-twitter').value = player.socials?.twitter || '';
        document.getElementById('f-instagram').value = player.socials?.instagram || '';
        document.getElementById('f-twitch').value = player.socials?.twitch || '';
        document.getElementById('f-youtube').value = player.socials?.youtube || '';
        document.getElementById('f-tiktok').value = player.socials?.tiktok || '';
    }

    buildPlayerFromForm() {
        const v = id => document.getElementById(id)?.value.trim() || null;
        return {
            name: v('f-name'),
            category: document.getElementById('f-category').value,
            role: v('f-role'),
            game: v('f-game'),
            imageUrl: v('f-imageUrl'),
            ftTrackerUrl: v('f-ftTrackerUrl'),
            ftTrackerUsername: v('f-ftTrackerUsername'),
            ftPlatform: v('f-ftPlatform'),
            ftRegion: v('f-ftRegion'),
            socials: {
                twitter: v('f-twitter'),
                instagram: v('f-instagram'),
                twitch: v('f-twitch'),
                youtube: v('f-youtube'),
                tiktok: v('f-tiktok')
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
                res = await fetch(API_BASE + '/api/roster', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(playerData)
                });
            }

            if (res.ok) {
                const wasEditing = this.editingId !== null;
                this.closeModal();
                await this.loadRoster();
                window.showToast && window.showToast(wasEditing ? 'Player aggiornato con successo' : 'Player aggiunto al roster', 'success');
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

    showToast(message, type) {
        type = type || 'info';
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        }
    }

    escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}