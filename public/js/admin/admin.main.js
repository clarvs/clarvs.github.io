// admin.main.js — LOAD LAST. Requires all other admin scripts.
// Load order: admin.utils.js → admin.roster.js → admin.scouting.js → admin.tv.js → admin.home.js → admin.formula.js → admin.links.js → admin.ccc.js → admin.main.js

class AdminSystem {
    constructor() {
        window.onerror = (msg, url, line) => console.error(`[Global Error] ${msg} at ${url}:${line}`);
        this.checkAccess();
        if (this.hasAccess()) {
            this.initTabs();
            this.updateWelcomeMessage();
            try { window.rosterSystem = new RosterSystem(); } catch (e) { console.error("RosterSystem init error:", e); }
            try { window.forceScanSystem = new ForceScanSystem(); } catch (e) { console.error("ForceScanSystem init error:", e); }
            try { window.scoutingSystem = new ScoutingSystem(); } catch (e) { console.error("ScoutingSystem init error:", e); }
            try { window.tvSystem = new TVSystem(); } catch (e) { console.error("TVSystem init error:", e); }
            try { window.homeContentSystem = new HomeContentSystem(); } catch (e) { console.error("HomeContentSystem init error:", e); }
            try { window.formulaSystem = new FormulaSystem(); } catch (e) { console.error("FormulaSystem init error:", e); }
            try { window.linkSystem = new LinkSystem(); } catch (e) { console.error("LinkSystem init error:", e); }
            try { window.cccSystem = new CCCSystem(); } catch (e) { console.error("CCCSystem init error:", e); }
            try { window.staffMemberSystem = new StaffMemberSystem(); } catch (e) { console.error("StaffMemberSystem init error:", e); }
        }
        const checkAccessInterval = setInterval(() => this.checkAccess(), 2000);
        window.addEventListener('beforeunload', () => {
            clearInterval(checkAccessInterval);
        });
    }

    checkAccess() {
        const ok = this.hasAccess();
        document.getElementById('access-denied').style.display = ok ? 'none' : 'flex';
        document.querySelectorAll('.staff-only').forEach(el => {
            el.style.display = ok ? 'block' : 'none';
        });
        if (ok) this.updateWelcomeMessage();
    }

    hasAccess() {
        return window.authSystem && window.authSystem.isStaffLoggedIn();
    }

    updateWelcomeMessage() {
        const el = document.getElementById('staff-welcome');
        if (!el || !window.authSystem) return;
        const user = window.authSystem.getCurrentUser();
        if (user) {
            el.innerHTML = `<p><strong>Benvenuto ${user.nickname || user}!</strong> Pannello di amministrazione Clarvs</p>`;
        }
    }

    initTabs() {
        const allTabs = document.querySelectorAll('.admin-tab');
        allTabs.forEach(tab => {
            tab.addEventListener('click', () => this._activateTab(tab));
            tab.addEventListener('keydown', e => {
                const tabArr = Array.from(allTabs);
                const idx = tabArr.indexOf(tab);
                let next = -1;
                if (e.key === 'ArrowRight') { next = (idx + 1) % tabArr.length; e.preventDefault(); }
                else if (e.key === 'ArrowLeft') { next = (idx - 1 + tabArr.length) % tabArr.length; e.preventDefault(); }
                if (next >= 0) { this._activateTab(tabArr[next]); tabArr[next].focus(); }
            });
        });
    }

    _activateTab(tab) {
        document.querySelectorAll('.admin-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.remove('active');
            c.style.display = 'none';
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        const tName = tab.dataset.tab;
        const content = document.getElementById(`tab-${tName}`);
        if (content) {
            content.classList.add('active');
            content.style.display = 'block';
            if (tName === 'links') window.linkSystem?.load();
            if (tName === 'staff') window.staffAdmin?.loadStaff();
            if (tName === 'ccc') window.cccSystem?.load();
        }
    }
}

// --- INIT ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    function initAdmin() {
        if (window.authSystem) {
            window.adminSystem = new AdminSystem();
            console.log('Admin System inizializzato');
        } else {
            setTimeout(initAdmin, 500);
        }
    }
    initAdmin();

    document.getElementById('login-redirect')?.addEventListener('click', () => {
        window.authSystem?.showLoginModal();
    });
});
