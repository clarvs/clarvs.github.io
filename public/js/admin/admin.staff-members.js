// admin.staff-members.js - Gestione staffer del team
class StaffMemberSystem {
    constructor() {
        this.staff = [];
        this.editingId = null;
        this.serverAvailable = false;
        this._deleteResolve = null;
        this.bindEvents();
        this.loadStaff();
    }

    bindEvents() {
        document.getElementById('add-staffer-btn')?.addEventListener('click', () => this.openModal());
        document.getElementById('staffer-modal-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('staffer-form-cancel')?.addEventListener('click', () => this.closeModal());
        document.getElementById('staffer-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('staffer-modal')) this.closeModal();
        });
        document.getElementById('staffer-form')?.addEventListener('submit', e => {
            e.preventDefault();
            this.saveStaffer();
        });
        document.getElementById('staffer-delete-confirm-btn')?.addEventListener('click', () => this._closeDeleteModal(true));
        document.getElementById('staffer-delete-cancel-btn')?.addEventListener('click', () => this._closeDeleteModal(false));
        document.getElementById('staffer-delete-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('staffer-delete-modal')) this._closeDeleteModal(false);
        });
        document.querySelectorAll('.roster-subtab').forEach(btn => {
            btn.addEventListener('click', () => this._activateSubTab(btn.dataset.subtab));
        });
    }

    _showDeleteModal(name) {
        return new Promise(resolve => {
            document.getElementById('staffer-delete-name').textContent = name;
            document.getElementById('staffer-delete-modal').style.display = 'flex';
            document.getElementById('staffer-delete-confirm-btn').focus();
            this._deleteResolve = resolve;
        });
    }

    _closeDeleteModal(result) {
        document.getElementById('staffer-delete-modal').style.display = 'none';
        if (this._deleteResolve) {
            this._deleteResolve(result);
            this._deleteResolve = null;
        }
    }

    _activateSubTab(name) {
        document.querySelectorAll('.roster-subtab').forEach(b => b.classList.toggle('active', b.dataset.subtab === name));
        document.querySelectorAll('.roster-subtab-content').forEach(c => {
            c.style.display = c.dataset.subtab === name ? 'block' : 'none';
        });
    }

    async loadStaff() {
        try {
            const res = await fetch('/api/staff');
            if (res.ok) { this.staff = await res.json(); this.serverAvailable = true; }
            else { this.serverAvailable = false; this.staff = []; }
        } catch (e) { this.serverAvailable = false; this.staff = []; }
        this._updateReadonlyBanner();
        this.renderGrid();
    }

    _updateReadonlyBanner() {
        const existing = document.getElementById('staff-members-readonly-banner');
        const addBtn = document.getElementById('add-staffer-btn');
        if (this.serverAvailable) { existing?.remove(); addBtn?.removeAttribute('disabled'); return; }
        if (!existing) {
            const banner = document.createElement('div');
            banner.id = 'staff-members-readonly-banner';
            banner.style.cssText = 'background:rgba(243,156,18,0.15);border:1px solid rgba(243,156,18,0.4);border-radius:8px;padding:0.75rem 1rem;margin-bottom:1rem;color:#f39c12;font-size:0.9rem;display:flex;align-items:center;gap:0.6rem;';
            banner.innerHTML = '<i class="fas fa-info-circle"></i> <span>Modalita sola lettura &mdash; avvia il server per modificare lo staff.</span>';
            const c = document.getElementById('staff-members-tbody');
            c?.parentElement?.insertBefore(banner, c);
        }
        if (addBtn) { addBtn.disabled = true; addBtn.style.opacity = '0.4'; addBtn.style.cursor = 'not-allowed'; }
    }

    renderGrid() {
        const container = document.getElementById('staff-members-tbody');
        if (!container) return;
        if (!this.staff.length) {
            container.innerHTML = '<div style="text-align:center;color:#888;padding:2rem;grid-column:1/-1">Nessun membro staff.</div>';
            return;
        }
        const sectionLabel = { leader: 'Leader', staffer: 'Staffer' };
        container.innerHTML = this.staff.map(s => {
            const isLeader = s.section === 'leader';
            const bc  = isLeader ? '#ffd700' : '#3b82f6';
            const bb  = isLeader ? 'rgba(255,215,0,0.15)' : 'rgba(37,99,235,0.15)';
            const bbd = isLeader ? 'rgba(255,215,0,0.3)'  : 'rgba(37,99,235,0.3)';
            const dis = !this.serverAvailable ? 'disabled' : '';
            return '<div class="roster-card" role="listitem">' +
                '<div class="roster-card-header">' +
                '<span class="roster-name">' + this.esc(s.name) + '</span>' +
                '<span style="background:' + bb + ';color:' + bc + ';border:1px solid ' + bbd + ';border-radius:4px;padding:2px 8px;font-size:0.75rem;">' + (sectionLabel[s.section] || s.section) + '</span>' +
                '</div>' +
                '<div class="roster-card-fields">' +
                '<div class="card-field"><span class="card-field-label">Ruolo</span><span>' + this.esc(s.role || '-') + '</span></div>' +
                '<div class="card-field"><span class="card-field-label">Area</span><span>' + this.esc(s.game || '-') + '</span></div>' +
                '<div class="card-field"><span class="card-field-label">Ordine</span><span>' + (s.sortOrder != null ? s.sortOrder : 0) + '</span></div>' +
                '</div>' +
                '<div class="card-actions">' +
                '<button class="action-btn edit-btn btn-touch-44" onclick="window.staffMemberSystem.openModal(' + s.id + ')" ' + dis + '><i class="fas fa-edit"></i> Modifica</button>' +
                '<button class="action-btn delete-btn btn-touch-44" onclick="window.staffMemberSystem.deleteStaffer(' + s.id + ')" ' + dis + '><i class="fas fa-trash"></i> Elimina</button>' +
                '</div></div>';
        }).join('');
    }

    openModal(id) {
        this.editingId = (id != null) ? id : null;
        const modal = document.getElementById('staffer-modal');
        const title = document.getElementById('staffer-modal-title');
        if (this.editingId !== null) {
            const s = this.staff.find(x => x.id === this.editingId);
            if (!s) return;
            title.textContent = 'Modifica: ' + s.name;
            document.getElementById('sf-name').value      = s.name || '';
            document.getElementById('sf-section').value   = s.section || 'staffer';
            document.getElementById('sf-role').value      = s.role || '';
            document.getElementById('sf-game').value      = s.game || '';
            document.getElementById('sf-imageUrl').value  = s.imageUrl || '';
            document.getElementById('sf-sortOrder').value = s.sortOrder != null ? s.sortOrder : 0;
        } else {
            title.textContent = 'Aggiungi Staffer';
            document.getElementById('staffer-form').reset();
        }
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            const f = modal.querySelector('input:not([type=hidden]),select');
            if (f) f.focus();
        });
    }

    closeModal() {
        document.getElementById('staffer-modal').style.display = 'none';
        this.editingId = null;
    }

    async saveStaffer() {
        const v = id => { const el = document.getElementById(id); return el ? el.value.trim() || null : null; };
        const payload = {
            name:      v('sf-name'),
            section:   document.getElementById('sf-section').value,
            role:      v('sf-role'),
            game:      v('sf-game'),
            imageUrl:  v('sf-imageUrl'),
            sortOrder: parseInt(document.getElementById('sf-sortOrder').value) || 0
        };
        try {
            const url    = this.editingId !== null ? '/api/staff/' + this.editingId : '/api/staff';
            const method = this.editingId !== null ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const wasEditing = this.editingId !== null;
                this.closeModal();
                await this.loadStaff();
                if (window.showToast) window.showToast(wasEditing ? 'Staffer aggiornato' : 'Staffer aggiunto', 'success');
            } else {
                if (window.showToast) window.showToast('Errore nel salvataggio', 'error');
            }
        } catch (e) {
            if (window.showToast) window.showToast('Server non disponibile', 'error');
        }
    }

    async deleteStaffer(id) {
        const s = this.staff.find(x => x.id === id);
        if (!s) return;
        const confirmed = await this._showDeleteModal(s.name);
        if (!confirmed) return;
        try {
            const res = await fetch('/api/staff/' + id, { method: 'DELETE' });
            if (res.ok) {
                if (window.showToast) window.showToast(s.name + ' eliminato', 'success');
                await this.loadStaff();
            } else {
                if (window.showToast) window.showToast('Errore eliminazione', 'error');
            }
        } catch (e) {
            if (window.showToast) window.showToast('Server non disponibile', 'error');
        }
    }

    esc(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}
