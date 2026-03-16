'use strict';

/**
 * Toast notification system per l'admin panel
 * Uso: showToast('Salvato con successo', 'success')
 * Tipi: 'success' | 'error' | 'warning' | 'info'
 */

(function() {
  var container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
      document.body.appendChild(container);
    }
    return container;
  }

  var COLORS = {
    success: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', icon: '✓' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: '#ef4444', icon: '✕' },
    warning: { bg: 'rgba(234,179,8,0.15)',  border: '#eab308', icon: '⚠' },
    info:    { bg: 'rgba(37,99,235,0.15)',  border: '#2563eb', icon: 'ℹ' }
  };

  window.showToast = function(message, type, duration) {
    type = type || 'info';
    duration = duration || 3500;
    var c = COLORS[type] || COLORS.info;
    var toast = document.createElement('div');
    toast.style.cssText = 'background: ' + c.bg + '; border: 1px solid ' + c.border + '; border-radius: 8px; padding: 12px 16px; color: #e2e8f0; font-family: Outfit, sans-serif; font-size: 14px; display: flex; align-items: center; gap: 10px; backdrop-filter: blur(10px); pointer-events: all; max-width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); opacity: 0; transform: translateX(20px); transition: opacity 0.2s ease, transform 0.2s ease;';
    toast.innerHTML = '<span style="color:' + c.border + ';font-weight:bold">' + c.icon + '</span><span>' + message + '</span>';
    getContainer().appendChild(toast);

    requestAnimationFrame(function() {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(function() { toast.remove(); }, 200);
    }, duration);
  };
})();
