// Gestione Staff — visibile solo all'owner
(function () {
    'use strict';

    function fmt(iso) {
        if (!iso) return '-';
        return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    async function loadStaff() {
        var attempts = 0;
        while (!window.authSystem && attempts < 10) {
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }
        
        var tbody = document.getElementById('staff-accounts-tbody');
        var itbody = document.getElementById('staff-invites-tbody');
        if (!tbody || !itbody) return;
        
        // Se non è l'owner, non fare nulla (o mostra laccetto)
        if (window.authSystem && typeof window.authSystem.isOwner === 'function' && !window.authSystem.isOwner()) {
             tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:rgba(255,255,255,0.4);padding:3rem"><i class="fas fa-lock" style="font-size:1.5rem;display:block;margin-bottom:1rem;color:#f59e0b"></i> Accesso riservato all\'Owner.</td></tr>';
             return;
        }

        try {
            // Cookie httpOnly inviato automaticamente (same-origin)
            var res = await fetch(API_BASE + '/api/auth/staff', {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Errore ' + res.status);
            var data = await res.json();

            if (!data.accounts || !data.accounts.length) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:2rem">Nessun account staff</td></tr>';
            } else {
                tbody.innerHTML = data.accounts.map(function (a) {
                    var ow = a.role === 'owner';
                    var badge = ow ? '<span style="color:#f59e0b;font-weight:600;">owner</span>' : '<span style="color:rgba(255,255,255,0.5);">staff</span>';
                    var btn = ow ? '<span style="color:rgba(255,255,255,0.3);">—</span>'
                        : '<button class="run-btn revoke-btn" data-id="' + a.id + '" data-nick="' + a.nickname + '" style="background:rgba(239,68,68,0.15);color:#ef4444;padding:0.3rem 0.75rem;font-size:0.8rem;"><i class="fas fa-user-slash"></i> Revoca</button>';
                    return '<tr><td style="font-weight:600;">' + a.nickname + '</td><td style="color:rgba(255,255,255,0.6);">' + a.email + '</td><td>' + badge + '</td><td style="color:rgba(255,255,255,0.5);font-size:0.85rem;">' + fmt(a.created_at) + '</td><td>' + btn + '</td></tr>';
                }).join('');
            }

            if (!data.pending || !data.pending.length) {
                itbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#888;padding:2rem">Nessun invito pendente</td></tr>';
            } else {
                itbody.innerHTML = data.pending.map(function (u) {
                    return '<tr><td>' + u.email + '</td><td style="color:rgba(255,255,255,0.5);font-size:0.85rem;">' + fmt(u.created_at) + '</td><td><button class="run-btn cancel-invite-btn" data-id="' + u.id + '" data-email="' + u.email + '" style="background:rgba(239,68,68,0.1);color:#ef4444;padding:0.3rem 0.75rem;font-size:0.8rem;"><i class="fas fa-times"></i> Annulla</button></td></tr>';
                }).join('');
            }
        } catch (e) {
            console.error('[staff] load error:', e.message);
            // Silenzia l'errore 403 per non-owner, mostra messaggio nel corpo tabella
            if (e.message.indexOf('403') !== -1 || e.message.indexOf('401') !== -1) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:rgba(255,255,255,0.4);padding:3rem"><i class="fas fa-lock" style="font-size:1.5rem;display:block;margin-bottom:1rem;color:#f59e0b"></i> Accesso riservato all\'Owner.</td></tr>';
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#ef4444;padding:2rem">Errore caricamento: ' + e.message + '</td></tr>';
            }
        }
    }

    async function sendInvite() {
        var inp = document.getElementById('invite-email-input');
        var res_el = document.getElementById('invite-result');
        var email = inp && inp.value.trim();
        if (!email) return;
        
        res_el.innerHTML = '<span style="color:rgba(255,255,255,0.5);"><i class="fas fa-spinner fa-spin"></i> Invio in corso...</span>';
        try {
            var r = await fetch(API_BASE + '/api/auth/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: email })
            });
            var data = await r.json();
            if (!r.ok) {
                res_el.innerHTML = '<span style="color:#ef4444;"><i class="fas fa-times-circle"></i> ' + (data.error || 'Errore') + '</span>';
                return;
            }
            res_el.innerHTML = '<span style="color:#10b981;"><i class="fas fa-check-circle"></i> Email di invito inviata a <strong>' + email + '</strong>.</span>';
            if (inp) inp.value = '';
            setTimeout(loadStaff, 1500);
        } catch (e) {
            res_el.innerHTML = '<span style="color:#ef4444;">Errore: ' + e.message + '</span>';
        }
    }

    function initStaffSection() {
        // Mostra/nascondi tab in base al ruolo
        const isOwner = window.authSystem && typeof window.authSystem.isOwner === 'function' && window.authSystem.isOwner();
        document.querySelectorAll('.admin-tab[data-tab="staff"]').forEach(t => t.style.display = isOwner ? 'flex' : 'none');
        
        if (!isOwner) return;

        var invBtn = document.getElementById('invite-btn');
        if (invBtn) invBtn.addEventListener('click', sendInvite);

        document.addEventListener('click', function (e) {
            var rb = e.target.closest('.revoke-btn');
            if (rb) {
                var id = rb.dataset.id, nick = rb.dataset.nick;
                if (confirm('Revocare accesso a ' + nick + '?')) {
                    fetch(API_BASE + '/api/auth/staff/' + id, {
                        method: 'DELETE',
                        credentials: 'include'
                    })
                    .then(r => r.json())
                    .then(() => loadStaff())
                    .catch(e => alert('Errore: ' + e.message));
                }
            }

            var cb = e.target.closest('.cancel-invite-btn');
            if (cb) {
                var id2 = cb.dataset.id, em = cb.dataset.email;
                if (confirm('Annullare invito per ' + em + '?')) {
                    fetch(API_BASE + '/api/auth/invite/' + id2, {
                        method: 'DELETE',
                        credentials: 'include'
                    })
                    .then(() => loadStaff())
                    .catch(e => alert('Errore: ' + e.message));
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var attempts = 0;
        var interval = setInterval(function() {
            attempts++;
            if (window.authSystem) {
                clearInterval(interval);
                initStaffSection();
            } else if (attempts > 15) { // Stop trying after 15 attempts (3 seconds)
                clearInterval(interval);
                // Optionally hide the staff tab if authSystem never loads
                document.querySelectorAll('.admin-tab[data-tab="staff"]').forEach(t => t.style.display = 'none');
            }
        }, 200); // Check every 200ms
    });

    window.staffAdmin = { loadStaff: loadStaff };
})();
