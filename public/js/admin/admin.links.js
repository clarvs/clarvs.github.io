// admin.links.js â requires admin.utils.js to be loaded first

class LinkSystem {
    constructor() {
        this.container = document.getElementById('links-container');
        this.addBtn = document.getElementById('add-link-btn');
        this.saveBtn = document.getElementById('save-links-btn');
        this.links = [];

        this.addBtn?.addEventListener('click', () => this.addLink());
        this.saveBtn?.addEventListener('click', () => this.saveLinks());
    }

    async load() {
        try {
            const res = await fetch('/api/links');
            if (res.ok) {
                this.links = await res.json();
                this.render();
            }
        } catch (e) {
            console.error('Errore caricamento link:', e);
        }
    }

    render() {
        if (!this.container) return;
        if (this.links.length === 0) {
            this.container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 15px;">
                    <i class="fas fa-link" style="font-size: 2rem; margin-bottom: 1rem; display: block; opacity: 0.5;"></i>
                    <p>Nessun link presente. Aggiungine uno per iniziare.</p>
                </div>
            `;
            return;
        }
        this.container.innerHTML = this.links.map((link, index) => `
            <div class="link-item" style="display:grid; grid-template-columns: 1fr 2fr 1fr 1fr 40px; gap:10px; background:rgba(255,255,255,0.03); padding:1rem; border-radius:10px; margin-bottom:10px; align-items:center; border:1px solid rgba(255,255,255,0.05);">
                <input type="text" class="link-label" placeholder="Etichetta (es. Home)" value="${link.label || ''}" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); padding:8px; border-radius:6px; color:#fff;">
                <input type="text" class="link-url" placeholder="URL (es. pages/tv.html)" value="${link.url || ''}" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); padding:8px; border-radius:6px; color:#fff;">
                <select class="link-category" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); padding:8px; border-radius:6px; color:#fff;">
                    <option value="nav" ${link.category === 'nav' ? 'selected' : ''}>Navigazione</option>
                    <option value="social" ${link.category === 'social' ? 'selected' : ''}>Social (Footer)</option>
                    <option value="hero" ${link.category === 'hero' ? 'selected' : ''}>Hero (CTA)</option>
                </select>
                <input type="text" class="link-icon" placeholder="Icona (fas fa-link)" value="${link.icon || ''}" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); padding:8px; border-radius:6px; color:#fff;">
                <button onclick="window.linkSystem.deleteLink(${index})" style="background:rgba(239,68,68,0.2); border:none; color:#ef4444; width:34px; height:34px; border-radius:6px; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
    }

    addLink() {
        const items = document.querySelectorAll('.link-item');
        const currentLinks = Array.from(items).map(item => ({
            label: item.querySelector('.link-label').value,
            url: item.querySelector('.link-url').value,
            category: item.querySelector('.link-category').value,
            icon: item.querySelector('.link-icon').value
        }));
        currentLinks.push({ label: '', url: '', category: 'nav', icon: '' });
        this.links = currentLinks;
        this.render();
    }

    deleteLink(index) {
        this.links.splice(index, 1);
        this.render();
    }

    async saveLinks() {
        const items = document.querySelectorAll('.link-item');
        const data = Array.from(items).map(item => ({
            label: item.querySelector('.link-label').value,
            url: item.querySelector('.link-url').value,
            category: item.querySelector('.link-category').value,
            icon: item.querySelector('.link-icon').value,
            is_external: item.querySelector('.link-url').value.startsWith('http')
        }));

        // Grafica personalizzata - Conferma prima di salvare
        if (typeof Swal !== 'undefined') {
            const result = await Swal.fire({
                title: 'CONFERMA SALVATAGGIO',
                text: 'Vuoi salvare le modifiche ai link? I collegamenti attuali verranno aggiornati.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sì, AGGIORNA',
                cancelButtonText: 'ANNULLA',
                background: '#0f172a',
                color: '#fff',
                customClass: {
                    popup: 'clarvs-swal-popup',
                    title: 'clarvs-swal-title',
                    confirmButton: 'run-btn clarvs-swal-confirm',
                    cancelButton: 'access-btn secondary clarvs-swal-cancel',
                    htmlContainer: 'clarvs-swal-text'
                },
                buttonsStyling: false
            });
            if (!result.isConfirmed) return;
        }

        this.saveBtn.disabled = true;
        this.saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvataggio...';

        try {
            const res = await fetch('/api/admin/links', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'LINK AGGIORNATI!',
                        text: 'Tutte le modifiche ai collegamenti sono state salvate.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        background: '#0f172a',
                        color: '#fff',
                        customClass: {
                            popup: 'clarvs-swal-popup',
                            title: 'clarvs-swal-title',
                            htmlContainer: 'clarvs-swal-text'
                        }
                    });
                } else {
                    window.showToast('Link aggiornati con successo!', 'success');
                }
                this.load();
            } else {
                const err = await res.json();
                window.showToast('Errore: ' + err.error, 'error');
            }
        } catch (e) {
            window.showToast('Errore di rete durante il salvataggio.', 'error');
        } finally {
            this.saveBtn.disabled = false;
            this.saveBtn.innerHTML = '<i class="fas fa-save"></i> Salva Modifiche';
        }
    }
}