// admin.tv.js — requires admin.utils.js and admin.roster.js to be loaded first

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

    // -- Streamer CRUD ---------------------------------------------------------

    /** Carica i player del Roster che hanno Twitch o YouTube (sola lettura) */
    async loadRosterStreamers() {
        this.rosterStreamers = [];
        try {
            let data = null;
            try { const r = await fetch(API_BASE + '/api/roster'); if (r.ok) data = await r.json(); } catch { }
            // Solo API
            if (!data) { /* fall through */ }
            if (!data) return;

            for (const p of data) {
                const twitch = this._parseTwitch(p.socials?.twitch);
                const ytHandle = this._parseYt(p.socials?.youtube);
                if (!twitch && !ytHandle) continue;
                this.rosterStreamers.push({
                    id: `roster_${p.id}`,
                    name: p.name,
                    avatar: p.imageUrl || null,
                    twitch: twitch,
                    youtubeUrl: p.socials?.youtube || null,
                    youtubeHandle: ytHandle,
                    source: 'roster'
                });
            }
        } catch (e) { console.error('[TVSystem] Errore roster:', e); }
    }

    /** Carica la lista manuale salvata (persone non nel Roster) */
    async loadManualStreamers() {
        this.streamers = [];
        try {
            const res = await fetch(API_BASE + '/api/tv/streamers');
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
            await fetch(API_BASE + '/api/tv/streamers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.streamers)
            });
        } catch { /* server offline � localStorage � sufficiente */ }
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
        const manualRows = (this.streamers || []);

        // Deduplicazione: escludi dalla lista manuale chi � gi� nel roster
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
                    ${s.avatar ? `<img src="${this.esc(s.avatar)}" alt="${this.esc(s.name)}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;margin-right:8px;vertical-align:middle;border:1px solid rgba(0,188,212,0.3)">` : ''}
                    ${this.esc(s.name)}
                    ${isAutomatic ? `<span style="font-size:0.68rem;color:rgba(0,188,212,0.6);margin-left:6px;padding:1px 6px;border:1px solid rgba(0,188,212,0.25);border-radius:10px;">Roster</span>` : ''}
                </td>
                <td>
                    ${s.twitch
                ? `<a href="https://twitch.tv/${this.esc(s.twitch)}" target="_blank" rel="noopener noreferrer" class="social-mini" aria-label="Twitch: ${this.esc(s.twitch)}"><i class="fab fa-twitch" aria-hidden="true"></i> ${this.esc(s.twitch)}</a>`
                : '<span style="color:#555">�</span>'}
                </td>
                <td>
                    ${s.youtubeUrl
                ? `<a href="${this.esc(s.youtubeUrl)}" target="_blank" rel="noopener noreferrer" class="social-mini" aria-label="YouTube: ${this.esc(s.youtubeHandle || s.youtubeUrl)}"><i class="fab fa-youtube" aria-hidden="true"></i> ${this.esc(s.youtubeHandle || s.youtubeUrl)}</a>`
                : '<span style="color:#555">�</span>'}
                </td>
                <td class="roster-actions">
                    ${isAutomatic
                ? `<span style="font-size:0.75rem;color:rgba(255,255,255,0.25);padding:0 0.5rem;" title="Gestito dal Roster">auto</span>`
                : `<button class="action-btn edit-btn"   onclick="window.tvSystem.openModal(${s.id})"      aria-label="Modifica ${this.esc(s.name)}"><i class="fas fa-edit" aria-hidden="true"></i></button>
                           <button class="action-btn delete-btn" onclick="window.tvSystem.deleteStreamer(${s.id})"  aria-label="Elimina ${this.esc(s.name)}"><i class="fas fa-trash" aria-hidden="true"></i></button>`}
                </td>
            </tr>`;

        tbody.innerHTML =
            rosterRows.map(s => rowHtml(s, true)).join('') +
            uniqueManual.map(s => rowHtml(s, false)).join('');
    }

    openModal(id = null) {
        this.editingId = id;
        const modal = document.getElementById('tv-streamer-modal');
        const title = document.getElementById('tv-streamer-modal-title');
        const form = document.getElementById('tv-streamer-form');

        if (id !== null) {
            const s = this.streamers.find(x => x.id === id);
            if (!s) return;
            title.textContent = `Modifica: ${s.name}`;
            document.getElementById('tvs-name').value = s.name || '';
            document.getElementById('tvs-avatar').value = s.avatar || '';
            document.getElementById('tvs-twitch').value = s.twitch || '';
            document.getElementById('tvs-youtube').value = s.youtubeUrl || '';
        } else {
            title.textContent = 'Aggiungi Streamer';
            form.reset();
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
        document.getElementById('tv-streamer-modal').style.display = 'none';
        this.editingId = null;
        if (this._focusTrapCleanup) { this._focusTrapCleanup(); this._focusTrapCleanup = null; }
    }

    async saveStreamer() {
        const v = id => document.getElementById(id)?.value.trim() || '';

        const name = v('tvs-name');
        const avatar = v('tvs-avatar');
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

    // -- Utility ---------------------------------------------------------------

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

    toast(msg, type) {
        type = type || 'info';
        if (typeof window.showToast === 'function') {
            window.showToast(msg, type);
        }
    }

    esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}
