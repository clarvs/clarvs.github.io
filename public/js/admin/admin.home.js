// admin.home.js — requires admin.utils.js and admin.roster.js to be loaded first

// --- HOME CONTENT SYSTEM ------------------------------------------------------

class HomeContentSystem {
    constructor() {
        this.content = { news: [], events: [], social: { instagram: [], twitter: [] } };
        this.serverAvailable = false;
        this.editingNewsId = null;
        this.editingEventId = null;
        this.init();
    }

    async init() {
        await this.loadContent();
        this.bindEvents();
        this.renderAll();
    }

    async loadContent() {
        try {
            const res = await fetch('/api/home-content');
            if (res.ok) {
                this.content = await res.json();
                this.serverAvailable = true;
            } else {
                this.serverAvailable = false;
                this.content = { hero: {}, stats: {} };
            }
        } catch (e) {
            console.error('Errore caricamento home content:', e);
            this.serverAvailable = false;
            this.content = { hero: {}, stats: {} };
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
            banner.innerHTML = `<i class="fas fa-info-circle"></i> <span>Modalit� sola lettura � avvia il server (<code>node server.js</code>) per salvare le modifiche.</span>`;
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

    // -- News ------------------------------------------------------------------

    renderNewsTable() {
        const tbody = document.getElementById('news-tbody');
        if (!tbody) return;
        const news = this.content.news || [];
        if (news.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:2rem">Nessuna notizia. Clicca "Aggiungi Notizia".</td></tr>';
            return;
        }
        tbody.innerHTML = news.map(n => `
            <tr class="roster-row">
                <td style="width:40px;">${n.image ? `<img src="${n.image}" alt="${this.esc(n.title)}" style="height:32px;width:32px;border-radius:4px;object-fit:cover;border:1px solid rgba(255,255,255,0.1);">` : '<div style="width:32px;height:32px;background:rgba(255,255,255,0.05);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#444;"><i class="fas fa-image"></i></div>'}</td>
                <td class="roster-name">${this.esc(n.title)}</td>
                <td>${this.esc(n.date)}</td>
                <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(255,255,255,0.6);font-size:0.85rem">${this.esc(n.content)}</td>
                <td class="roster-actions">
                    <button class="action-btn edit-btn"   onclick="window.homeContentSystem.openNewsModal(${n.id})" aria-label="Modifica: ${this.esc(n.title)}"><i class="fas fa-edit" aria-hidden="true"></i></button>
                    <button class="action-btn delete-btn" onclick="window.homeContentSystem.deleteNews(${n.id})"    aria-label="Elimina: ${this.esc(n.title)}"><i class="fas fa-trash" aria-hidden="true"></i></button>
                </td>
            </tr>
        `).join('');
    }

    openNewsModal(id = null) {
        this.editingNewsId = id;
        const titleEl = document.getElementById('news-modal-title');
        if (titleEl) titleEl.textContent = id ? 'Modifica Notizia' : 'Aggiungi Notizia';
        if (id !== null) {
            const n = this.content.news.find(x => x.id === id);
            if (!n) return;
            const fTitle = document.getElementById('fn-title'); if (fTitle) fTitle.value = n.title || '';
            const fDate = document.getElementById('fn-date'); if (fDate) fDate.value = n.date || '';
            const fImg = document.getElementById('fn-image'); if (fImg) fImg.value = n.image || '';
            const fCont = document.getElementById('fn-content'); if (fCont) fCont.value = n.content || '';
        } else {
            document.getElementById('news-form')?.reset();
        }
        const newsModal = document.getElementById('news-modal');
        newsModal.style.display = 'flex';
        requestAnimationFrame(() => {
            const focusable = Array.from(newsModal.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])'));
            const first = focusable.find(el => !el.disabled);
            if (first) first.focus();
        });
        if (this._newsFocusTrapCleanup) this._newsFocusTrapCleanup();
        this._newsFocusTrapCleanup = focusTrap(newsModal);
    }

    closeNewsModal() {
        document.getElementById('news-modal').style.display = 'none';
        this.editingNewsId = null;
        if (this._newsFocusTrapCleanup) { this._newsFocusTrapCleanup(); this._newsFocusTrapCleanup = null; }
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

    // -- Events ----------------------------------------------------------------

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
                    <button class="action-btn edit-btn"   onclick="window.homeContentSystem.openEventModal(${ev.id})" aria-label="Modifica: ${this.esc(ev.title)}"><i class="fas fa-edit" aria-hidden="true"></i></button>
                    <button class="action-btn delete-btn" onclick="window.homeContentSystem.deleteEvent(${ev.id})"    aria-label="Elimina: ${this.esc(ev.title)}"><i class="fas fa-trash" aria-hidden="true"></i></button>
                </td>
            </tr>
        `).join('');
    }

    openEventModal(id = null) {
        this.editingEventId = id;
        const titleEl = document.getElementById('event-modal-title');
        if (titleEl) titleEl.textContent = id ? 'Modifica Evento' : 'Aggiungi Evento';
        if (id !== null) {
            const ev = this.content.events.find(x => x.id === id);
            if (!ev) return;
            const fTitle = document.getElementById('fe-title'); if (fTitle) fTitle.value = ev.title || '';
            const fDate = document.getElementById('fe-date'); if (fDate) fDate.value = ev.date || '';
            const fTime = document.getElementById('fe-time'); if (fTime) fTime.value = ev.time || '';
            const fType = document.getElementById('fe-type'); if (fType) fType.value = ev.type || '';
        } else {
            document.getElementById('event-form')?.reset();
        }
        const eventModal = document.getElementById('event-modal');
        eventModal.style.display = 'flex';
        requestAnimationFrame(() => {
            const focusable = Array.from(eventModal.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])'));
            const first = focusable.find(el => !el.disabled);
            if (first) first.focus();
        });
        if (this._eventFocusTrapCleanup) this._eventFocusTrapCleanup();
        this._eventFocusTrapCleanup = focusTrap(eventModal);
    }

    closeEventModal() {
        document.getElementById('event-modal').style.display = 'none';
        this.editingEventId = null;
        if (this._eventFocusTrapCleanup) { this._eventFocusTrapCleanup(); this._eventFocusTrapCleanup = null; }
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

    // -- Social ----------------------------------------------------------------

    renderSocialLists() {
        this._renderSocialPlatform('instagram', 'instagram-links-list', 'permalink', 'URL post Instagram (es. https://www.instagram.com/p/XXX/)');
        this._renderSocialPlatform('twitter', 'twitter-links-list', 'link', 'URL tweet (es. https://twitter.com/user/status/XXX)');
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
        const idx = parseInt(input.dataset.idx);
        const field = input.dataset.field;
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

    // -- Persist ---------------------------------------------------------------

    async persist(statusEl = null) {
        if (!this.serverAvailable) {
            window.showToast('Server non disponibile � avvia node server.js per salvare', 'error');
            return;
        }
        try {
            const res = await fetch('/api/home-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.content)
            });
            if (res.ok) {
                window.showToast('Home aggiornata con successo', 'success');
                if (statusEl) statusEl.innerHTML = '<span style="color:#2ecc71"><i class="fas fa-check"></i> Salvato</span>';
            } else {
                window.showToast('Errore nel salvataggio', 'error');
            }
        } catch {
            window.showToast('Errore di connessione', 'error');
        }
        if (statusEl) setTimeout(() => { statusEl.innerHTML = ''; }, 3000);
    }

    esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}
