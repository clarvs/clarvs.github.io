/* ===== PAGINA SCOUTING ===== */

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
    border: 2px solid rgba(0, 188, 212, 0.3);
    border-radius: 20px;
    padding: 3rem;
    text-align: center;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 188, 212, 0.2);
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
    padding: 1rem 2rem;
    border: none;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    margin: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.access-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 188, 212, 0.4);
}

.access-btn.secondary {
    background: rgba(108, 117, 125, 0.3);
    border: 2px solid rgba(108, 117, 125, 0.5);
}

.access-btn.secondary:hover {
    background: rgba(108, 117, 125, 0.5);
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.3);
}

/* Header Scouting */
.scouting-page {
    max-width: 1400px;
    margin: 2rem auto;
    padding: 2rem;
}

.scouting-header {
    text-align: center;
    margin-bottom: 3rem;
}

.scouting-header h1 {
    color: var(--primary-color);
    font-size: 2.5rem;
    margin-bottom: 1rem;
    text-shadow: 0 0 15px var(--glow-blue);
}

.staff-welcome {
    background: rgba(0, 188, 212, 0.1);
    border: 1px solid rgba(0, 188, 212, 0.3);
    border-radius: 10px;
    padding: 1rem;
    margin-top: 1rem;
    color: var(--light-color);
}

/* Sezione Ricerca */
.scouting-search-section {
    margin-bottom: 3rem;
}

.search-container {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%);
    border: 2px solid rgba(0, 188, 212, 0.3);
    border-radius: 15px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 40px rgba(0, 188, 212, 0.15);
}

.search-container h2 {
    color: var(--primary-color);
    margin-bottom: 1.5rem;
    text-shadow: 0 0 10px var(--glow-blue);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.search-controls {
    display: grid;
    gap: 1.5rem;
}

.search-input-group {
    display: flex;
    gap: 0.5rem;
}

.search-input {
    flex: 1;
    padding: 1rem 1.5rem;
    border: 2px solid rgba(0, 188, 212, 0.3);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.5);
    color: var(--light-color);
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 15px rgba(0, 188, 212, 0.4);
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
    box-shadow: 0 8px 25px rgba(0, 188, 212, 0.3);
}

.search-filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.filter-select {
    padding: 0.8rem;
    border: 2px solid rgba(0, 188, 212, 0.3);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.5);
    color: var(--light-color);
    font-size: 1rem;
    transition: all 0.3s ease;
}

.filter-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 10px rgba(0, 188, 212, 0.3);
}

.filter-select option {
    background: #1a1a2e;
    color: var(--light-color);
}

/* Risultati */
.scouting-results {
    margin-bottom: 3rem;
}

.results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(0, 188, 212, 0.1);
    border-radius: 10px;
    border: 1px solid rgba(0, 188, 212, 0.3);
}

.results-header h3 {
    color: var(--primary-color);
    margin: 0;
}

.clear-btn {
    background: transparent;
    border: 2px solid rgba(255, 71, 87, 0.5);
    color: #ff4757;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.clear-btn:hover {
    background: rgba(255, 71, 87, 0.1);
    border-color: #ff4757;
}

.players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    min-height: 200px;
}

.initial-message {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    border: 2px dashed rgba(0, 188, 212, 0.2);
    border-radius: 15px;
}

.initial-message i {
    font-size: 3rem;
    opacity: 0.5;
}

.no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: #ff6b6b;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    border: 2px dashed rgba(255, 107, 107, 0.3);
    border-radius: 15px;
    background: rgba(255, 107, 107, 0.05);
}

.no-results i {
    font-size: 3rem;
    opacity: 0.7;
}

/* Card Giocatore */
.player-card {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%);
    border: 2px solid rgba(0, 188, 212, 0.2);
    border-radius: 15px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    cursor: pointer;
}

.player-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 188, 212, 0.2);
}

.player-card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.player-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(0, 188, 212, 0.3);
    flex-shrink: 0;
}

.player-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.3s ease;
    opacity: 0;
}

.player-avatar img.loaded {
    opacity: 1;
}

.player-info h3 {
    color: var(--light-color);
    margin: 0 0 0.3rem 0;
    font-size: 1.2rem;
}

.player-role {
    color: var(--primary-color);
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
}

.player-game {
    color: #999;
    font-size: 0.8rem;
    margin: 0.2rem 0 0 0;
}

.player-details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 188, 212, 0.2);
}

.player-social {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 0.5rem;
}

.social-link {
    color: #666;
    font-size: 1.1rem;
    transition: color 0.3s ease;
}

.social-link:hover {
    color: var(--primary-color);
}

.player-stats {
    font-size: 0.8rem;
    color: #888;
}

.stats-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.3rem;
}

.stat-value {
    color: var(--light-color);
    font-weight: 500;
}

/* Statistiche Rapide */
.quick-stats-section {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%);
    border: 2px solid rgba(0, 188, 212, 0.3);
    border-radius: 15px;
    padding: 2rem;
    backdrop-filter: blur(10px);
}

.quick-stats-section h2 {
    color: var(--primary-color);
    margin-bottom: 1.5rem;
    text-shadow: 0 0 10px var(--glow-blue);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: rgba(0, 188, 212, 0.05);
    border: 1px solid rgba(0, 188, 212, 0.2);
    border-radius: 10px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
}

.stat-card:hover {
    background: rgba(0, 188, 212, 0.1);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 188, 212, 0.2);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    background: var(--gradient-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: var(--light-color);
}

.stat-content h3 {
    color: var(--primary-color);
    font-size: 2rem;
    margin: 0 0 0.2rem 0;
    text-shadow: 0 0 10px var(--glow-blue);
}

.stat-content p {
    color: var(--light-color);
    margin: 0;
    font-size: 0.9rem;
}

/* Animazioni */
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .scouting-page {
        padding: 1rem;
        margin: 1rem auto;
    }
    
    .access-denied-content {
        padding: 2rem;
        margin: 1rem;
    }
    
    .access-denied h2 {
        font-size: 1.5rem;
    }
    
    .search-container {
        padding: 1.5rem;
    }
    
    .search-input-group {
        flex-direction: column;
    }
    
    .search-filters {
        grid-template-columns: 1fr;
    }
    
    .results-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .players-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .stats-cards {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .player-card {
        padding: 1rem;
    }
    
    .stat-card {
        padding: 1rem;
    }
}

/* Modale Dettagli Giocatore */
.player-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.player-modal-content {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%);
    border: 2px solid rgba(0, 188, 212, 0.3);
    border-radius: 20px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 188, 212, 0.3);
    animation: slideIn 0.3s ease;
}

.player-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(0, 188, 212, 0.3);
}

.player-modal-header h2 {
    color: var(--light-color);
    margin: 0;
    font-size: 1.8rem;
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

.player-modal-body {
    color: var(--light-color);
}

.modal-player-card {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    align-items: flex-start;
}

.modal-player-avatar {
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    border-radius: 15px;
    overflow: hidden;
    border: 3px solid rgba(0, 188, 212, 0.5);
    box-shadow: 0 8px 25px rgba(0, 188, 212, 0.2);
}

.modal-player-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.modal-player-info h3 {
    color: var(--primary-color);
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 0 15px var(--glow-blue);
}

.modal-player-role {
    color: var(--light-color);
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 0.3rem 0;
}

.modal-player-game {
    color: #999;
    font-size: 1rem;
    margin: 0 0 1rem 0;
}

.modal-social-links {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.modal-social-links strong {
    color: var(--primary-color);
    margin-right: 0.5rem;
}

.modal-social-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(0, 188, 212, 0.1);
    border: 2px solid rgba(0, 188, 212, 0.3);
    border-radius: 10px;
    color: var(--primary-color);
    text-decoration: none;
    font-size: 1.2rem;
    transition: all 0.3s ease;
}

.modal-social-link:hover {
    background: rgba(0, 188, 212, 0.2);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 188, 212, 0.3);
}

.modal-stats-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid rgba(0, 188, 212, 0.2);
}

.modal-stats-title {
    color: var(--primary-color);
    font-size: 1.3rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.modal-stat-item {
    background: rgba(0, 188, 212, 0.1);
    border: 1px solid rgba(0, 188, 212, 0.3);
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
    transition: all 0.3s ease;
}

.modal-stat-item:hover {
    background: rgba(0, 188, 212, 0.15);
    border-color: var(--primary-color);
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

.modal-no-stats {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    border: 1px dashed rgba(0, 188, 212, 0.2);
}

.modal-tracker-info {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(0, 188, 212, 0.05);
    border: 1px solid rgba(0, 188, 212, 0.2);
    border-radius: 10px;
}

.modal-tracker-info strong {
    color: var(--primary-color);
}

/* Responsive per modale */
@media (max-width: 768px) {
    .player-modal-content {
        padding: 1.5rem;
        margin: 1rem;
        max-height: 90vh;
    }
    
    .modal-player-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .modal-player-avatar {
        align-self: center;
        width: 100px;
        height: 100px;
    }
    
    .modal-stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }
    
    .modal-social-links {
        justify-content: center;
        flex-wrap: wrap;
    }
}