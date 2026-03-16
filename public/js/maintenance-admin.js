// Maintenance mode toggle - solo owner, stato su Supabase
(function() {
    var panel   = document.getElementById('maintenance-panel');
    var btn     = document.getElementById('maint-toggle-btn');
    var saveBtn = document.getElementById('maint-save-settings-btn');
    var status  = document.getElementById('maint-status-text');
    var input   = document.getElementById('maint-end-input');
    var msgInput = document.getElementById('maint-msg-input');
    var brandingToggle = document.getElementById('maint-branding-toggle');
    var current = false;

    function formatLocalDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        
        // Formato YYYY-MM-DDTHH:mm usando l'ora locale
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function applyState(enabled, endAt, message, showBranding) {
        current = enabled;
        if (input) {
            input.value = formatLocalDate(endAt);
        }
        if (msgInput) msgInput.value = message || '';
        if (brandingToggle) brandingToggle.checked = showBranding !== false;

        if (enabled) {
            status.innerHTML = '<span style="color:#ef4444; font-weight: 700;"><i class="fas fa-circle" style="font-size:0.6rem; vertical-align:middle; margin-right:6px;"></i>Sito OFFLINE</span> — I visitatori visualizzano la pagina di manutenzione.';
            btn.innerHTML = '<i class="fas fa-play"></i> Riporta Online';
            btn.style.background = 'rgba(16,185,129,0.15)';
            btn.style.color = '#10b981';
            btn.style.border = '1px solid rgba(16,185,129,0.3)';
        } else {
            status.innerHTML = '<span style="color:#10b981; font-weight: 700;"><i class="fas fa-circle" style="font-size:0.6rem; vertical-align:middle; margin-right:6px;"></i>Sito ONLINE</span> — Il sito è accessibile a tutti.';
            btn.innerHTML = '<i class="fas fa-pause"></i> Metti in Manutenzione';
            btn.style.background = 'rgba(239,68,68,0.12)';
            btn.style.color = '#ef4444';
            btn.style.border = '1px solid rgba(239,68,68,0.25)';
        }
    }

    async function loadState() {
        try {
            var r = await fetch('/api/admin/maintenance');
            if (!r.ok) throw new Error('HTTP ' + r.status);
            var d = await r.json();
            applyState(!!d.enabled, d.end_at, d.message, d.show_branding);
        } catch(e) {
            if (status) status.textContent = 'Errore caricamento stato';
        }
    }

    async function save(nextEnabled, isSilent) {
        var endAt = input?.value || null;
        var message = msgInput?.value || null;
        var showBranding = brandingToggle ? brandingToggle.checked : true;

        if (!isSilent && nextEnabled !== current && nextEnabled) {
            const result = await Swal.fire({
                title: 'SEI SICURO?',
                html: '<span style="color: #ff9800; font-weight: bold;">Attenzione:</span> Il sito andrà offline e i visitatori vedranno solo la pagina di manutenzione.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'transparent',
                cancelButtonColor: 'transparent',
                confirmButtonText: '<i class="fas fa-power-off"></i> METTI OFFLINE',
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
        
        btn.disabled = true;
        if (saveBtn) saveBtn.disabled = true;

        try {
            var r = await fetch('/api/admin/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    enabled: nextEnabled, 
                    end_at: endAt,
                    message: message,
                    show_branding: showBranding
                })
            });
            var d = await r.json();
            if (!r.ok) { alert(d.error || 'Errore'); return; }
            applyState(d.enabled, d.end_at, d.message, d.show_branding);
            
            if (!isSilent) {
                window.uiSystem?.showToast?.(d.enabled ? 'Sito messo in manutenzione' : 'Sito rimesso online', 'success') || 
                Swal.fire({
                    title: d.enabled ? 'Offline!' : 'Online!',
                    text: d.enabled ? 'Il sito è in Modalità Manutenzione.' : 'Il sito è nuovamente accessibile a tutti.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#0f172a',
                    color: '#fff'
                });
            } else {
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Salvato!';
                setTimeout(() => { saveBtn.innerHTML = originalText; }, 2000);
            }
        } catch(e) {
            console.error(e);
            window.uiSystem?.showToast?.('Errore: ' + e.message, 'error') || alert('Errore: ' + e.message);
        } finally {
            btn.disabled = false;
            if (saveBtn) saveBtn.disabled = false;
        }
    }

    function showPanelIfOwner() {
        if (!panel) return;
        if (window.authSystem && typeof window.authSystem.isOwner === 'function' && window.authSystem.isOwner()) {
            panel.style.display = 'block';
            loadState();
        } else {
            panel.style.display = 'none';
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (btn) btn.addEventListener('click', () => save(!current, false));
        if (saveBtn) saveBtn.addEventListener('click', () => save(current, true));

        var attempts = 0;
        var interval = setInterval(function() {
            attempts++;
            if (window.authSystem) {
                clearInterval(interval);
                showPanelIfOwner();
            } else if (attempts > 15) {
                clearInterval(interval);
            }
        }, 200);
    });
})();
