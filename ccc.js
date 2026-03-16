/* ===== PAGINA ADMIN ===== */

/* Controllo Accesso */
.access-denied {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.access-denied-content {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%);
    border: 2px solid rgba(37, 99, 235, 0.3);
    border-radius: 20px;
    padding: 3rem;
    text-align: center;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(37, 99, 235, 0.2);
    animation: slideInUp 0.6s ease;
}

.access-denied-icon {
    font-size: 4rem;
    color: var(--primary-color);
    margin-bottom: 1.5rem;
    text-shadow: 0 0 20px var(--glow-blue);
}

.access-denied h2 {
    color: var(--light-color);
    margin-bottom: 1rem;
    font-size: 2rem;
    text-shadow: 0 0 10px var(--glow-blue);
}

.access-denied p {
    color: #ccc;
    margin-bottom: 1rem;
    line-height: 1.6;
}

.access-btn {
    display: inline-block;
    background: var(--gradient-blue);
    color: var(--light-color);
    padding: 1rem 2.5rem;
    border: none;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 700;
    margin: 0.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.access-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.access-btn.secondary {
    background: rgba(108, 117, 125, 0.3);
    border: 2px solid rgba(108, 117, 125, 0.5);
}

.access-btn.secondary:hover {
    background: rgba(108, 117, 125, 0.5);
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.3);
}

/* ===== LAYOUT ADMIN ===== */

.admin-page {
    max-width: 1600px;
    margin: 0 auto;
    padding: 1.5rem 2rem 3rem;
}

.admin-header {
    text-align: center;
    margin-bottom: 2rem;
}

.admin-header h1 {
    color: var(--primary-color);
    font-size: 2.2rem;
    margin-bottom: 1rem;
    text-shadow: 0 0 15px var(--glow-blue), 0 0 30px rgba(0,229,255,0.2);
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.staff-welcome {
    background: rgba(37, 99, 235, 0.07);
    border: 1px solid rgba(37, 99, 235, 0.25);
    border-radius: 12px;
    padding: 1.1rem 1.4rem;
    margin-top: 1rem;
    color: var(--light-color);
    line-height: 1.6;
}

/* ===== TABS ===== */

.admin-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid rgba(37, 99, 235, 0.2);
    padding-bottom: 0;
}

.admin-tab {
    background: transparent;
    border: 2px solid rgba(37, 99, 235, 0.2);
    border-bottom: none;
    color: rgba(255,255,255,0.55);
    padding: 0.75rem 1.5rem;
    border-radius: 10px 10px 0 0;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: -2px;
    letter-spacing: 0.04em;
}

.admin-tab:hover {
    color: var(--primary-color);
    border-color: rgba(37, 99, 235, 0.4);
    background: rgba(37, 99, 235, 0.05);
}

.admin-tab.active {
    color: var(--primary-color);
    border-color: rgba(37, 99, 235, 0.6);
    border-bottom: 2px solid var(--primary-color);
    background: linear-gradient(to bottom, rgba(37, 99, 235, 0.15), rgba(37, 99, 235, 0.05));
    text-shadow: 0 0 10px var(--glow-blue);
    position: relative;
    z-index: 5;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}

/* Rimosso l'accento nero sotto il tab */

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

/* ===== SEZIONI GENERICHE ===== */

.scouting-section {
    margin-bottom: 2.5rem;
}

.section-box {
    background: rgba(0,0,0,0.65);
    border: 1px solid rgba(37,99,235,0.18);
    border-radius: 18px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow:
        0 4px 24px rgba(0,0,0,0.5),
        0 0 0 1px rgba(37,99,235,0.05) inset;
    transition: border-color 0.35s ease, box-shadow 0.35s ease;
}

/* Top-edge accent */
.section-box::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; width: 80%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent);
    pointer-events: none;
}

.section-box h2 {
    color: var(--glow-blue, #00e5ff);
    margin-bottom: 1rem;
    font-size: 1.25rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-shadow:
        0 0 10px rgba(0,229,255,0.6),
        0 0 25px rgba(0,229,255,0.25);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
}

.section-desc {
    color: #aaa;
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    line-height: 1.6;
}

/* ===== ROSTER TABLE ===== */

.roster-table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.roster-table-header h2 {
    margin-bottom: 0;
}

.roster-table-wrapper {
    overflow-x: auto;
    border-radius: 10px;
    border: 1px solid rgba(37, 99, 235, 0.2);
}

.roster-admin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
}

.roster-admin-table thead tr {
    background: linear-gradient(90deg, rgba(37,99,235,0.12), rgba(37,99,235,0.06));
}

.roster-admin-table th {
    padding: 1rem 1.2rem;
    color: var(--glow-blue, #00e5ff);
    font-weight: 700;
    text-align: left;
    white-space: nowrap;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-shadow: 0 0 8px rgba(0,229,255,0.4);
}

.roster-row {
    border-bottom: 1px solid rgba(37,99,235,0.08);
    transition: background 0.25s ease, box-shadow 0.25s ease;
}

.roster-row:hover {
    background: rgba(37,99,235,0.07);
    box-shadow: inset 3px 0 0 rgba(0,229,255,0.4);
}

.roster-row:last-child {
    border-bottom: none;
}

.roster-admin-table td {
    padding: 0.9rem 1.2rem;
    color: var(--light-color);
    vertical-align: middle;
}

.roster-name {
    font-weight: 600;
}

.roster-socials {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.social-mini {
    color: #888;
    font-size: 1rem;
    transition: color 0.2s;
    text-decoration: none;
}

.social-mini:hover {
    color: var(--primary-color);
}

.tracker-cell {
    text-align: center;
}

.tracker-yes {
    color: #2ecc71;
    font-weight: 700;
    font-size: 1.2rem;
}

.tracker-no {
    color: #e74c3c;
    font-weight: 700;
    font-size: 1.2rem;
}

.roster-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    background: transparent;
    border: 1px solid rgba(37, 99, 235, 0.3);
    color: #aaa;
    padding: 0.4rem 1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
}

.action-btn.edit-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: rgba(37, 99, 235, 0.1);
}

.action-btn.delete-btn:hover {
    border-color: #e74c3c;
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
}

.category-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
}

.category-proPlayer      { background: rgba(255, 107, 107, 0.2); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.4); }
.category-talent         { background: rgba(155, 89, 182, 0.2); color: #9b59b6; border: 1px solid rgba(155,89,182,0.4); }
.category-academy        { background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46,204,113,0.4); }
.category-contentCreator { background: rgba(243, 156, 18, 0.2); color: #f39c12; border: 1px solid rgba(243,156,18,0.4); }

/* ===== ROSTER FORM MODAL ===== */

.roster-form-modal {
    max-width: 750px;
    width: 95%;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.form-full {
    grid-column: 1 / -1;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.form-group label {
    color: rgba(0, 229, 255, 0.8);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
}

.form-group input,
.form-group select,
.form-group textarea {
    padding: 0.75rem 1.1rem;
    border: 1px solid rgba(37, 99, 235, 0.2);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    color: var(--light-color);
    font-size: 0.92rem;
    font-family: inherit;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.form-group textarea {
    min-height: 120px;
    resize: vertical;
    line-height: 1.6;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 0.6);
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 
        0 0 0 4px rgba(37, 99, 235, 0.1),
        0 0 20px rgba(37, 99, 235, 0.2);
    transform: translateY(-1px);
}

.form-group select option {
    background: #1a1a2e;
    color: var(--light-color);
}

.form-section-title {
    color: #aaa;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 0.75rem 0 0.5rem 0;
    border-top: 1px solid rgba(37, 99, 235, 0.15);
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(37, 99, 235, 0.15);
}

/* ===== CONTROLLI SCOUTING ===== */

.search-input {
    flex: 1;
    padding: 1rem 1.5rem;
    border: 2px solid rgba(37, 99, 235, 0.3);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.5);
    color: var(--light-color);
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
}

.search-button {
    padding: 1rem 1.5rem;
    background: var(--gradient-blue);
    border: none;
    border-radius: 10px;
    color: var(--light-color);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1rem;
}

.search-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
}

.url-input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.url-list {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.url-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(37,99,235,0.05);
    border: 1px solid rgba(37,99,235,0.2);
    border-radius: 8px;
    padding: 0.6rem 1rem;
    transition: background 0.2s;
}

.url-item:hover { background: rgba(37,99,235,0.1); }

.url-text {
    flex: 1;
    color: #ccc;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.url-remove-btn {
    background: transparent;
    border: none;
    color: #ff4757;
    cursor: pointer;
    padding: 0.3rem 0.5rem;
    border-radius: 5px;
    transition: background 0.2s;
    flex-shrink: 0;
}

.url-remove-btn:hover { background: rgba(255,71,87,0.15); }

.url-empty {
    color: #666;
    font-style: italic;
    padding: 1rem;
    text-align: center;
    border: 1px dashed rgba(37,99,235,0.2);
    border-radius: 8px;
    font-size: 0.9rem;
}

.url-empty i { margin-right: 0.4rem; color: var(--primary-color); }

.scraping-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.run-btn {
    background: var(--gradient-blue);
    border: none;
    color: var(--light-color);
    padding: 0.9rem 2.2rem;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-transform: uppercase;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.run-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37,99,235,0.4);
}

.run-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.scraping-status { font-size: 0.9rem; flex: 1; }

/* ===== MEDIA TOP N ===== */

.top-summary {
    background: rgba(37, 99, 235, 0.06);
    border: 1px solid rgba(37, 99, 235, 0.25);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    margin-bottom: 1.5rem;
}

.summary-label-row {
    color: var(--primary-color);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 0.9rem;
    opacity: 0.8;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
}

.summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.summary-value {
    color: var(--primary-color);
    font-size: 1.5rem;
    font-weight: 700;
    text-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
    line-height: 1;
}

.summary-stat-label {
    color: #888;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ===== LEADERBOARD ===== */

.leaderboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.leaderboard-header h2 { margin-bottom: 0; }

.leaderboard-info {
    display: flex;
    gap: 1.5rem;
    color: #888;
    font-size: 0.9rem;
    flex-wrap: wrap;
}

.leaderboard-info strong { color: var(--primary-color); }

.talent-table-wrapper {
    overflow-x: auto;
    border-radius: 10px;
    border: 1px solid rgba(37,99,235,0.2);
}

.talent-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
}

.talent-table thead tr { background: rgba(37,99,235,0.15); }

.talent-table th {
    padding: 1rem 1.2rem;
    color: var(--primary-color);
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.talent-table th small {
    display: block;
    font-size: 0.7rem;
    opacity: 0.7;
    text-transform: none;
    letter-spacing: 0;
    font-weight: 400;
}

.talent-row {
    border-bottom: 1px solid rgba(37,99,235,0.1);
    cursor: pointer;
    transition: background 0.2s;
}

.talent-row:hover { background: rgba(37,99,235,0.08); }
.talent-row:last-child { border-bottom: none; }
.talent-row--error { opacity: 0.5; }

.talent-table td {
    padding: 0.9rem 1.2rem;
    color: var(--light-color);
    vertical-align: middle;
}

.col-rank { color: #888 !important; font-size: 0.9rem; width: 3rem; }

.talent-row:nth-child(1) .col-rank { color: #ffd700 !important; font-weight: 700; }
.talent-row:nth-child(2) .col-rank { color: #c0c0c0 !important; font-weight: 700; }
.talent-row:nth-child(3) .col-rank { color: #cd7f32 !important; font-weight: 700; }

.col-name { font-weight: 500; }
.pr-value  { color: var(--primary-color) !important; font-weight: 600; }
.avgpr-value { color: #9b59b6 !important; font-weight: 600; }

.profile-link {
    color: var(--primary-color);
    font-size: 1rem;
    transition: color 0.2s, transform 0.2s;
    display: inline-block;
}

.profile-link:hover { color: #fff; transform: scale(1.2); }

.leaderboard-empty {
    text-align: center;
    padding: 3rem;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    border: 2px dashed rgba(37,99,235,0.2);
    border-radius: 10px;
}

.leaderboard-empty i { font-size: 2.5rem; opacity: 0.4; }

/* ===== MODALI ===== */

.player-modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.player-modal-content {
    background: rgba(0,0,0,0.82);
    border: 1px solid rgba(37,99,235,0.25);
    border-radius: 20px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow:
        0 0 0 1px rgba(0,229,255,0.1) inset,
        0 24px 60px rgba(0,0,0,0.7),
        0 0 40px rgba(37,99,235,0.15);
    position: relative;
}

/* Top-edge glow */
.player-modal-content::before {
    content: '';
    position: absolute;
    top: 0; left: 15%; width: 70%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,229,255,0.5), transparent);
    pointer-events: none;
}

.player-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(37, 99, 235, 0.3);
}

.player-modal-header h2 {
    color: var(--light-color);
    margin: 0;
    font-size: 1.6rem;
    text-shadow: 0 0 10px var(--glow-blue);
}

.player-modal-close {
    color: var(--light-color);
    font-size: 2rem;
    cursor: pointer;
    line-height: 1;
    transition: all 0.3s ease;
}

.player-modal-close:hover {
    color: var(--primary-color);
    transform: scale(1.1);
}

.player-modal-body { color: var(--light-color); }

/* Stat modal talent */
.modal-talent-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.modal-stat-item {
    background: rgba(37, 99, 235, 0.1);
    border: 1px solid rgba(37, 99, 235, 0.3);
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
}

.modal-stat-value {
    color: var(--primary-color);
    font-size: 1.5rem;
    font-weight: bold;
    display: block;
    text-shadow: 0 0 10px var(--glow-blue);
}

.modal-stat-label {
    color: var(--light-color);
    font-size: 0.9rem;
    margin-top: 0.3rem;
}

.score-value {
    color: #2ecc71;
    font-weight: 700;
    text-shadow: 0 0 8px rgba(46, 204, 113, 0.4);
}

.modal-metrics-section {
    margin-bottom: 1.5rem;
}

.modal-metrics-section h3 {
    color: var(--primary-color);
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
}

.modal-metric-item {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.6rem 0.8rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-metric-label {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.45);
    font-weight: 600;
    letter-spacing: 0.05em;
}

.modal-metric-value {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 700;
}

.modal-tournaments-section h3 {
    color: var(--primary-color);
    font-size: 1.1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-tournaments-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.modal-tournaments-table th {
    background: rgba(37,99,235,0.1);
    color: var(--primary-color);
    padding: 0.6rem 1rem;
    text-align: left;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.modal-tournaments-table td {
    padding: 0.6rem 1rem;
    border-bottom: 1px solid rgba(37,99,235,0.1);
    color: var(--light-color);
}

.modal-tournaments-table tr:last-child td { border-bottom: none; }
.pr-positive { color: #2ecc71 !important; font-weight: 600; }
.modal-no-stats { text-align: center; color: #666; font-style: italic; padding: 2rem; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px dashed rgba(37,99,235,0.2); }

/* ===== MODAL CONFERMA ELIMINAZIONE ===== */

.delete-confirm-content {
    max-width: 420px;
    text-align: center;
    padding: 2.5rem 2rem;
    border-color: rgba(231, 76, 60, 0.4);
    box-shadow: 0 20px 60px rgba(231, 76, 60, 0.25);
    animation: slideInUp 0.3s ease;
}

.delete-confirm-icon {
    width: 72px;
    height: 72px;
    background: rgba(231, 76, 60, 0.12);
    border: 2px solid rgba(231, 76, 60, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 1.9rem;
    color: #e74c3c;
}

.delete-confirm-title {
    color: #fff;
    font-size: 1.4rem;
    margin-bottom: 0.75rem;
}

.delete-confirm-message {
    color: #ccc;
    font-size: 1rem;
    margin-bottom: 0.4rem;
    line-height: 1.5;
}

.delete-confirm-message strong {
    color: #fff;
}

.delete-confirm-sub {
    color: #666;
    font-size: 0.85rem;
    margin-bottom: 2rem;
}

.delete-confirm-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
}

.delete-danger-btn {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    border: none;
    color: #fff;
    padding: 0.9rem 2rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.delete-danger-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(231, 76, 60, 0.5);
}

/* ===== RESPONSIVE ===== */


/* Home tab: assicura che le sezioni non escano dai loro slot nella griglia inline */
#tab-home .section-box {
    min-width: 0; /* evita overflow nella griglia */
    overflow: hidden;
}

/* Tabella News: layout fisso per evitare il wrapping della colonna Titolo */
.roster-admin-table th:last-child,
.roster-admin-table td:last-child {
    text-align: right;
    width: 130px; /* Allargato come richiesto */
    padding-right: 1.5rem;
}

/* ── Tabella News (4 colonne: Titolo · Data · Anteprima · Azioni) ── */
#news-tbody ~ * th:nth-child(1), /* fallback */
table:has(#news-tbody) th:nth-child(1),
table:has(#news-tbody) td:nth-child(1) { width: 38%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
table:has(#news-tbody) th:nth-child(2),
table:has(#news-tbody) td:nth-child(2) { width: 18%; white-space: nowrap; font-size: 0.8rem; }
table:has(#news-tbody) th:nth-child(3),
table:has(#news-tbody) td:nth-child(3) { width: 32%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: rgba(255,255,255,0.45); font-size: 0.8rem; }
table:has(#news-tbody) th:nth-child(4),
table:has(#news-tbody) td:nth-child(4) { width: 12%; text-align: right; }

/* ── Tabella Eventi (5 colonne: Evento · Data · Ora · Tipo · Azioni) ── */
table:has(#events-tbody) th:nth-child(1),
table:has(#events-tbody) td:nth-child(1) { width: 33%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
table:has(#events-tbody) th:nth-child(2),
table:has(#events-tbody) td:nth-child(2) { width: 18%; white-space: nowrap; font-size: 0.8rem; }
table:has(#events-tbody) th:nth-child(3),
table:has(#events-tbody) td:nth-child(3) { width: 12%; white-space: nowrap; font-size: 0.8rem; }
table:has(#events-tbody) th:nth-child(4),
table:has(#events-tbody) td:nth-child(4) { width: 20%; }
table:has(#events-tbody) th:nth-child(5),
table:has(#events-tbody) td:nth-child(5) { width: 17%; text-align: right; }


/* Barra manutenzione: forza flex quando visibile */
#maintenance-bar {
    display: none;
}
#maintenance-bar[style*="flex"] {
    display: flex !important;
}

/* Azioni nelle righe: sempre su una riga */
.roster-actions {
    white-space: nowrap;
}

/* Status mini (fianco a Forza Scansione) */
.status-mini {
    font-size: 0.85rem;
    color: #aaa;
    min-height: 1.5rem;
}

@media (max-width: 900px) {
    #tab-home > div:first-child {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .admin-page { padding: 1rem 1rem 2rem; }
    .admin-tabs { flex-wrap: wrap; }
    .admin-tab  { padding: 0.6rem 1rem; font-size: 0.85rem; }

    .roster-table-header { flex-direction: column; align-items: flex-start; }

    .form-grid { grid-template-columns: 1fr; }
    .form-full { grid-column: 1; }

    .url-input-group { flex-direction: column; }
    .scraping-controls { flex-direction: column; align-items: flex-start; }

    .talent-table th,
    .talent-table td { padding: 0.7rem 0.8rem; font-size: 0.85rem; }

    .col-earnings { display: none; }

    .modal-talent-stats { grid-template-columns: repeat(2, 1fr); }

    .access-denied-content { padding: 2rem; margin: 1rem; }
    .access-denied h2 { font-size: 1.5rem; }
}

/* ── TAB CLARVS TV ─────────────────────────────────────────────────────────── */

.tv-api-status {
    font-size: 0.78rem;
    margin-left: 0.6rem;
    color: rgba(255,255,255,0.35);
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
}

.tv-api-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
}

.tv-api-header:hover { opacity: 0.85; }

.tv-api-mini-badge {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.3);
}

.tv-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
    margin-top: 1rem;
}

.tv-info-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.tv-info-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: rgba(37,99,235,0.1);
    border: 1px solid rgba(37,99,235,0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: #2563eb;
}

.tv-info-item strong {
    display: block;
    color: #fff;
    margin-bottom: 0.3rem;
    font-size: 0.9rem;
}

.tv-info-item p {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.5;
    margin: 0;
}

@media (max-width: 600px) {
    .tv-info-grid { grid-template-columns: 1fr; }
}

/* ===== FORMULA METRIC CONFIGURATOR ===== */
.f-var-raw    { color: #2563eb; font-weight: 700; }
.f-var-custom { color: #f39c12; font-weight: 700; }
.f-op         { color: rgba(255,255,255,0.35); margin: 0 3px; }
.f-num        { color: #a78bfa; font-weight: 700; }
.f-paren      { color: rgba(255,255,255,0.2); }
.f-comb-badge { background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px; margin-right: 8px; font-size: 0.6rem; color: rgba(255,255,255,0.35); font-weight: 800; letter-spacing: 0.5px; vertical-align: middle; }

.metric-section { transition: opacity 0.3s ease, border-color 0.3s ease; }
.metric-section.step-inactive { opacity: 0.5; }
.metric-section.step-active   { border-color: rgba(37,99,235,0.4) !important; }

.block-desc { font-size: 0.62rem; color: rgba(255,255,255,0.25); margin-top: 4px; line-height: 1.3; transition: color 0.2s; }
.formula-block.active .block-desc { color: rgba(255,255,255,0.45); }

/* ===== PHASE 3: RESPONSIVE & ACCESSIBILITY ===== */

/* Screen-reader only utility */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Touch targets: 44×44px minimum */
.btn-touch-44 {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
}

/* Tab focus visible */
.admin-tab:focus-visible {
    outline: 2px solid var(--primary-color, #2563eb);
    outline-offset: 2px;
}

/* Modal close button: reset button styles */
.player-modal-close {
    background: none;
    border: none;
}

/* ===== ROSTER CARD GRID ===== */

.roster-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem 0;
}

@media (min-width: 600px) {
    .roster-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
    .roster-grid { grid-template-columns: repeat(3, 1fr); }
}

.roster-card {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(37, 99, 235, 0.2);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.roster-card:hover {
    border-color: rgba(37, 99, 235, 0.4);
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
}

.roster-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.roster-card-fields {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
}

.card-field {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.9rem;
}

.card-field-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(0, 229, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    min-width: 55px;
    flex-shrink: 0;
}

.card-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(37, 99, 235, 0.1);
    margin-top: auto;
}

.card-actions .action-btn {
    flex: 1;
    min-height: 44px;
    border-radius: 8px;
    font-size: 0.85rem;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

@media (max-width: 768px) {
    .admin-page {
        padding: 0.75rem;
    }

    /* Tab bar: horizontal scroll on small screens */
    .admin-tabs {
        overflow-x: auto;
        flex-wrap: nowrap;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        padding-bottom: 2px;
    }
    .admin-tabs::-webkit-scrollbar { display: none; }

    .admin-tab {
        white-space: nowrap;
        padding: 0.65rem 0.9rem;
        font-size: 0.8rem;
        flex-shrink: 0;
    }

    /* Modals: full-width on mobile */
    .player-modal-content {
        width: 95vw !important;
        max-width: 95vw !important;
        margin: 1rem auto;
        max-height: 90vh;
        overflow-y: auto;
    }

    /* Roster form: single column */
    #roster-form > div[style*="grid-template-columns"] {
        grid-template-columns: 1fr !important;
    }

    /* Home tab: single column */
    #tab-home > div[style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr !important;
    }

    /* Scouting: sidebar stacks above main */
    #tab-scouting > div[style*="grid-template-columns: 380px"] {
        grid-template-columns: 1fr !important;
    }

    /* Staff tab: single column */
    #tab-staff > div[style*="grid-template-columns"] {
        grid-template-columns: 1fr !important;
    }

    /* Section box: reduce padding */
    .section-box {
        padding: 1.25rem;
    }
}
