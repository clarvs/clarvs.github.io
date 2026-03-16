// admin.utils.js — must be loaded FIRST before other admin scripts

// --- UTILITY FUNCTIONS -------------------------------------------------------

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function debounce(fn, delay) {
    let timer;
    return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
}

/**
 * Traps Tab/Shift+Tab focus within modalElement.
 * Returns a cleanup function that removes the keydown listener.
 */
function focusTrap(modalElement) {
    const focusableSelectors = 'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';
    function getFocusable() {
        return Array.from(modalElement.querySelectorAll(focusableSelectors)).filter(
            el => !el.disabled && el.offsetParent !== null
        );
    }
    function handler(e) {
        if (e.key !== 'Tab') return;
        const focusable = getFocusable();
        if (focusable.length === 0) { e.preventDefault(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    }
    modalElement.addEventListener('keydown', handler);
    return () => modalElement.removeEventListener('keydown', handler);
}

// Global Escape key handler — closes the topmost visible modal
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    const modalIds = [
        'add-metric-modal',
        'delete-confirm-modal',
        'player-modal',
        'tv-streamer-modal',
        'news-modal',
        'event-modal',
        'roster-modal'
    ];
    for (const id of modalIds) {
        const el = document.getElementById(id);
        if (el && el.style.display !== 'none' && el.style.display !== '') {
            if (id === 'roster-modal') { window.rosterSystem && window.rosterSystem.closeModal(); return; }
            if (id === 'tv-streamer-modal') { window.tvSystem && window.tvSystem.closeModal(); return; }
            if (id === 'player-modal') { el.style.display = 'none'; return; }
            if (id === 'delete-confirm-modal') { window.rosterSystem && window.rosterSystem._closeDeleteConfirm(false); return; }
            if (id === 'news-modal') { window.homeContentSystem && window.homeContentSystem.closeNewsModal(); return; }
            if (id === 'event-modal') { window.homeContentSystem && window.homeContentSystem.closeEventModal(); return; }
            if (id === 'add-metric-modal') { window.formulaSystem && window.formulaSystem.closeModal(); return; }
        }
    }
});
