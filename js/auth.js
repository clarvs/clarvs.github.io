// Sistema di autenticazione per i membri staff di Clarvs
class AuthSystem {
    constructor() {
        this.isLoggedIn = localStorage.getItem('clarvs_auth') === 'true';
        this.currentUser = localStorage.getItem('clarvs_user') || null;
        this.staffMembers = ['pyre', 'anass', 'calle', 'zak', 'enxyn', 'matto', 'bamba'];
        this.staffPassword = '123'; // Password uguale per tutti i membri staff
        
        this.init();
    }
    
    init() {
        this.createLoginModal();
        this.createLoginButton();
        this.updateUI();
        this.bindEvents();
    }
    
    createLoginButton() {
        // Trova la navigazione e aggiungi il pulsante login
        const nav = document.querySelector('.nav-links');
        if (nav) {
            const loginBtn = document.createElement('li');
            loginBtn.innerHTML = `
                <button id="auth-btn" class="auth-btn">
                    <i class="fas fa-user"></i>
                </button>
            `;
            nav.appendChild(loginBtn);
        }
    }
    
    createLoginModal() {
        // Crea la modale di login
        const modal = document.createElement('div');
        modal.id = 'login-modal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2>Accesso Staff</h2>
                    <span class="auth-close">&times;</span>
                </div>
                <div class="auth-modal-body">
                    <form id="login-form">
                        <div class="auth-form-group">
                            <label for="username">Username:</label>
                            <select id="username" required>
                                <option value="">Seleziona il tuo username</option>
                                ${this.staffMembers.map(member => 
                                    `<option value="${member}">${member}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="auth-form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" placeholder="Inserisci la password" required>
                        </div>
                        <button type="submit" class="auth-submit-btn">Accedi</button>
                        <div id="auth-error" class="auth-error" style="display: none;"></div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    bindEvents() {
        // Event listener per il pulsante di login
        document.addEventListener('click', (e) => {
            if (e.target.id === 'auth-btn' || e.target.closest('#auth-btn')) {
                if (this.isLoggedIn) {
                    this.showLogoutConfirm();
                } else {
                    this.showLoginModal();
                }
            }
            
            // Chiusura modale
            if (e.target.classList.contains('auth-close') || e.target.classList.contains('auth-modal')) {
                this.hideLoginModal();
            }
        });
        
        // Event listener per il form di login
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }
    
    showLoginModal() {
        document.getElementById('login-modal').style.display = 'flex';
    }
    
    hideLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
        // Reset form
        document.getElementById('login-form')?.reset();
        document.getElementById('auth-error').style.display = 'none';
    }
    
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('auth-error');
        
        if (!username) {
            this.showError('Seleziona un username');
            return;
        }
        
        if (!this.staffMembers.includes(username)) {
            this.showError('Username non autorizzato');
            return;
        }
        
        if (password !== this.staffPassword) {
            this.showError('Password incorretta');
            return;
        }
        
        // Login eseguito con successo
        this.isLoggedIn = true;
        this.currentUser = username;
        localStorage.setItem('clarvs_auth', 'true');
        localStorage.setItem('clarvs_user', username);
        
        this.hideLoginModal();
        this.updateUI();
        this.showSuccessMessage(`Benvenuto, ${username}!`);
    }
    
    showError(message) {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    showLogoutConfirm() {
        if (confirm(`Vuoi uscire dall'account di ${this.currentUser}?`)) {
            this.logout();
        }
    }
    
    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        localStorage.removeItem('clarvs_auth');
        localStorage.removeItem('clarvs_user');
        
        this.updateUI();
        this.showSuccessMessage('Logout eseguito con successo');
    }
    
    updateUI() {
        const authBtn = document.getElementById('auth-btn');
        if (authBtn) {
            if (this.isLoggedIn) {
                authBtn.classList.add('logged-in');
                authBtn.innerHTML = `<i class="fas fa-user-check"></i>`;
                authBtn.title = `Staff: ${this.currentUser} - Click per logout`;
            } else {
                authBtn.classList.remove('logged-in');
                authBtn.innerHTML = `<i class="fas fa-user"></i>`;
                authBtn.title = 'Login Staff';
            }
        }
        
        // Aggiorna elementi che dipendono dall'autenticazione
        this.updateStaffElements();
    }
    
    updateStaffElements() {
        // Mostra/nascondi elementi riservati allo staff
        const staffElements = document.querySelectorAll('.staff-only');
        staffElements.forEach(element => {
            element.style.display = this.isLoggedIn ? 'block' : 'none';
        });
        
        // Aggiorna visibilità specifica per la navigazione scouting
        this.updateNavigationVisibility();
    }
    
    updateNavigationVisibility() {
        // Aggiorna la visibilità del link scouting in tutte le pagine
        const scoutingLinks = document.querySelectorAll('a[href*="scouting.html"]');
        scoutingLinks.forEach(link => {
            const parentLi = link.closest('li');
            if (parentLi) {
                parentLi.style.display = this.isLoggedIn ? 'block' : 'none';
            }
        });
    }
    
    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'auth-notification success';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Getter pubblici
    isStaffLoggedIn() {
        return this.isLoggedIn;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
}

// Inizializzazione globale del sistema di autenticazione
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
    
    // Rendi disponibile globalmente
    window.authSystem = authSystem;
});