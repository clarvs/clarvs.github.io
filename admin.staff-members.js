// Sistema autenticazione Clarvs
class AuthSystem {
    constructor() {
        // Token NON più in localStorage — gestito come httpOnly cookie dal server
        this.token = null;
        try { this.user = JSON.parse(localStorage.getItem('clarvs_user') || 'null'); }
        catch (e) { this.user = null; localStorage.removeItem('clarvs_user'); }
        // Stato ottimistico da localStorage (solo dati display, non token)
        this.isLoggedIn = !!(this.user);

        this._interceptFetch();
        this._checkSession(); // Verifica sessione reale via cookie httpOnly
        this.init();
    }
    _setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    }
    _clearSession() {
        this.token = null; this.user = null; this.isLoggedIn = false;
        localStorage.removeItem('clarvs_token'); // pulizia backward compat
        localStorage.removeItem('clarvs_user');
        this._updateUI();
    }
    async _checkSession() {
        try {
            // Il cookie httpOnly viene inviato automaticamente dal browser
            const res = await fetch(API_BASE + '/api/auth/me');
            if (res.ok) {
                const user = await res.json();
                this.user = user;
                this.isLoggedIn = true;
                localStorage.setItem('clarvs_user', JSON.stringify(user));
                this._updateUI();
            } else if (res.status === 401) {
                this._clearSession();
            }
        } catch (e) { }
    }
    _interceptFetch() {
        var self = this, orig = window.fetch.bind(window);
        window.fetch = function (url, opts) { opts = opts || {}; if (self.token && typeof url === 'string' && url.startsWith('/api/')) opts.headers = Object.assign({}, opts.headers, { 'Authorization': 'Bearer ' + self.token }); return orig(url, opts); };
    }
    init() { this._createModals(); this._createButton(); this._updateUI(); this._bindEvents(); }
    _createButton() {
        var nav = document.querySelector('.nav-links'); if (!nav) return;
        var li = document.createElement('li');
        li.innerHTML = '<button id="auth-btn" class="auth-btn"><i class="fas fa-user"></i></button>';
        nav.appendChild(li);
    }
    _createModals() {
        if (document.getElementById('login-modal')) return;
        var m = document.createElement('div'); m.id = 'login-modal'; m.className = 'auth-modal';
        m.innerHTML =
            '<div class="auth-modal-content">'
            + '<div class="auth-modal-header"><h2 id="auth-modal-title">Accesso Staff</h2><span class="auth-close">&times;</span></div>'
            + '<div class="auth-modal-body">'
            + '<div id="auth-view-login">'
            + '<form id="login-form">'
            + '<div class="auth-form-group"><label for="login-email">Email</label><input type="email" id="login-email" placeholder="Email" required autocomplete="email"></div>'
            + '<div class="auth-form-group"><label for="login-password">Password</label><input type="password" id="login-password" placeholder="Password" required autocomplete="current-password"></div>'
            + '<button type="submit" class="auth-submit-btn">Accedi</button>'
            + '<button type="button" id="forgot-pw-btn" style="background:none;border:none;color:rgba(0,188,212,0.7);font-size:0.82rem;cursor:pointer;margin-top:0.6rem;padding:0;width:100%;text-align:center;">Password dimenticata?</button>'
            + '<div id="auth-error" class="auth-error" style="display:none;"></div>'
            + '</form></div>'
            + '<div id="auth-view-forgot" style="display:none;">'
            + '<p style="color:rgba(255,255,255,0.6);font-size:0.85rem;margin-bottom:1rem;">Inserisci la tua email: riceverai un link per reimpostare la password.</p>'
            + '<div class="auth-form-group"><label for="forgot-email">Email</label><input type="email" id="forgot-email" placeholder="Email"></div>'
            + '<button id="forgot-submit-btn" class="auth-submit-btn">Invia Link Reset</button>'
            + '<button type="button" id="back-to-login-btn" style="background:none;border:none;color:rgba(0,188,212,0.7);font-size:0.82rem;cursor:pointer;margin-top:0.6rem;padding:0;width:100%;text-align:center;">Torna al login</button>'
            + '<div id="forgot-msg" style="margin-top:0.75rem;font-size:0.85rem;"></div>'
            + '</div></div></div>';
        document.body.appendChild(m);
        var lo = document.createElement('div'); lo.id = 'logout-modal'; lo.className = 'auth-modal'; lo.style.display = 'none';
        lo.innerHTML =
            '<div class="auth-modal-content" style="max-width:380px;text-align:center;">'
            + '<div style="font-size:2.5rem;margin-bottom:1rem;opacity:0.6;"><i class="fas fa-sign-out-alt"></i></div>'
            + '<h3 style="margin:0 0 0.5rem;font-size:1.1rem;">Esci dall account</h3>'
            + '<p id="logout-user-msg" style="color:rgba(255,255,255,0.45);font-size:0.9rem;margin:0 0 1.75rem;"></p>'
            + '<div style="display:flex;gap:0.75rem;">'
            + '<button id="logout-cancel-btn" style="flex:1;padding:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(255,255,255,0.7);cursor:pointer;font-size:0.9rem;">Annulla</button>'
            + '<button id="logout-confirm-btn" style="flex:1;padding:0.75rem;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);border-radius:8px;color:#ef4444;cursor:pointer;font-size:0.9rem;font-weight:600;">Esci</button>'
            + '</div></div>';
        document.body.appendChild(lo);
    }
    _bindEvents() {
        var self = this;
        document.addEventListener('click', function (e) {
            var target = e.target.id ? e.target : e.target.closest('[id]');
            var id = target ? target.id : null;

            // Pulsante utente nella nav
            if (id === 'auth-btn') {
                self.isLoggedIn ? self._showLogoutModal() : self._showLoginModal();
                return;
            }
            // Pulsante "Accedi" o pulsante staff in manutenzione
            if (id === 'login-redirect' || id === 'staff-link-btn' || id === 'maint-staff-redirect') {
                if (self.isLoggedIn) {
                    if (id === 'staff-link-btn') {
                        window.location.href = '/index.html';
                        return;
                    }
                    if (id === 'maint-staff-redirect') {
                        window.location.href = '/pages/admin.html';
                        return;
                    }
                }
                if (e.cancelable) e.preventDefault();
                self._showLoginModal();
                return;
            }

            if (e.target.classList && e.target.classList.contains('auth-modal')) self._closeAll();
            if (e.target.classList && e.target.classList.contains('auth-close')) self._closeAll();
            if (id === 'forgot-pw-btn') self._showForgot();
            if (id === 'back-to-login-btn') self._showLoginView();
            if (id === 'forgot-submit-btn') self._handleForgot();
            if (id === 'logout-cancel-btn') self._closeAll();
            if (id === 'logout-confirm-btn') self.logout();
        });

        document.addEventListener('submit', function (e) {
            if (e.target.id === 'login-form') {
                e.preventDefault();
                self._handleLogin();
            }
        });
    }
    _showLoginModal() {
        this._showLoginView();
        var err = document.getElementById('auth-error'); if (err) err.style.display = 'none';
        document.getElementById('login-modal').style.display = 'flex';
    }
    _showLogoutModal() {
        var el = document.getElementById('logout-user-msg');
        if (el) el.textContent = 'Sei loggato come ' + (this.user && this.user.nickname) + '.';
        document.getElementById('logout-modal').style.display = 'flex';
    }
    _showForgot() {
        document.getElementById('auth-view-login').style.display = 'none';
        document.getElementById('auth-view-forgot').style.display = 'block';
        document.getElementById('auth-modal-title').textContent = 'Reset Password';
    }
    _showLoginView() {
        document.getElementById('auth-view-login').style.display = 'block';
        document.getElementById('auth-view-forgot').style.display = 'none';
        document.getElementById('auth-modal-title').textContent = 'Accesso Staff';
    }
    _closeAll() {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('logout-modal').style.display = 'none';
        var form = document.getElementById('login-form'); if (form) form.reset();
        var err = document.getElementById('auth-error'); if (err) err.style.display = 'none';
        var fm = document.getElementById('forgot-msg'); if (fm) fm.innerHTML = '';
        var fsb = document.getElementById('forgot-submit-btn'); if (fsb) fsb.style.display = '';
        this._showLoginView();
    }
    async _handleLogin() {
        var email = document.getElementById('login-email').value.trim();
        var password = document.getElementById('login-password').value;
        var btn = document.querySelector('#login-form button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Accesso...'; }
        try {
            var res = await fetch(API_BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: password }) });
            var data = await res.json();
            if (!res.ok) {
                if (res.status === 401) this._clearSession();
                this._showError(data.error || 'Errore login');
                return;
            }
            this.token = data.token; this.user = data.user; this.isLoggedIn = true;
            // Token NON in localStorage — il server ha già impostato il cookie httpOnly
            localStorage.setItem('clarvs_user', JSON.stringify(data.user));
            this._closeAll();
            this._updateUI();
            this._showNotification('Benvenuto, ' + data.user.nickname + '!');
            const isMaint = window.location.pathname.includes('maintenance.html') || document.body.innerHTML.includes('Sito in Manutenzione');
            if (isMaint) {
                window.location.href = '/pages/admin.html';
            }
        } catch (e) { this._showError('Server non disponibile.'); }
        finally { if (btn) { btn.disabled = false; btn.textContent = 'Accedi'; } }
    }
    async _handleForgot() {
        var email = document.getElementById('forgot-email').value.trim();
        var msg = document.getElementById('forgot-msg');
        var btn = document.getElementById('forgot-submit-btn');
        if (!email) return;
        btn.disabled = true; btn.textContent = 'Invio...';
        try {
            var rr = await fetch(API_BASE + '/api/auth/reset-password-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email }) });
            var rd = await rr.json();
            if (!rr.ok) { msg.innerHTML = '<span style="color:#ef4444;">' + (rd.error || 'Errore') + '</span>'; return; }
            msg.innerHTML = '<span style="color:#10b981;"><i class="fas fa-check-circle"></i> Email inviata! Controlla anche la cartella spam.</span>';
            btn.style.display = 'none';
        } catch (e) { msg.innerHTML = '<span style="color:#ef4444;">Errore di connessione.</span>'; }
        finally { btn.disabled = false; btn.textContent = 'Invia Link Reset'; }
    }
    _showError(msg) { var el = document.getElementById('auth-error'); if (el) { el.textContent = msg; el.style.display = 'block'; } }
    logout() {
        this.token = null; this.user = null; this.isLoggedIn = false;
        localStorage.removeItem('clarvs_token');
        localStorage.removeItem('clarvs_user');
        // Chiama il server per cancellare il cookie httpOnly
        fetch(API_BASE + '/api/auth/logout', { method: 'POST' }).catch(() => {});
        this._closeAll(); this._updateUI(); this._showNotification('Logout eseguito');
    }
    _updateUI() {
        var li = this.isLoggedIn, btn = document.getElementById('auth-btn');
        if (btn) { btn.classList.toggle('logged-in', li); btn.innerHTML = li ? '<i class="fas fa-user-check"></i>' : '<i class="fas fa-user"></i>'; btn.title = li ? 'Staff: ' + (this.user && this.user.nickname) + ' — Click per logout' : 'Login Staff'; }
        document.querySelectorAll('.staff-only').forEach(function (el) { el.style.display = li ? 'block' : 'none'; });
        if (window.refreshCccNav) window.refreshCccNav();
        document.querySelectorAll('a[href*="admin.html"]').forEach(function (a) { var p = a.closest('li'); if (p) p.style.display = li ? 'block' : 'none'; });
        var ow = li && this.isOwner();
        document.querySelectorAll('.owner-only').forEach(function (el) { el.style.display = ow ? '' : 'none'; });
    }
    _showNotification(msg) {
        var n = document.createElement('div'); n.className = 'auth-notification success'; n.textContent = msg; document.body.appendChild(n);
        setTimeout(function () { n.classList.add('show'); }, 100);
        setTimeout(function () { n.classList.remove('show'); setTimeout(function () { n.remove(); }, 300); }, 3000);
    }
    isStaffLoggedIn() { return this.isLoggedIn; }
    getCurrentUser() { return this.user; }
    isOwner() { return this.isLoggedIn && this.user && this.user.role === 'owner'; }
}
var authSystem;
document.addEventListener('DOMContentLoaded', function () { authSystem = new AuthSystem(); window.authSystem = authSystem; });
