// admin.ccc.js — CCC Admin System

// ─── Modal Helper ────────────────────────────────────────────────────────────
function cccModal(title, fields, opts) {
    // fields: [{id, label, type:'text'|'textarea'|'select'|'number', placeholder, value, options:[{v,l}], min, step, required}]
    // opts: { confirmText, cancelText, danger }
    return new Promise(function(resolve) {
        opts = opts || {};
        var overlay = document.createElement('div');
        overlay.className = 'ccc-modal-overlay';
        var rows = fields.map(function(f) {
            var inp = '';
            if (f.type === 'select') {
                inp = '<select id="cccm-' + f.id + '" class="ccc-modal-input">';
                (f.options||[]).forEach(function(o){ inp += '<option value="' + o.v + '"' + (String(f.value)===String(o.v)?' selected':'') + '>' + o.l + '</option>'; });
                inp += '</select>';
            } else if (f.type === 'textarea') {
                inp = '<textarea id="cccm-' + f.id + '" class="ccc-modal-input" placeholder="' + (f.placeholder||'') + '" rows="6">' + (f.value||'') + '</textarea>';
            } else {
                var extra = f.min !== undefined ? ' min="' + f.min + '"' : '';
                extra += f.step ? ' step="' + f.step + '"' : '';
                inp = '<input id="cccm-' + f.id + '" class="ccc-modal-input" type="' + (f.type||'text') + '" placeholder="' + (f.placeholder||'') + '" value="' + (f.value||'') + '"' + extra + '>';
            }
            var info = f.info ? '<div class="ccc-modal-info">' + f.info + '</div>' : '';
            return '<div class="ccc-modal-field">' + (f.label ? '<label class="ccc-modal-label" for="cccm-' + f.id + '">' + f.label + '</label>' : '') + inp + info + '</div>';
        });
        overlay.innerHTML = '<div class="ccc-modal-box">'
            + '<div class="ccc-modal-header"><span>' + title + '</span><button class="ccc-modal-x" id="cccm-x">&times;</button></div>'
            + '<div class="ccc-modal-body">' + rows.join('') + '</div>'
            + '<div class="ccc-modal-footer">'
            + '<button class="ccc-modal-btn cancel" id="cccm-cancel">' + (opts.cancelText||'Annulla') + '</button>'
            + '<button class="ccc-modal-btn confirm' + (opts.danger?' danger':'') + '" id="cccm-ok">' + (opts.confirmText||'Conferma') + '</button>'
            + '</div></div>';
        document.body.appendChild(overlay);
        requestAnimationFrame(function(){ overlay.classList.add('open'); });
        var firstInput = overlay.querySelector('input, select, textarea');
        if (firstInput) setTimeout(function(){ firstInput.focus(); }, 80);
        function close(val) {
            overlay.classList.remove('open');
            setTimeout(function(){ overlay.remove(); }, 250);
            resolve(val);
        }
        function submit() {
            var out = {};
            fields.forEach(function(f){
                var el = document.getElementById('cccm-' + f.id);
                if (el) out[f.id] = (f.type==='number') ? (parseFloat(el.value)||0) : el.value;
            });
            close(out);
        }
        overlay.querySelector('#cccm-ok').addEventListener('click', submit);
        overlay.querySelector('#cccm-cancel').addEventListener('click', function(){ close(null); });
        overlay.querySelector('#cccm-x').addEventListener('click', function(){ close(null); });
        overlay.addEventListener('click', function(e){ if (e.target === overlay) close(null); });
        overlay.addEventListener('keydown', function(e){
            if (e.key === 'Escape') close(null);
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); submit(); }
        });
    });
}
function cccConfirm(title, msg, danger) {
    return new Promise(function(resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'ccc-modal-overlay';
        overlay.innerHTML = '<div class="ccc-modal-box" style="max-width:380px">'
            + '<div class="ccc-modal-header"><span>' + (danger ? '<i class="fas fa-exclamation-triangle" style="color:#ef4444;margin-right:0.5rem"></i>' : '') + title + '</span><button class="ccc-modal-x" id="cccm-x">&times;</button></div>'
            + (msg ? '<div class="ccc-modal-body"><p class="ccc-modal-confirm-msg">' + msg + '</p></div>' : '')
            + '<div class="ccc-modal-footer">'
            + '<button class="ccc-modal-btn cancel" id="cccm-cancel">Annulla</button>'
            + '<button class="ccc-modal-btn confirm' + (danger?' danger':'') + '" id="cccm-ok">' + (danger?'Elimina':'Conferma') + '</button>'
            + '</div></div>';
        document.body.appendChild(overlay);
        requestAnimationFrame(function(){ overlay.classList.add('open'); });
        function close(val) {
            overlay.classList.remove('open');
            setTimeout(function(){ overlay.remove(); }, 250);
            resolve(val);
        }
        overlay.querySelector('#cccm-ok').addEventListener('click', function(){ close(true); });
        overlay.querySelector('#cccm-cancel').addEventListener('click', function(){ close(false); });
        overlay.querySelector('#cccm-x').addEventListener('click', function(){ close(false); });
        overlay.addEventListener('click', function(e){ if(e.target===overlay) close(false); });
        overlay.addEventListener('keydown', function(e){ if(e.key==='Escape') close(false); });
    });
}

// ─── CCCSystem ────────────────────────────────────────────────────────────────
class CCCSystem {
    constructor() {
        this.container = document.getElementById('tab-ccc');
        this.editionId = null;
        this.groupId    = null;
        this.subTab     = 'fasi';
        this._init();
    }
    _init() { if (this.container) this.container.innerHTML = this._skeleton(); }
    _skeleton() { return '<div class="ccc-admin"><div id="ccc-breadcrumb" class="ccc-breadcrumb"></div><div id="ccc-view"></div></div>'; }
    _view() { return document.getElementById('ccc-view'); }
    _breadcrumb() { return document.getElementById('ccc-breadcrumb'); }
    escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    async load() { await this._showEditions(); }

    _setBreadcrumb(items) {
        var bc = this._breadcrumb(); if (!bc) return;
        bc.innerHTML = items.map(function(item) {
            if (item.action) return '<span onclick="' + item.action + '">' + item.label + '</span>';
            return '<span style="color:rgba(255,255,255,0.5);cursor:default">' + item.label + '</span>';
        }).join('<span class="sep"> / </span>');
    }

    async _showEditions() {
        this.editionId = null; this.groupId = null;
        this._setBreadcrumb([{ label: 'CCC' }]);
        var v = this._view();
        v.innerHTML = '<div style="color:rgba(255,255,255,0.4);padding:1rem;">Caricamento...</div>';
        try {
            var [edRes, settRes] = await Promise.all([
                fetch(API_BASE + '/api/ccc/editions', { credentials:'include' }),
                fetch(API_BASE + '/api/ccc/settings', { credentials:'include' })
            ]);
            var editions = await edRes.json();
            var settings = await settRes.json();
            var h = '<div class="section-box" style="margin-bottom:1.5rem;">';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">';
            h += '<h2><i class="fas fa-trophy" style="color:var(--ccc-gold)"></i> Clarvs Champions Cup</h2>';
            h += '<button class="run-btn" onclick="window.cccSystem._createEdition()"><i class="fas fa-plus"></i> Nuova Edizione</button></div>';
            h += '<div style="display:flex;gap:0.7rem;align-items:center;">';
            h += '<input type="text" class="search-input" id="ccc-stream-input" value="' + this.escHtml(settings.stream_url||'') + '" placeholder="URL stream torneo (Twitch/YouTube)" style="flex:1">';
            h += '<button class="run-btn accent" onclick="window.cccSystem._saveSettings()"><i class="fas fa-save"></i> Salva</button></div>';
            h += '</div>';
            h += '<div class="ccc-edition-list" id="ccc-edition-list">';
            if (!editions || editions.length === 0) {
                h += '<p style="color:rgba(255,255,255,0.35);text-align:center;padding:3rem 2rem;"><i class="fas fa-trophy" style="font-size:2rem;display:block;margin-bottom:1rem;opacity:0.2"></i>Nessuna edizione. Creane una!</p>';
            } else {
                editions.forEach(function(ed) {
                    var badges = '';
                    if (ed.is_active) badges += '<span class="ccc-badge active">Attiva</span>';
                    else badges += '<span class="ccc-badge inactive">Inattiva</span>';
                    if (ed.is_completed) badges += '<span class="ccc-badge completed">Completata</span>';
                    h += '<div class="ccc-edition-row" onclick="window.cccSystem._openEdition(' + ed.id + ')">';
                    h += '<div style="display:flex;align-items:center;gap:0.7rem;"><i class="fas fa-trophy" style="color:var(--ccc-gold);opacity:0.7"></i><span class="ed-name">' + this.escHtml(ed.name) + '</span></div>';
                    h += '<div class="ed-badges">' + badges + '<i class="fas fa-chevron-right" style="color:rgba(255,255,255,0.2);margin-left:0.5rem;font-size:0.8rem"></i></div>';
                    h += '</div>';
                }, this);
            }
            h += '</div>';
            v.innerHTML = h;
        } catch(e) { v.innerHTML = '<p style="color:#ef4444;padding:1rem">Errore caricamento edizioni.</p>'; }
    }

    async _saveSettings() {
        var url = document.getElementById('ccc-stream-input')?.value || '';
        try {
            await fetch(API_BASE + '/api/ccc/settings', { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ stream_url: url }) });
            showToast('Stream URL salvato', 'success');
        } catch(e) { showToast('Errore salvataggio', 'error'); }
    }

    async _createEdition() {
        var data = await cccModal('<i class="fas fa-trophy"></i> Nuova Edizione', [
            { id:'name', label:'Nome edizione', type:'text', placeholder:'es. CCC #1', required:true },
            { id:'description', label:'Descrizione / regolamento (opzionale)', type:'textarea', placeholder:'Descrizione del torneo...' }
        ], { confirmText:'Crea Edizione' });
        if (!data || !data.name.trim()) return;
        try {
            var res = await fetch(API_BASE + '/api/ccc/editions', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ name:data.name, description:data.description }) });
            if (res.ok) { showToast('Edizione creata!', 'success'); await this._showEditions(); }
            else { var d = await res.json(); showToast(d.error || 'Errore', 'error'); }
        } catch(e) { showToast('Errore creazione', 'error'); }
    }

    async _openEdition(id) {
        this.editionId = id;
        var res = await fetch(API_BASE + '/api/ccc/editions', { credentials:'include' });
        var editions = await res.json();
        this.currentEdition = editions.find(function(e){ return e.id === id; });
        this._setBreadcrumb([
            { label:'CCC', action:'window.cccSystem._showEditions()' },
            { label:this.escHtml(this.currentEdition?.name||'Edizione') }
        ]);
        await this._renderEditionView();
    }

    async _renderEditionView() {
        var v = this._view(); var ed = this.currentEdition;
        var h = '<div class="section-box" style="margin-bottom:1.2rem;">';
        h += '<div style="display:flex;gap:0.7rem;align-items:center;flex-wrap:wrap;">';
        h += '<div style="display:flex;align-items:center;gap:0.65rem;margin-bottom:0.2rem;"><span style="font-family:Rajdhani,sans-serif;font-size:1.3rem;font-weight:800;letter-spacing:0.04em;">' + this.escHtml(ed.name) + '</span>' + (ed.is_active ? '<span style="font-size:0.68rem;font-weight:700;padding:0.15rem 0.6rem;border-radius:999px;border:1px solid #10b981;color:#10b981;"><i class="fas fa-circle" style="font-size:0.38rem;margin-right:0.3rem;vertical-align:middle"></i>Attiva</span>' : ed.is_completed ? '<span style="font-size:0.68rem;font-weight:700;padding:0.15rem 0.6rem;border-radius:999px;border:1px solid #f59e0b;color:#f59e0b;">Completata</span>' : '') + '</div>';
        h += '<button class="run-btn" style="font-size:0.78rem;padding:0.3rem 0.8rem;" onclick="window.cccSystem._editEditionInfo()"><i class="fas fa-edit"></i> Modifica</button>';
        h += '<button class="run-btn ' + (ed.is_active?'accent':'') + '" style="font-size:0.78rem;padding:0.3rem 0.8rem;" onclick="window.cccSystem._toggleActive()"><i class="fas fa-power-off"></i> ' + (ed.is_active?'Disattiva':'Attiva') + '</button>';
        if (!ed.is_completed) h += '<button class="run-btn" style="font-size:0.78rem;padding:0.3rem 0.8rem;background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.35);color:var(--ccc-gold)" onclick="window.cccSystem._completeEdition()"><i class="fas fa-flag-checkered"></i> Completa</button>';
        h += '</div></div>';
        h += '<div class="ccc-subtabs">';
        var tabs = [['fasi','<i class="fas fa-layer-group"></i> Fasi'],['players','<i class="fas fa-users"></i> Player'],['punteggio','<i class="fas fa-star"></i> Punteggio']];
        var self = this;
        tabs.forEach(function(t) {
            h += '<button class="ccc-subtab ' + (self.subTab===t[0]?'active':'') + '" data-tab="' + t[0] + '" onclick="window.cccSystem._switchSubTab(\'' + t[0] + '\')">' + t[1] + '</button>';
        });
        h += '</div><div id="ccc-subcontent"></div>';
        v.innerHTML = h;
        await this._renderSubTab();
    }

    _switchSubTab(tab) {
        this.subTab = tab;
        document.querySelectorAll('.ccc-subtab').forEach(function(b){ b.classList.toggle('active', b.dataset.tab === tab); });
        this._renderSubTab();
    }

    async _renderSubTab() {
        var el = document.getElementById('ccc-subcontent'); if (!el) return;
        el.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:1rem;">Caricamento...</div>';
        if (this.subTab === 'fasi') await this._renderFasi(el);
        else if (this.subTab === 'players') await this._renderPlayers(el);
        else if (this.subTab === 'punteggio') await this._renderPunteggio(el);
    }

    async _renderFasi(el) {
        var res = await fetch(API_BASE + '/api/ccc/editions/' + this.editionId + '/phases', { credentials:'include' });
        var phases = await res.json();
        var h = '<div style="display:flex;gap:0.7rem;margin-bottom:1rem;">';
        h += '<button class="run-btn" onclick="window.cccSystem._addPhase()"><i class="fas fa-plus"></i> Aggiungi Fase</button></div>';
        if (!phases || phases.length === 0) {
            h += '<div class="ccc-empty-state"><i class="fas fa-layer-group"></i><p>Nessuna fase. Aggiungine una!</p></div>';
            el.innerHTML = h; return;
        }
        phases.sort(function(a,b){ return (b.is_active?1:0)-(a.is_active?1:0); });
        phases.forEach(function(phase) {
            var label = phase.type==='girone' ? 'Gironi' : phase.type==='semifinale' ? 'Semifinali' : 'Finale';
            h += '<div class="ccc-phase-admin' + (phase.is_active ? ' active' : '') + '">';
            h += '<div class="ccc-phase-admin-header">';
            h += '<h4><i class="fas ' + (phase.type==='girone'?'fa-users':phase.type==='semifinale'?'fa-medal':'fa-trophy') + '" style="margin-right:0.4rem;opacity:0.7"></i>' + label + ' <span style="font-weight:400;opacity:0.5;font-size:0.85rem">(Fase ' + phase.phase_order + ')</span></h4>';
            h += phase.is_active
                ? '<span class="ccc-phase-badge active"><i class="fas fa-circle" style="font-size:0.4rem;margin-right:0.3rem;vertical-align:middle"></i>ATTIVA</span>'
                : '<span class="ccc-phase-badge inactive">Conclusa</span>';
            h += '</div>';
            if (phase.start_datetime || phase.prizepool || phase.top_n) {
                h += '<div class="ccc-phase-meta">';
                if (phase.start_datetime) h += '<span><i class="fas fa-clock"></i> ' + new Date(phase.start_datetime).toLocaleString('it-IT') + '</span>';
                if (phase.prizepool) h += '<span><i class="fas fa-coins"></i> ' + this.escHtml(phase.prizepool) + '</span>';
                if (phase.top_n) h += '<span><i class="fas fa-arrow-up"></i> Top ' + phase.top_n + ' qualificati</span>';
                h += '</div>';
            }
                        h += '<div class="ccc-admin-groups-grid">';
            if(!(phase.groups&&phase.groups.length)){
                h += '<span style="color:rgba(255,255,255,0.28);font-size:0.82rem;font-style:italic;">Nessun gruppo</span>';
            } else {
                (phase.groups||[]).forEach(function(g){
                    h += '<div class="ccc-admin-group-card">';
                    h += '<button class="ccc-admin-group-enter" onclick="window.cccSystem._openGroup('+g.id+')" title="Apri girone '+g.group_number+'"><i class="fas fa-users" style="color:var(--glow-blue);opacity:0.75;font-size:0.78rem"></i><span>Girone '+g.group_number+'</span><i class="fas fa-chevron-right" style="margin-left:auto;opacity:0.3;font-size:0.65rem"></i></button>';
                    h += '<button class="ccc-admin-group-del" onclick="window.cccSystem._deleteGroup('+g.id+','+phase.id+')" title="Elimina girone"><i class="fas fa-trash"></i></button>';
                    h += '</div>';
                });
            }
            h += '</div>'; // close ccc-admin-groups-grid
            h += '<div class="ccc-phase-admin-footer">';
            h += '<div style="display:flex;gap:0.4rem;flex-wrap:wrap;">';
            if (phase.is_active) {
                h += '<button class="ccc-group-btn" style="color:#ef4444;border-color:rgba(239,68,68,0.3)" onclick="window.cccSystem._togglePhase('+phase.id+', false)"><i class="fas fa-power-off"></i> Disattiva</button>';
            } else {
                h += '<button class="ccc-group-btn" onclick="window.cccSystem._togglePhase('+phase.id+', true)"><i class="fas fa-power-off"></i> Attiva</button>';
            }
            if (phase.type !== 'finale') h += '<button class="ccc-group-btn accent" onclick="window.cccSystem._addGroup('+phase.id+')"><i class="fas fa-plus"></i> Aggiungi Gruppo</button>';
            if (phase.type === 'finale') h += '<button class="ccc-group-btn" style="color:#f59e0b;border-color:rgba(245,158,11,0.35)" onclick="window.cccSystem._editPrizepool('+phase.id+')"><i class="fas fa-coins"></i> Prizepool</button>';
            h += '</div><div style="display:flex;gap:0.4rem;">'; // right actions
            h += '<button class="ccc-group-btn" onclick="window.cccSystem._editPhase('+phase.id+','+phase.top_n+',\''+this.escHtml(phase.prizepool||'')+'\')"><i class="fas fa-edit"></i> Modifica</button>';
            h += '<button class="ccc-group-btn" style="color:#ef4444;border-color:rgba(239,68,68,0.3)" onclick="window.cccSystem._deletePhase('+phase.id+')"><i class="fas fa-trash"></i> Elimina</button>';
            h += '</div></div>'; // close footer
            h += '</div>'; // close ccc-phase-admin
        }, this);
        el.innerHTML = h;
    }



    async _editPrizepool(phaseId) {
        var res = await fetch(API_BASE + '/api/ccc/phases/' + phaseId + '/prizepool', { credentials:'include' });
        var entries = await res.json();
        var defaults = entries.length > 0 ? entries : [{position:1,prize:''},{position:2,prize:''},{position:3,prize:''}];
        var existing = document.getElementById('ccc-prizepool-modal');
        if (existing) existing.remove();
        var modal = document.createElement('div');
        modal.id = 'ccc-prizepool-modal';
        modal.className = 'ccc-modal-overlay';
        function buildRows(rows) {
            return rows.map(function(r, i) {
                var medal = r.position===1 ? '<i class="fas fa-medal" style="color:#f59e0b;margin-right:0.4rem"></i>'
                    : r.position===2 ? '<i class="fas fa-medal" style="color:#94a3b8;margin-right:0.4rem"></i>'
                    : r.position===3 ? '<i class="fas fa-medal" style="color:#cd7f32;margin-right:0.4rem"></i>'
                    : '<span style="display:inline-block;width:1.4rem"></span>';
                return '<div class="ccc-pos-row" id="pprow-' + i + '">'
                    + '<span class="pos-label">' + medal + r.position + '° posto</span>'
                    + '<span style="color:#f59e0b;font-weight:700;margin-right:0.3rem">€</span><input type="text" class="search-input ccc-pp-prize" data-pos="' + r.position + '" value="' + r.prize + '" placeholder="es. 500" style="flex:1;max-width:130px">'
                    + '<button class="ccc-icon-btn danger" style="margin-left:auto" onclick="this.closest(&quot;.ccc-pos-row&quot;).remove()"><i class="fas fa-times"></i></button>'
                    + '</div>';
            }).join('');
        }
        modal.innerHTML = '<div class="ccc-modal-box" style="max-width:480px">'
            + '<div class="ccc-modal-header"><span><i class="fas fa-coins" style="color:#f59e0b;margin-right:0.5rem"></i>Prizepool Finale</span><button class="ccc-modal-x" id="cccpp-x">&times;</button></div>'
            + '<div class="ccc-modal-body">'
            + '<div style="font-size:0.8rem;color:rgba(255,255,255,0.4);margin-bottom:0.8rem;"><i class="fas fa-info-circle" style="margin-right:0.3rem"></i>Imposta il premio per ogni posizione finale. Lascia vuoto per non mostrare.</div>'
            + '<div id="ccc-pp-rows">' + buildRows(defaults) + '</div>'
            + '<div style="margin-top:0.8rem;"><button class="run-btn" style="font-size:0.82rem" id="cccpp-add"><i class="fas fa-plus"></i> Posizione</button></div>'
            + '</div>'
            + '<div class="ccc-modal-footer"><button class="ccc-modal-btn cancel" id="cccpp-cancel">Annulla</button><button class="ccc-modal-btn confirm" id="cccpp-ok"><i class="fas fa-save" style="margin-right:0.4rem"></i>Salva</button></div>'
            + '</div>';
        document.body.appendChild(modal);
        requestAnimationFrame(function(){ modal.classList.add('open'); });
        var self = this;
        function closeModal(save) {
            modal.classList.remove('open');
            setTimeout(function(){ modal.remove(); }, 250);
            if (!save) return;
            var ent = [];
            modal.querySelectorAll('.ccc-pp-prize').forEach(function(inp) {
                var pos = parseInt(inp.dataset.pos);
                if (pos > 0) ent.push({ position: pos, prize: inp.value.trim() });
            });
            fetch(API_BASE + '/api/ccc/phases/' + phaseId + '/prizepool', { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ entries: ent }) })
                .then(function(r){ if(!r.ok) throw new Error(); showToast('Prizepool salvato!', 'success'); self._renderSubTab(); })
                .catch(function(){ showToast('Errore salvataggio','error'); });
        }
        modal.querySelector('#cccpp-add').addEventListener('click', function() {
            var container = modal.querySelector('#ccc-pp-rows');
            var maxPos = 0;
            container.querySelectorAll('[data-pos]').forEach(function(inp){ var v=parseInt(inp.dataset.pos)||0; if(v>maxPos) maxPos=v; });
            var np = maxPos + 1;
            var div = document.createElement('div'); div.className = 'ccc-pos-row';
            div.innerHTML = '<span class="pos-label"><span style="display:inline-block;width:1.4rem"></span>' + np + '° posto</span><span style="color:#f59e0b;font-weight:700;margin-right:0.3rem">€</span>'
                + '<input type="text" class="search-input ccc-pp-prize" data-pos="' + np + '" value="" placeholder="es. 100" style="flex:1;max-width:130px">'
                + '<button class="ccc-icon-btn danger" style="margin-left:auto" onclick="this.closest(&quot;.ccc-pos-row&quot;).remove()"><i class="fas fa-times"></i></button>';
            container.appendChild(div);
        });
        modal.querySelector('#cccpp-ok').addEventListener('click', function(){ closeModal(true); });
        modal.querySelector('#cccpp-cancel').addEventListener('click', function(){ closeModal(false); });
        modal.querySelector('#cccpp-x').addEventListener('click', function(){ closeModal(false); });
        modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(false); });
        modal.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(false); });
    }

    async _deletePhase(id) {
        var ok = await cccConfirm('Elimina Fase', 'Eliminando la fase verranno rimossi anche tutti i gruppi, match e risultati associati. Continuare?', true);
        if (!ok) return;
        try {
            var res = await fetch(API_BASE + '/api/ccc/phases/' + id, { method:'DELETE', credentials:'include' });
            if (res.ok) { showToast('Fase eliminata', 'success'); await this._renderSubTab(); }
            else showToast('Errore eliminazione', 'error');
        } catch(e) { showToast('Errore','error'); }
    }

    async _deleteGroup(id, phaseId) {
        var ok = await cccConfirm('Elimina Gruppo', 'Verranno eliminati anche tutti i match e risultati di questo girone. Continuare?', true);
        if (!ok) return;
        try {
            var res = await fetch(API_BASE + '/api/ccc/groups/' + id, { method:'DELETE', credentials:'include' });
            if (res.ok) { showToast('Gruppo eliminato', 'success'); await this._renderSubTab(); }
            else showToast('Errore eliminazione', 'error');
        } catch(e) { showToast('Errore','error'); }
    }

    async _deleteMatch(id, groupId) {
        var ok = await cccConfirm('Elimina Match', 'Eliminare questo match e tutti i suoi risultati?', true);
        if (!ok) return;
        try {
            var res = await fetch(API_BASE + '/api/ccc/matches/' + id, { method:'DELETE', credentials:'include' });
            if (res.ok) { showToast('Match eliminato', 'success'); await this._openGroup(groupId); }
            else showToast('Errore eliminazione', 'error');
        } catch(e) { showToast('Errore','error'); }
    }

    async _addPhase() {
        var data = await cccModal("<i class=\"fas fa-layer-group\"></i> Aggiungi Fase", [
            { id:"type", label:"Tipo fase", type:"select", options:[{v:"girone",l:"Gironi"},{v:"semifinale",l:"Semifinali"},{v:"finale",l:"Finale"}] },
            { id:"groups_count", label:"Numero di gruppi", type:"number", value:2, min:1 },
            { id:"top_n", label:"Top N qualificati per gruppo", type:"number", value:2, min:1 },
            { id:"prizepool", label:"Prizepool (opzionale)", type:"text", placeholder:"es. 50" }
        ], { confirmText:"Aggiungi" });
        if (!data) return;
        var gc = data.type === "finale" ? 1 : (parseInt(data.groups_count)||1);
        var body = { type:data.type, groups_count:gc, top_n:parseInt(data.top_n)||1, prizepool:data.prizepool };
        try {
            var res = await fetch(API_BASE + "/api/ccc/editions/" + this.editionId + "/phases", { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify(body) });
            if (res.ok) { showToast("Fase aggiunta!", "success"); this.subTab="fasi"; await this._renderSubTab(); }
            else { var d = await res.json(); showToast(d.error||"Errore","error"); }
        } catch(e) { showToast("Errore","error"); }
    }
    async _editPhase(id, currentTop, currentPrize) {
        var data = await cccModal("<i class=\"fas fa-edit\"></i> Modifica Fase", [
            { id:"top_n", label:"Top N qualificati per gruppo", type:"number", value:currentTop||1, min:1 },
            { id:"prizepool", label:"Prizepool", type:"text", value:currentPrize||"", placeholder:"es. 50" }
        ], { confirmText:"Salva" });
        if (!data) return;
        try {
            await fetch(API_BASE + "/api/ccc/phases/" + id, { method:"PUT", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({ top_n:parseInt(data.top_n)||1, prizepool:data.prizepool }) });
            showToast("Fase aggiornata", "success"); await this._renderSubTab();
        } catch(e) { showToast("Errore","error"); }
    }
    async _togglePhase(id, active) {
        try {
            await fetch(API_BASE + "/api/ccc/phases/" + id, { method:"PUT", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({ is_active: active }) });
            showToast(active ? "Fase attivata" : "Fase disattivata", "success"); await this._renderSubTab();
        } catch(e) { showToast("Errore","error"); }
    }
    async _addGroup(phaseId) {
        try {
            await fetch(API_BASE + "/api/ccc/phases/" + phaseId + "/groups", { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:"{}" });
            showToast("Gruppo aggiunto!", "success"); await this._renderSubTab();
        } catch(e) { showToast("Errore","error"); }
    }
    async _renderPlayers(el) {
        var [pRes, phRes] = await Promise.all([
            fetch(API_BASE + "/api/ccc/editions/" + this.editionId + "/players", { credentials:"include" }),
            fetch(API_BASE + "/api/ccc/editions/" + this.editionId + "/phases", { credentials:"include" })
        ]);
        var players = await pRes.json();
        var phases = await phRes.json();
        var phaseGroups = [];
        (phases||[]).forEach(function(ph) {
            var phLabel = ph.type==='girone' ? 'Gironi' : ph.type==='semifinale' ? 'Semifinali' : 'Finale';
            phLabel += ' (F.' + ph.phase_order + ')';
            var gs = (ph.groups||[]).map(function(g){ return { id:g.id, label:'Girone ' + g.group_number }; });
            phaseGroups.push({ phaseId: ph.id, label: phLabel, groups: gs });
        });
        var h = "<div style=\"display:flex;gap:0.7rem;margin-bottom:1.2rem;flex-wrap:wrap;align-items:center;\">";
        h += "<button class=\"run-btn\" onclick=\"window.cccSystem._importPlayers()\"><i class=\"fas fa-file-import\"></i> Importa Player</button>"+(players&&players.length?"<span style=\"font-size:0.8rem;color:rgba(255,255,255,0.38);padding:0 0.3rem;\">"+(players.length)+" player</span>":"")+"<input type=\"text\" class=\"search-input\" id=\"ccc-player-search\" placeholder=\"Cerca player...\" oninput=\"window.cccSystem._filterPlayers(this.value)\" style=\"max-width:220px;margin-left:auto\"></div>";
        if (!players || players.length === 0) {
            h += "<div class=\"ccc-empty-state\"><i class=\"fas fa-users\"></i><p>Nessun player. Importali!</p></div>"; el.innerHTML = h; return;
        }
        h += "<div class=\"section-box\" style=\"padding:0;overflow:hidden;overflow-x:auto;\"><table class=\"ccc-player-table\">";
        h += "<thead><tr><th>Nickname</th>";
        phaseGroups.forEach(function(ph){ h += "<th>" + ph.label + "</th>"; });
        h += "<th>Twitch</th><th>YouTube</th><th>Stato</th><th></th></tr></thead><tbody id=\"ccc-players-tbody\">";
        var self = this;
        players.forEach(function(p) {
            var phaseAssignment = {};
            (p.ccc_player_group || []).forEach(function(pg) {
                if (pg.ccc_groups && pg.ccc_groups.phase_id) phaseAssignment[pg.ccc_groups.phase_id] = pg.group_id;
            });
            h += "<tr>";
            h += "<td style=\"font-weight:600;\">" + self.escHtml(p.nickname) + "</td>";
            phaseGroups.forEach(function(ph) {
                var assigned = phaseAssignment[ph.phaseId] || "";
                var optHtml = "<option value=\"\">-- Non assegnato --</option>";
                ph.groups.forEach(function(g){ optHtml += "<option value=\"" + g.id + "\" " + (assigned==g.id?"selected":"") + ">" + g.label + "</option>"; });
                h += "<td><select class=\"ccc-assign-select\" onchange=\"window.cccSystem._assignGroup(event," + p.id + "," + ph.phaseId + ")\">" + optHtml + "</select></td>";
            });
            h += "<td><input type=\"text\" class=\"search-input\" style=\"width:130px;padding:0.25rem 0.5rem;font-size:0.78rem\" value=\"" + self.escHtml(p.twitch_url||"") + "\" placeholder=\"Twitch URL\" onblur=\"window.cccSystem._updatePlayerField(event," + p.id + ",'twitch_url')\"></td>";
            h += "<td><input type=\"text\" class=\"search-input\" style=\"width:130px;padding:0.25rem 0.5rem;font-size:0.78rem\" value=\"" + self.escHtml(p.youtube_url||"") + "\" placeholder=\"YouTube URL\" onblur=\"window.cccSystem._updatePlayerField(event," + p.id + ",'youtube_url')\"></td>";
            h += "<td>" + (p.is_disqualified ? "<span class=\"ccc-badge\" style=\"background:rgba(239,68,68,0.12);color:#ef4444;border-color:rgba(239,68,68,0.3)\"><i class=\"fas fa-ban\" style=\"margin-right:0.3rem\"></i>DQ</span>" : "") + "</td>";
            h += "<td style=\"white-space:nowrap\">";
            h += "<button class=\"ccc-icon-btn\" title=\"" + (p.is_disqualified?"Riabilita":"Squalifica") + "\" onclick=\"window.cccSystem._toggleDQ(" + p.id + "," + p.is_disqualified + ")\" style=\"" + (p.is_disqualified ? "color:var(--glow-blue)" : "color:rgba(255,255,255,0.35)") + "\"><i class=\"fas fa-ban\"></i></button>";
            h += "<button class=\"ccc-icon-btn danger\" title=\"Elimina\" onclick=\"window.cccSystem._deletePlayer(" + p.id + ")\"><i class=\"fas fa-trash\"></i></button>";
            h += "</td></tr>";
        });
        h += "</tbody></table></div>";
        el.innerHTML = h;
    }

    _filterPlayers(query) {
        var q = (query||'').toLowerCase().trim();
        document.querySelectorAll('#ccc-players-tbody tr').forEach(function(row) {
            var name = (row.querySelector('td') ? row.querySelector('td').textContent : '').toLowerCase();
            row.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    }

    async _recalculatePoints() {
        var ok = await cccConfirm('Ricalcola Punti', 'Ricalcola i punti di tutti i match esistenti con le regole punteggio attuali. Sovrascrive i punti già salvati. Continuare?', false);
        if (!ok) return;
        try {
            var res = await fetch(API_BASE + '/api/ccc/editions/' + this.editionId + '/recalculate', { method:'POST', credentials:'include' });
            var data = await res.json();
            if (res.ok) showToast('Ricalcolati ' + data.updated + ' risultati!', 'success');
            else showToast('Errore ricalcolo', 'error');
        } catch(e) { showToast('Errore','error'); }
    }

    async _importPlayers() {
        var data = await cccModal('<i class="fas fa-file-import"></i> Importa Player', [
            { id:'text', label:'Nickname (uno per riga)', type:'textarea', placeholder:'PlayerOne\nPlayerTwo\nPlayerThree...' }
        ], { confirmText:'Importa' });
        if (!data || !data.text.trim()) return;
        try {
            var res = await fetch(API_BASE + '/api/ccc/editions/' + this.editionId + '/players/import', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ text:data.text }) });
            var d = await res.json();
            if (res.ok) { showToast('Importati ' + d.length + ' player!', 'success'); await this._renderSubTab(); }
            else showToast(d.error||'Errore', 'error');
        } catch(e) { showToast('Errore importazione','error'); }
    }

    async _assignGroup(event, playerId, phaseId) {
        var groupId = parseInt(event.target.value) || null;
        if (!groupId) {
            try { await fetch(API_BASE + '/api/ccc/phases/' + phaseId + '/players/' + playerId, { method:'DELETE', credentials:'include' }); }
            catch(e) { showToast('Errore rimozione','error'); }
            return;
        }
        try {
            await fetch(API_BASE + '/api/ccc/groups/' + groupId + '/players', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ player_id: playerId }) });
            showToast('Player assegnato!', 'success');
        } catch(e) { showToast('Errore assegnazione','error'); }
    }

    async _updatePlayerField(event, playerId, field) {
        var val = event.target.value; var body = {}; body[field] = val;
        try { await fetch(API_BASE + '/api/ccc/players/' + playerId, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify(body) }); } catch(e) {}
    }

    async _toggleDQ(playerId, current) {
        try {
            await fetch(API_BASE + '/api/ccc/players/' + playerId, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ is_disqualified: !current }) });
            showToast(!current ? 'Player squalificato' : 'Player riabilitato', 'success'); await this._renderSubTab();
        } catch(e) { showToast('Errore','error'); }
    }

    async _deletePlayer(id) {
        var ok = await cccConfirm('Elimina Player', 'Sei sicuro? Questa azione e\' irreversibile.', true);
        if (!ok) return;
        try {
            await fetch(API_BASE + '/api/ccc/players/' + id, { method:'DELETE', credentials:'include' });
            showToast('Player eliminato', 'success'); await this._renderSubTab();
        } catch(e) { showToast('Errore','error'); }
    }

    async _renderPunteggio(el) {
        var res = await fetch(API_BASE + '/api/ccc/editions/' + this.editionId + '/score-rules', { credentials:'include' });
        var data = await res.json();
        var base = data.base || { points_per_kill:1, points_per_win:5 };
        var positions = data.positions || [];
        var h = '<div class="section-box">';
        h += '<h3 style="margin-bottom:1.2rem;"><i class="fas fa-star" style="color:var(--ccc-gold);margin-right:0.5rem"></i>Regole Punteggio</h3>';
        h += '<div class="ccc-form-grid cols3" style="margin-bottom:1.5rem;">';
        h += '<div class="ccc-form-group"><label>Punti per Kill</label><input type="number" class="search-input" id="ccc-pts-kill" value="' + (base.points_per_kill||1) + '" step="0.5" min="0"></div>';
        h += '<div class="ccc-form-group"><label>Punti per Vittoria</label><input type="number" class="search-input" id="ccc-pts-win" value="' + (base.points_per_win||5) + '" step="0.5" min="0"></div>';
        h += '</div>';
        h += '<h4 style="margin-bottom:0.7rem;color:rgba(255,255,255,0.7);">Tabella Posizioni</h4>';
        h += '<div style="font-size:0.78rem;color:rgba(255,255,255,0.4);margin-bottom:0.8rem;"><i class="fas fa-info-circle" style="margin-right:0.3rem"></i>Posizioni non presenti = 0 punti</div>';
        h += '<div class="ccc-pos-rules" id="ccc-pos-rules">';
        var usingDefaults = positions.length === 0;
        var rows = usingDefaults ? [{position:1,points:10},{position:2,points:7},{position:3,points:5}] : positions;
        if (usingDefaults) h += '<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:0.75rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:#f59e0b;"><i class="fas fa-exclamation-triangle" style="margin-right:0.4rem"></i>Nessuna regola salvata — valori predefiniti. Clicca <strong>Salva Regole</strong> per attivarli.</div>';
        rows.forEach(function(p, i) {
            h += '<div class="ccc-pos-row" id="posrow-' + i + '">';
            h += '<span class="pos-label">';
            if (p.position===1) h += '<i class="fas fa-medal" style="color:#f59e0b;margin-right:0.4rem"></i>';
            else if (p.position===2) h += '<i class="fas fa-medal" style="color:#94a3b8;margin-right:0.4rem"></i>';
            else if (p.position===3) h += '<i class="fas fa-medal" style="color:#cd7f32;margin-right:0.4rem"></i>';
            else h += '<span style="display:inline-block;width:1.4rem"></span>';
            h += p.position + '° posto</span>';
            h += '<input type="number" class="search-input" style="width:85px" data-pos="' + p.position + '" value="' + p.points + '" step="0.5" min="0"> <span style="font-size:0.75rem;color:rgba(255,255,255,0.3)">pts</span>';
            h += '<button class="ccc-icon-btn danger" style="margin-left:auto" onclick="this.closest(\'.ccc-pos-row\').remove()"><i class="fas fa-times"></i></button>';
            h += '</div>';
        });
        h += '</div>';
        h += '<div style="display:flex;gap:0.7rem;margin-top:1rem;">';
        h += '<button class="run-btn" style="font-size:0.82rem" onclick="window.cccSystem._addPosRow()"><i class="fas fa-plus"></i> Posizione</button>';
        h += '<button class="run-btn accent" onclick="window.cccSystem._savePunteggio()"><i class="fas fa-save"></i> Salva Regole</button>' + '<button class="run-btn" onclick="window.cccSystem._recalculatePoints()" style="background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.35);color:#f59e0b"><i class="fas fa-sync-alt"></i> Ricalcola Punti</button>';
                    h += '</div></div>';
        el.innerHTML = h;
    }

    _addPosRow() {
        var container = document.getElementById('ccc-pos-rules'); if (!container) return;
        var maxPos = 0;
        container.querySelectorAll('[data-pos]').forEach(function(inp){ var v=parseInt(inp.dataset.pos)||0; if(v>maxPos) maxPos=v; });
        var newPos = maxPos + 1;
        var div = document.createElement('div'); div.className = 'ccc-pos-row';
        div.innerHTML = '<span class="pos-label"><span style="display:inline-block;width:1.4rem"></span>' + newPos + '° posto</span><input type="number" class="search-input" style="width:85px" data-pos="' + newPos + '" value="0" step="0.5" min="0"> <span style="font-size:0.75rem;color:rgba(255,255,255,0.3)">pts</span><button class="ccc-icon-btn danger" style="margin-left:auto" onclick="this.closest(\'.ccc-pos-row\').remove()"><i class="fas fa-times"></i></button>';
        container.appendChild(div);
    }

    async _savePunteggio() {
        var kill = parseFloat(document.getElementById('ccc-pts-kill')?.value)||0;
        var win  = parseFloat(document.getElementById('ccc-pts-win')?.value)||0;
        var positions = [];
        document.querySelectorAll('#ccc-pos-rules [data-pos]').forEach(function(inp){
            positions.push({ position:parseInt(inp.dataset.pos), points:parseFloat(inp.value)||0 });
        });
        try {
            var res = await fetch(API_BASE + '/api/ccc/editions/' + this.editionId + '/score-rules', { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ points_per_kill:kill, points_per_win:win, positions }) });
            if (res.ok) showToast('Regole punteggio salvate!', 'success');
            else showToast('Errore salvataggio', 'error');
        } catch(e) { showToast('Errore','error'); }
    }

    async _openGroup(id) {
        this.groupId = id;
        var res = await fetch(API_BASE + '/api/ccc/groups/' + id, { credentials:'include' });
        var group = await res.json();
        var phLabel = group.ccc_phases ? (group.ccc_phases.type==='girone'?'Girone':group.ccc_phases.type==='semifinale'?'Semifinale':'Finale') : 'Gruppo';
        this._setBreadcrumb([
            { label:'CCC', action:'window.cccSystem._showEditions()' },
            { label:this.escHtml(this.currentEdition?.name||'Edizione'), action:'window.cccSystem._openEdition('+this.editionId+')' },
            { label:phLabel + ' ' + group.group_number }
        ]);
        this._lastGroup = group;
        this._renderGroupView(group);
    }

    _renderGroupView(group) {
        var v = this._view();
        var standings = group.standings || [];
        var matches = group.matches || [];
        var topN = group.ccc_phases ? (group.ccc_phases.top_n || 0) : 0;
        var h = '';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">';
        // Classifica
        h += '<div class="section-box"><h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:0.6rem;"><span><i class="fas fa-list-ol" style="margin-right:0.5rem;opacity:0.7"></i>Classifica</span>' + (topN ? '<span style="font-size:0.72rem;font-weight:500;color:#10b981;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:6px;padding:0.1rem 0.5rem;">Top ' + topN + ' passano</span>' : '') + '</h3>';
        if (standings.length === 0) {
            h += '<div class="ccc-empty-state" style="padding:2rem;"><i class="fas fa-list-ol"></i><p>Nessun risultato ancora.</p></div>';
        } else {
            h += '<table class="ccc-player-table"><thead><tr><th>#</th><th>Player</th><th>Pts</th><th>Kill</th><th>Win</th><th>M</th>' + (Object.keys(group.prizepool_map||{}).length ? '<th style="color:#f59e0b;font-weight:700">€</th>' : '') + '</tr></thead><tbody id="ccc-players-tbody">';
            standings.forEach(function(p, i) {
                var rank = i+1;
                var medal = rank===1 ? '<i class="fas fa-medal" style="color:#f59e0b"></i>' : rank===2 ? '<i class="fas fa-medal" style="color:#94a3b8"></i>' : rank===3 ? '<i class="fas fa-medal" style="color:#cd7f32"></i>' : rank;
                var qualify = topN && rank <= topN && !p.isDisqualified;
                h += '<tr' + (qualify ? ' style="border-bottom:2px solid rgba(16,185,129,0.55);background:rgba(16,185,129,0.04);"' : '') + '><td style="text-align:center;' + (qualify ? 'border-left:3px solid #10b981;' : '') + '">' + medal + '</td>';
                h += '<td><button class="ccc-nick-btn" onclick="window.cccSystem._showPlayerStats(' + p.playerId + ')" style="background:none;border:none;color:inherit;cursor:pointer;padding:0;font:inherit;text-decoration:none;">' + this.escHtml(p.nickname) + (p.isDisqualified?' <span class="ccc-badge" style="font-size:0.6rem;background:rgba(239,68,68,0.12);color:#ef4444;border-color:rgba(239,68,68,0.3)">DQ</span>':'') + '</button></td>';
                h += '<td style="font-weight:700;color:var(--glow-blue)">' + (p.totalPoints||0) + '</td>';
                h += '<td style="color:rgba(255,255,255,0.5)">' + (p.totalKills||0) + '</td>';
                h += '<td style="color:rgba(255,255,255,0.5)">' + (p.wins||0) + '</td>';
                h += '<td style="color:rgba(255,255,255,0.3)">' + (p.matches||0) + '</td>';
                if (Object.keys(group.prizepool_map||{}).length) h += '<td style="color:#f59e0b;font-weight:600;font-size:0.85rem">' + (group.prizepool_map[rank] ? ("€" + group.prizepool_map[rank]) : '') + '</td>';
                h += '</tr>';
            }, this);
            h += '</tbody></table>';
        }
        h += '</div>';
        // Partite
        h += '<div class="section-box"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;"><h3 style="margin:0;"><i class="fas fa-gamepad" style="margin-right:0.5rem;opacity:0.65"></i>Partite' + (matches.length ? ' <span style="font-size:0.72rem;font-weight:400;color:rgba(255,255,255,0.3);">('+matches.length+')</span>' : '') + '</h3><button class="run-btn" style="font-size:0.78rem;padding:0.3rem 0.85rem;" onclick="window.cccSystem._addMatch('+group.id+')"><i class="fas fa-plus"></i> Aggiungi</button></div>';
        if (matches.length === 0) {
            h += '<div class="ccc-empty-state" style="padding:2rem;"><i class="fas fa-gamepad"></i><p>Nessuna partita ancora.</p></div>';
        } else {
            matches.forEach(function(m) {
                h += '<div class="ccc-match-card">';
                h += '<div class="ccc-match-card-header"><strong>' + this.escHtml(m.name) + '</strong><span style="font-size:0.7rem;color:rgba(255,255,255,0.3);margin-right:auto;margin-left:0.5rem;">' + (m.played_at ? new Date(m.played_at).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '') + '</span>';
                h += '<button class="ccc-icon-btn" title="Modifica" onclick="window.cccSystem._editMatch(' + m.id + ')"><i class="fas fa-edit"></i></button>';
                h += '<button class="ccc-icon-btn danger" title="Elimina match" onclick="window.cccSystem._deleteMatch(' + m.id + ', ' + group.id + ')"><i class="fas fa-trash"></i></button></div>';
                if (m.notes) h += '<div style="font-size:0.75rem;color:rgba(255,255,255,0.35);margin-bottom:0.5rem;padding:0 0.2rem;">' + this.escHtml(m.notes) + '</div>';
                h += '<div class="ccc-match-results-mini">';
                (m.ccc_match_results||[]).sort(function(a,b){return a.position-b.position;}).forEach(function(r) {
                    h += '<span class="ccc-result-chip ' + (r.is_winner?'winner':'') + '">' + r.position + '. ' + this.escHtml(r.ccc_players?.nickname||'?') + ' <span style="opacity:0.6">+' + (r.points_earned||0) + '</span></span>';
                }, this);
                h += '</div></div>';
            }, this);
        }
        h += '</div></div>';
        v.innerHTML = h;
    }

    async _addMatch(groupId) {
        var res = await fetch(API_BASE + "/api/ccc/groups/" + groupId, { credentials:"include" });
        var group = await res.json();
        var players = group.standings || [];
        if (players.length === 0) return showToast("Nessun player in questo gruppo","error");
        var overlay = document.createElement("div");
        overlay.className = "ccc-modal-overlay";
        var playerRows = players.map(function(p, i) {
            return "<div class=\"ccc-match-player-row\"><span class=\"ccc-match-player-name\">" + p.nickname + "</span><div class=\"ccc-match-player-inputs\"><label>Pos</label><input type=\"number\" class=\"ccc-modal-input ccc-mi-pos\" data-idx=\"" + i + "\" min=\"1\" placeholder=\"1\" style=\"width:65px\"><label>Kill</label><input type=\"number\" class=\"ccc-modal-input ccc-mi-kill\" data-idx=\"" + i + "\" min=\"0\" value=\"0\" style=\"width:65px\"></div></div>";
        }).join("");
        overlay.innerHTML = "<div class=\"ccc-modal-box\" style=\"max-width:520px\"><div class=\"ccc-modal-header\"><span><i class=\"fas fa-plus\" style=\"margin-right:0.5rem\"></i>Aggiungi Match</span><button class=\"ccc-modal-x\" id=\"cccm-x\">&times;</button></div><div class=\"ccc-modal-body\"><div class=\"ccc-modal-field\"><label class=\"ccc-modal-label\">Nome match</label><input id=\"cccm-matchname\" class=\"ccc-modal-input\" type=\"text\" placeholder=\"es. Match 1\"></div><div class=\"ccc-modal-field\"><label class=\"ccc-modal-label\">Note (opzionale)</label><input id=\"cccm-notes\" class=\"ccc-modal-input\" type=\"text\" placeholder=\"Note partita...\"></div><div class=\"ccc-modal-field\"><label class=\"ccc-modal-label\">Data e ora</label><input id=\"cccm-playedat\" class=\"ccc-modal-input\" type=\"datetime-local\" value=\"\" style=\"max-width:220px\"></div><div class=\"ccc-match-players-header\"><span>Player</span><span>Posizione &amp; Kill</span></div><div class=\"ccc-match-players-list\">" + playerRows + "</div></div><div class=\"ccc-modal-footer\"><button class=\"ccc-modal-btn cancel\" id=\"cccm-cancel\">Annulla</button><button class=\"ccc-modal-btn confirm\" id=\"cccm-ok\"><i class=\"fas fa-save\" style=\"margin-right:0.4rem\"></i>Salva Match</button></div></div>";
        document.body.appendChild(overlay);
        requestAnimationFrame(function(){ overlay.classList.add("open"); });
        overlay.querySelector("#cccm-matchname").focus();
        var self = this;
        function closeModal(val) { overlay.classList.remove("open"); setTimeout(function(){ overlay.remove(); }, 250); if (val) self._submitMatch(groupId, val, players); }
        overlay.querySelector("#cccm-ok").addEventListener("click", function() {
            var matchName = overlay.querySelector("#cccm-matchname").value.trim();
            if (!matchName) { overlay.querySelector("#cccm-matchname").focus(); return; }
            var notes = overlay.querySelector("#cccm-notes").value;
            var results = []; var valid = true;
            players.forEach(function(p, i) {
                var pos = parseInt(overlay.querySelector(".ccc-mi-pos[data-idx=\""+i+"\"]").value);
                var kills = parseInt(overlay.querySelector(".ccc-mi-kill[data-idx=\""+i+"\"]").value)||0;
                if (isNaN(pos) || pos < 1) { valid = false; return; }
                results.push({ player_id: p.playerId, position: pos, kills: kills });
            });
            if (!valid) { showToast("Inserisci la posizione per tutti i player", "error"); return; }
            closeModal({ matchName: matchName, notes: notes, results: results });
        });
        overlay.querySelector("#cccm-cancel").addEventListener("click", function(){ closeModal(null); });
        overlay.querySelector("#cccm-x").addEventListener("click", function(){ closeModal(null); });
        overlay.addEventListener("click", function(e){ if(e.target===overlay) closeModal(null); });
        overlay.addEventListener("keydown", function(e){ if(e.key==="Escape") closeModal(null); });
    }
    async _submitMatch(groupId, data, players) {
        try {
            var postRes = await fetch(API_BASE + "/api/ccc/groups/" + groupId + "/matches", { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({ name:data.matchName, notes:data.notes, played_at:data.playedAt||undefined, results:data.results }) });
            if (postRes.ok) { showToast("Match salvato!", "success"); await this._openGroup(groupId); }
            else { var d = await postRes.json(); showToast(d.error||"Errore","error"); }
        } catch(e) { showToast("Errore creazione match","error"); }
    }
    async _editMatch(matchId) {
        var res = await fetch(API_BASE + "/api/ccc/groups/" + this.groupId, { credentials:"include" });
        var group = await res.json();
        var match = (group.matches||[]).find(function(m){ return m.id === matchId; });
        if (!match) return;
        var existingResults = (match.ccc_match_results||[]).sort(function(a,b){ return a.position-b.position; });
        var overlay = document.createElement("div");
        overlay.className = "ccc-modal-overlay";
        var playerRows = existingResults.map(function(r, i) {
            return "<div class=\"ccc-match-player-row\">"
                + "<span class=\"ccc-match-player-name\">" + (r.ccc_players ? r.ccc_players.nickname : "?") + "</span>"
                + "<div class=\"ccc-match-player-inputs\">"
                + "<label>Pos</label><input type=\"number\" class=\"ccc-modal-input ccc-mi-pos\" data-idx=\"" + i + "\" data-pid=\"" + r.player_id + "\" min=\"1\" value=\"" + r.position + "\" style=\"width:65px\">"
                + "<label>Kill</label><input type=\"number\" class=\"ccc-modal-input ccc-mi-kill\" data-idx=\"" + i + "\" min=\"0\" value=\"" + (r.kills||0) + "\" style=\"width:65px\">"
                + "</div></div>";
        }).join("");
        overlay.innerHTML = "<div class=\"ccc-modal-box\" style=\"max-width:520px\">"
            + "<div class=\"ccc-modal-header\"><span><i class=\"fas fa-edit\" style=\"margin-right:0.5rem\"></i>Modifica Match</span><button class=\"ccc-modal-x\" id=\"cccm-x\">&times;</button></div>"
            + "<div class=\"ccc-modal-body\">"
            + "<div class=\"ccc-modal-field\"><label class=\"ccc-modal-label\">Nome match</label><input id=\"cccm-matchname\" class=\"ccc-modal-input\" type=\"text\" value=\"" + this.escHtml(match.name) + "\"></div>"
            + "<div class=\"ccc-modal-field\"><label class=\"ccc-modal-label\">Note (opzionale)</label><input id=\"cccm-notes\" class=\"ccc-modal-input\" type=\"text\" value=\"" + this.escHtml(match.notes||"") + "\"></div>"
            + "<div class=\"ccc-modal-field\"><label class=\"ccc-modal-label\">Data e ora</label><input id=\"cccm-playedat\" class=\"ccc-modal-input\" type=\"datetime-local\" value=\"" + (match.played_at ? new Date(new Date(match.played_at).getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16) : "") + "\" style=\"max-width:220px\"></div>"
            + (existingResults.length > 0 ? "<div class=\"ccc-match-players-header\"><span>Player</span><span>Posizione &amp; Kill</span></div><div class=\"ccc-match-players-list\">" + playerRows + "</div>" : "")
            + "</div>"
            + "<div class=\"ccc-modal-footer\"><button class=\"ccc-modal-btn cancel\" id=\"cccm-cancel\">Annulla</button><button class=\"ccc-modal-btn confirm\" id=\"cccm-ok\"><i class=\"fas fa-save\" style=\"margin-right:0.4rem\"></i>Salva</button></div>"
            + "</div>";
        document.body.appendChild(overlay);
        requestAnimationFrame(function(){ overlay.classList.add("open"); });
        overlay.querySelector("#cccm-matchname").focus();
        var self = this;
        function closeModal(save) {
            overlay.classList.remove("open");
            setTimeout(function(){ overlay.remove(); }, 250);
            if (!save) return;
            var name = overlay.querySelector("#cccm-matchname").value.trim() || match.name;
            var notes = overlay.querySelector("#cccm-notes").value;
            var playedAt = overlay.querySelector("#cccm-playedat") ? overlay.querySelector("#cccm-playedat").value : "";
            var results = [];
            existingResults.forEach(function(r, i) {
                var pos = parseInt(overlay.querySelector(".ccc-mi-pos[data-idx=\""+i+"\"]").value) || r.position;
                var kills = parseInt(overlay.querySelector(".ccc-mi-kill[data-idx=\""+i+"\"]").value) || 0;
                results.push({ player_id: r.player_id, position: pos, kills: kills });
            });
            fetch(API_BASE + "/api/ccc/matches/" + matchId, { method:"PUT", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({ name:name, notes:notes, played_at:playedAt, results:results.length>0?results:undefined }) })
                .then(function(r){ if(!r.ok) throw new Error(); showToast("Match aggiornato", "success"); self._openGroup(self.groupId); })
                .catch(function(){ showToast("Errore salvataggio","error"); });
        }
        overlay.querySelector("#cccm-ok").addEventListener("click", function(){ closeModal(true); });
        overlay.querySelector("#cccm-cancel").addEventListener("click", function(){ closeModal(false); });
        overlay.querySelector("#cccm-x").addEventListener("click", function(){ closeModal(false); });
        overlay.addEventListener("click", function(e){ if(e.target===overlay) closeModal(false); });
        overlay.addEventListener("keydown", function(e){ if(e.key==="Escape") closeModal(false); });
    }


    _showPlayerStats(playerId) {
        var group = this._lastGroup;
        if (!group) return;
        var player = (group.standings||[]).find(function(p){ return p.playerId === playerId; });
        if (!player) return;
        var matches = group.matches || [];
        var entries = [];
        matches.forEach(function(m) {
            var r = (m.ccc_match_results||[]).find(function(r){ return r.player_id === playerId; });
            if (r) entries.push({ matchName: m.name, position: r.position, kills: r.kills, points: r.points_earned, isWinner: r.is_winner });
        });
        var rows = entries.length === 0
            ? '<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,0.3);padding:1rem;">Nessuna partita.</td></tr>'
            : entries.map(function(e) {
                return '<tr>'
                    + '<td style="color:rgba(255,255,255,0.7);font-size:0.82rem">' + e.matchName + '</td>'
                    + '<td style="text-align:center">' + e.position + (e.isWinner ? ' <i class="fas fa-crown" style="color:#f59e0b;font-size:0.65rem"></i>' : '') + '</td>'
                    + '<td style="text-align:center;color:rgba(255,255,255,0.5)">' + e.kills + '</td>'
                    + '<td style="text-align:center;color:var(--glow-blue);font-weight:600">' + (e.points||0) + '</td>'
                    + '</tr>';
            }).join('');
        var existing = document.getElementById('ccc-admin-player-modal');
        if (existing) existing.remove();
        var modal = document.createElement('div');
        modal.id = 'ccc-admin-player-modal';
        modal.className = 'ccc-modal-overlay';
        modal.innerHTML = '<div class="ccc-modal-box" style="max-width:480px">'
            + '<div class="ccc-modal-header"><span><i class="fas fa-user" style="margin-right:0.5rem"></i>' + this.escHtml(player.nickname) + ' — Statistiche</span><button class="ccc-modal-x" id="cccm-ps-x">&times;</button></div>'
            + '<div class="ccc-modal-body" style="padding:0.5rem 0;">'
            + '<table class="ccc-player-table" style="width:100%"><thead><tr><th style="text-align:left">Match</th><th>#</th><th>K</th><th>Pts</th></tr></thead><tbody>' + rows + '</tbody></table>'
            + '<div style="display:flex;gap:1rem;padding:1rem 0 0;border-top:1px solid rgba(255,255,255,0.07);margin-top:0.75rem;font-size:0.85rem;color:rgba(255,255,255,0.5);">'
            + '<span>Tot punti: <strong style="color:var(--glow-blue)">' + (player.totalPoints||0) + '</strong></span>'
            + '<span>Kill: <strong>' + (player.totalKills||0) + '</strong></span>'
            + '<span>Vittorie: <strong>' + (player.wins||0) + '</strong></span>'
            + '<span>Match: <strong>' + (player.matches||0) + '</strong></span>'
            + '</div>'
            + '</div>'
            + '<div class="ccc-modal-footer"><button class="ccc-modal-btn cancel" id="cccm-ps-close">Chiudi</button></div>'
            + '</div>';
        document.body.appendChild(modal);
        requestAnimationFrame(function(){ modal.classList.add('open'); });
        function closeModal(){ modal.classList.remove('open'); setTimeout(function(){ modal.remove(); }, 250); }
        modal.querySelector('#cccm-ps-x').addEventListener('click', closeModal);
        modal.querySelector('#cccm-ps-close').addEventListener('click', closeModal);
        modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(); });
        modal.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });
    }

    async _toggleActive() {
        var ed = this.currentEdition; var newVal = !ed.is_active;
        try {
            await fetch(API_BASE + '/api/ccc/editions/' + this.editionId, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ is_active: newVal }) });
            showToast(newVal ? 'Edizione attivata!' : 'Edizione disattivata!', 'success');
            await this._openEdition(this.editionId);
        } catch(e) { showToast('Errore','error'); }
    }

    async _editEditionInfo() {
        var ed = this.currentEdition;
        var data = await cccModal('<i class="fas fa-edit"></i> Modifica Edizione', [
            { id:'name', label:'Nome edizione', type:'text', value:ed.name, placeholder:'es. CCC #1' },
            { id:'description', label:'Descrizione', type:'textarea', value:ed.description||'', placeholder:'Descrizione...' }
        ], { confirmText:'Salva' });
        if (!data || !data.name.trim()) return;
        try {
            await fetch(API_BASE + '/api/ccc/editions/' + this.editionId, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ name:data.name, description:data.description }) });
            showToast('Edizione aggiornata', 'success'); await this._openEdition(this.editionId);
        } catch(e) { showToast('Errore','error'); }
    }
    async _completeEdition() {
        var msg = "L\u2019edizione verra marcata come completata e disattivata. Continuare?";
        var ok = await cccConfirm("Completa Edizione", msg, false);
        if (!ok) return;
        var data = await cccModal("Vincitore Ufficiale", [
            { id:"winner", label:"Nickname del vincitore", type:"text", placeholder:"Nickname..." }
        ], { confirmText:"Conferma" });
        if (!data) return;
        var wRes = await fetch(API_BASE + "/api/ccc/editions/" + this.editionId + "/players", { credentials:"include" });
        var players = await wRes.json();
        var lw = (data.winner||"").toLowerCase();
        var wp = players.find(function(p){ return p.nickname.toLowerCase() === lw; });
        try {
            var body = { is_completed:true, is_active:false, winner_player_id: wp ? wp.id : null };
            await fetch(API_BASE + "/api/ccc/editions/" + this.editionId, { method:"PUT", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify(body) });
            showToast("Edizione completata!", "success"); await this._showEditions();
        } catch(e) { showToast("Errore","error"); }
    }
}
