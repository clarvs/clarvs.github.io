body, html {
    background: #000 !important;
}

.tv-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.tv-page h1 {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 0 1rem;
    font-size: 2.2rem;
    color: #00bcd4;
    text-shadow: 0 0 10px rgba(0,188,212,0.7), 0 0 30px rgba(0,188,212,0.3);
    margin: 0 auto;
    text-align: center;
    letter-spacing: 0.12em;
    font-weight: 800;
}

.tv-container, .schedule-list, .tv-controls {
    background: #111 !important;
}

.tv-container {
    background: rgba(17, 17, 17, 0.9) !important;
    border-radius: 18px;
    overflow: hidden;
    margin-bottom: 2rem;
    box-shadow: 0 8px 40px rgba(0, 188, 212, 0.15), 0 0 0 1px rgba(0,188,212,0.08);
    border: 1px solid rgba(0, 188, 212, 0.18);
    backdrop-filter: blur(10px);
}

.tv-screen {
    width: 100%;
    height: 500px; /* Aumentata per migliore esperienza */
    background: #000;
    position: relative;
    overflow: hidden;
}

.tv-screen iframe,
.tv-screen video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}

.tv-screen iframe {
    width: 100% !important;
    height: 100% !important;
    border: none;
    display: block;
}

.tv-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: rgba(17, 17, 17, 0.9);
    border-top: 1px solid rgba(0, 188, 212, 0.2);
}

.tv-controls button {
    background: linear-gradient(45deg, #00bcd4, #0097a7);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);
}

.tv-controls button:hover {
    background: linear-gradient(45deg, #006064, #00bcd4);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);
}

/* Notifica Live */
.live-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(45deg, #ff1744, #d50000);
    color: white;
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(255, 23, 68, 0.3);
    z-index: 10000;
    animation: slideInRight 0.5s ease, pulse 2s infinite;
    max-width: 300px;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.notification-content i {
    font-size: 1.5rem;
    animation: pulse 1s infinite;
}

.notification-content strong {
    display: block;
    margin-bottom: 0.25rem;
}

.notification-content p {
    margin: 0;
    font-weight: 600;
}

.notification-content span {
    font-size: 0.8rem;
    opacity: 0.9;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

/* Status Stream */
.stream-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
}

.stream-status .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #666;
    animation: none;
}

.stream-status.live .dot {
    background: #ff1744;
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 50% {
        opacity: 1;
    }
    51%, 100% {
        opacity: 0.3;
    }
}

/* Controlli aggiuntivi */
.force-check-btn {
    background: rgba(0, 188, 212, 0.1);
    border: 1px solid rgba(0, 188, 212, 0.3);
    color: #00bcd4;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.force-check-btn:hover {
    background: rgba(0, 188, 212, 0.2);
    border-color: rgba(0, 188, 212, 0.5);
}

.schedule-list {
    display: grid;
    gap: 1rem;
}

.schedule-item {
    display: flex;
    justify-content: space-between;
    background-color: rgba(26, 26, 46, 0.8);
    padding: 1rem;
    border-radius: 5px;
}

.schedule-item .time {
    color: var(--primary-color);
    font-weight: bold;
}

.schedule-item .event {
    color: var(--light-color);
}

@media (max-width: 768px) {
    .schedule-item {
        flex-direction: column;
        gap: 0.5rem;
    }
}

.schedule, .schedule-list, .schedule-item {
    display: none !important;
}

/* Migliorie responsive */
@media (max-width: 768px) {
    .live-notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
    
    .tv-controls {
        flex-direction: column;
        gap: 1rem;
    }
    
    .stream-status {
        justify-content: center;
    }
}

/* Errore TV */
.tv-error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    background: #111;
    color: white;
    text-align: center;
    padding: 2rem;
}

.tv-error h3 {
    color: #ff6b6b;
    margin-bottom: 1rem;
}

.tv-error button {
    background: #00bcd4;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    margin-top: 10px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.tv-error button:hover {
    background: #0097a7;
}

/* Fullscreen Styles */
.tv-container:fullscreen,
.tv-container:-webkit-full-screen,
.tv-container:-moz-full-screen {
    background: #000 !important;
    width: 100vw !important;
    height: 100vh !important;
    display: flex;
    flex-direction: column;
}

.tv-container:fullscreen .tv-screen,
.tv-container:-webkit-full-screen .tv-screen,
.tv-container:-moz-full-screen .tv-screen {
    flex: 1;
    height: calc(100vh - 60px) !important;
    max-height: none;
}

.tv-container:fullscreen .tv-controls,
.tv-container:-webkit-full-screen .tv-controls,
.tv-container:-moz-full-screen .tv-controls {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 10000;
}

.tv-container:fullscreen iframe,
.tv-container:-webkit-full-screen iframe,
.tv-container:-moz-full-screen iframe {
    width: 100% !important;
    height: 100% !important;
}

/* Responsive per dimensioni normali */
@media (max-width: 768px) {
    .tv-screen {
        height: 300px;
    }
    
    .tv-page {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    .tv-screen {
        height: 250px;
    }
}

/* === LAYOUT TV + CHAT === */
.tv-main-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
    align-items: start;
}

.tv-left-section {
    min-width: 0;
}

.tv-chat-section {
    height: 80vh;
    position: sticky;
    top: 2rem;
}

/* === CHAT LIVE STYLES === */
.chat-container {
    height: 100%;
    background: rgba(20, 20, 30, 0.95);
    border-radius: 15px;
    border: 1px solid rgba(0, 188, 212, 0.2);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 188, 212, 0.15);
}

.chat-header {
    background: linear-gradient(135deg, rgba(0, 188, 212, 0.1), rgba(0, 188, 212, 0.05));
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0, 188, 212, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header h3 {
    margin: 0;
    color: #00bcd4;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.chat-viewers {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 188, 212, 0.3) transparent;
}

.chat-messages::-webkit-scrollbar {
    width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
    background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
    background: rgba(0, 188, 212, 0.3);
    border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 188, 212, 0.5);
}

.chat-welcome {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 2rem 0;
}

.chat-welcome i {
    color: #00bcd4;
    font-size: 2rem;
    margin-bottom: 1rem;
    display: block;
}

.chat-message {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 0.75rem;
    border-left: 3px solid rgba(0, 188, 212, 0.3);
    animation: message-appear 0.3s ease-out;
    word-wrap: break-word;
}

@keyframes message-appear {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.chat-message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.3rem;
}

.chat-username {
    color: #00bcd4;
    font-weight: 600;
    font-size: 0.9rem;
}

.chat-timestamp {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
}

.chat-text {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.3;
    font-size: 0.9rem;
}

.chat-input-section {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(0, 188, 212, 0.2);
    background: rgba(0, 0, 0, 0.2);
}

.chat-input-container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.chat-username-setup {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

#chat-input, #username-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 188, 212, 0.2);
    border-radius: 8px;
    padding: 0.75rem;
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

#chat-input:focus, #username-input:focus {
    outline: none;
    border-color: #00bcd4;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.1);
}

#chat-input::placeholder, #username-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

#chat-send-btn, #username-set-btn {
    background: linear-gradient(135deg, #00bcd4, #00acc1);
    border: none;
    border-radius: 8px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

#username-set-btn {
    width: auto;
    padding: 0 1rem;
    white-space: nowrap;
}

#chat-send-btn:hover:not(:disabled), 
#username-set-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #00acc1, #0097a7);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}

#chat-send-btn:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.4);
}

#chat-send-btn:active:not(:disabled),
#username-set-btn:active:not(:disabled) {
    transform: translateY(0);
}

/* === RESPONSIVE CHAT === */
@media (max-width: 1024px) {
    .tv-main-layout {
        grid-template-columns: 1fr;
    }
    
    .tv-chat-section {
        height: 400px;
        position: static;
    }
}

@media (max-width: 768px) {
    .tv-chat-section {
        height: 350px;
    }
    
    .chat-header {
        padding: 0.75rem 1rem;
    }
    
    .chat-input-section {
        padding: 0.75rem 1rem;
    }
}

/* ═══════════════════════════════════════════════════════════════════
   NOW PLAYING BAR
═══════════════════════════════════════════════════════════════════ */

.tv-now-playing {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: linear-gradient(135deg, rgba(0,188,212,0.08), rgba(0,188,212,0.03));
    border: 1px solid rgba(0,188,212,0.2);
    border-radius: 10px;
    padding: 0.55rem 1rem;
    margin-bottom: 0.6rem;
    font-size: 0.9rem;
    flex-wrap: wrap;
}

.now-playing-label {
    color: rgba(255,255,255,0.55);
    font-size: 0.82rem;
}

.now-playing-name {
    color: #fff;
    font-weight: 700;
}

.now-playing-platform {
    color: rgba(255,255,255,0.7);
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

/* ── Controlli TV ── */

.tv-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.back-to-playlist-btn {
    background: rgba(0,188,212,0.1);
    border: 1px solid rgba(0,188,212,0.3);
    color: #00bcd4;
    padding: 0.45rem 0.9rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.82rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.25s ease;
}

.back-to-playlist-btn:hover {
    background: rgba(0,188,212,0.2);
    border-color: rgba(0,188,212,0.5);
}

.fullscreen-btn {
    background: linear-gradient(45deg, #00bcd4, #0097a7);
    color: white;
    border: none;
    padding: 0.45rem 0.9rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.82rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.3s ease;
}

.fullscreen-btn:hover {
    background: linear-gradient(45deg, #006064, #00bcd4);
    transform: translateY(-1px);
}

/* TV Loading placeholder */
.tv-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.8rem;
    color: rgba(255,255,255,0.4);
}

.tv-loading i { font-size: 2rem; color: rgba(0,188,212,0.4); }

/* ═══════════════════════════════════════════════════════════════════
   SEZIONI TV (Canali + Video)
═══════════════════════════════════════════════════════════════════ */

.tv-section {
    margin-top: 2.5rem;
}

.tv-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.tv-section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.tv-section-title h2 {
    color: #00e5ff;
    font-size: clamp(1.3rem, 3vw, 1.75rem);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-shadow:
        0 0 12px rgba(0,229,255,0.7),
        0 0 30px rgba(0,229,255,0.3);
    position: relative;
}

.tv-section-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Grid canali (uguale a streamers-grid) */
.channels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 1rem;
}

/* ── Griglia Video YouTube ── */

.videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.1rem;
}

.video-card {
    background: rgba(0,0,0,0.65);
    border: 1px solid rgba(0,188,212,0.14);
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94),
                box-shadow  0.35s cubic-bezier(0.25,0.46,0.45,0.94),
                border-color 0.35s ease;
}

/* Shimmer sweep */
.video-card::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,68,68,0.06), transparent);
    transition: left 0.55s ease;
    z-index: 1;
    pointer-events: none;
}
.video-card:hover::before { left: 100%; }

/* Top-edge highlight */
.video-card::after {
    content: '';
    position: absolute;
    top: 0; left: 10%; width: 80%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,68,68,0.5), transparent);
    opacity: 0;
    transition: opacity 0.35s ease;
    z-index: 2;
    pointer-events: none;
}
.video-card:hover::after { opacity: 1; }

.video-card:hover {
    transform: translateY(-10px);
    border-color: rgba(255,68,68,0.4);
    box-shadow:
        0 0 0 1px rgba(255,68,68,0.12),
        0 24px 50px rgba(255,68,68,0.2),
        0 8px 20px rgba(0,0,0,0.6);
}

.video-thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #0d0d1a;
}

.video-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.25s ease;
}

.video-card:hover .video-thumb img {
    transform: scale(1.04);
}

.video-play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.45);
    color: #ff4444;
    font-size: 2.5rem;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.video-card:hover .video-play-overlay {
    opacity: 1;
}

.video-info {
    padding: 0.75rem 0.85rem 0.9rem;
}

.video-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #fff;
    line-height: 1.35;
    margin: 0 0 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.video-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}

.video-channel {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: rgba(255,68,68,0.8);
    font-weight: 500;
}

.video-channel-avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    object-fit: cover;
}

.video-date {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.35);
    white-space: nowrap;
}

/* TV Placeholder */
.tv-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.75rem;
    color: rgba(255,255,255,0.25);
    text-align: center;
}

.tv-placeholder i    { font-size: 3rem; color: rgba(0,188,212,0.2); }
.tv-placeholder p    { font-size: 1rem; margin: 0; }
.tv-placeholder small { font-size: 0.8rem; }

/* ── Responsive Sezioni ── */

@media (max-width: 1024px) {
    .channels-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
    .videos-grid   { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
}

@media (max-width: 768px) {
    .tv-section-header { flex-direction: column; align-items: flex-start; }
    .tv-section-controls { width: 100%; flex-direction: column; align-items: flex-start; gap: 0.6rem; }
    .channels-grid { grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 0.75rem; }
    .videos-grid   { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
}

@media (max-width: 480px) {
    .channels-grid { grid-template-columns: repeat(2, 1fr); }
    .videos-grid   { grid-template-columns: repeat(2, 1fr); }
}

/* Retrocompatibilità (streamers-section usato altrove) */
.streamers-section { margin-top: 2.5rem; }
.streamers-header  { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; }
.streamers-title-group { display: flex; align-items: center; gap: 0.75rem; }
.streamers-title-group h2 { color: #00bcd4; font-size: 1.35rem; margin: 0; }

.live-count-badge {
    background: #ff1744;
    color: #fff;
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.2rem 0.55rem;
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    animation: pulse 2s infinite;
}

.streamers-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Filtri */
.streamer-filters {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
}

.streamer-filter-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    padding: 0.35rem 0.8rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: all 0.25s ease;
}

.streamer-filter-btn:hover {
    background: rgba(0,188,212,0.1);
    border-color: rgba(0,188,212,0.3);
    color: #00bcd4;
}

.streamer-filter-btn.active {
    background: rgba(0,188,212,0.15);
    border-color: rgba(0,188,212,0.5);
    color: #00bcd4;
    font-weight: 600;
}

/* Meta: ora + refresh */
.streamers-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.last-check {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.35);
}

.refresh-live-btn {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    transition: all 0.25s ease;
}

.refresh-live-btn:hover {
    border-color: rgba(0,188,212,0.4);
    color: #00bcd4;
}

.refresh-live-btn.spinning i {
    animation: spin 0.8s linear infinite;
}



/* Warning API non configurata */
.no-api-warning {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(243,156,18,0.08);
    border: 1px solid rgba(243,156,18,0.3);
    border-radius: 10px;
    padding: 0.7rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    color: rgba(243,156,18,0.9);
}

.no-api-warning a {
    color: #f39c12;
    text-decoration: underline;
}

/* ── Grid Streamer ── */

.streamers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 1rem;
}

/* Empty/loading states */
.streamers-loading,
.streamers-empty {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 3rem 2rem;
    color: rgba(255,255,255,0.35);
    font-size: 0.9rem;
    text-align: center;
}

.streamers-loading i,
.streamers-empty i {
    font-size: 2rem;
    color: rgba(0,188,212,0.3);
}

.streamers-empty small {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.25);
}

/* ═══════════════════════════════════════════════════════════════════
   STREAMER CARD  —  glass morphism premium (allineato a home.css)
═══════════════════════════════════════════════════════════════════ */

.streamer-card {
    background: rgba(0,0,0,0.65);
    border: 1px solid rgba(0,188,212,0.18);
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94),
                box-shadow  0.35s cubic-bezier(0.25,0.46,0.45,0.94),
                border-color 0.35s ease;
    user-select: none;
}

/* Shimmer sweep al hover */
.streamer-card::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0,188,212,0.08), transparent);
    transition: left 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
    z-index: 1;
    pointer-events: none;
}
.streamer-card:hover::before { left: 100%; }

/* Top-edge highlight al hover */
.streamer-card::after {
    content: '';
    position: absolute;
    top: 0; left: 10%; width: 80%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,229,255,0.6), transparent);
    opacity: 0;
    transition: opacity 0.35s ease;
    z-index: 2;
    pointer-events: none;
}
.streamer-card:hover::after { opacity: 1; }

.streamer-card:hover {
    transform: translateY(-10px);
    border-color: rgba(0,188,212,0.55);
    box-shadow:
        0 0 0 1px rgba(0,229,255,0.15),
        0 24px 50px rgba(0,188,212,0.3),
        0 8px 20px rgba(0,0,0,0.6);
}

.streamer-card.is-live {
    border-color: rgba(255,23,68,0.35);
    box-shadow: 0 4px 24px rgba(255,23,68,0.12);
}
.streamer-card.is-live::before {
    background: linear-gradient(90deg, transparent, rgba(255,23,68,0.06), transparent);
}
.streamer-card.is-live::after {
    background: linear-gradient(90deg, transparent, rgba(255,23,68,0.5), transparent);
}
.streamer-card.is-live:hover {
    border-color: rgba(255,23,68,0.65);
    box-shadow:
        0 0 0 1px rgba(255,23,68,0.15),
        0 24px 50px rgba(255,23,68,0.25),
        0 8px 20px rgba(0,0,0,0.6);
}

.streamer-card.is-active {
    border-color: #00bcd4;
    box-shadow:
        0 0 0 2px rgba(0,188,212,0.25),
        0 0 0 1px rgba(0,229,255,0.1),
        0 16px 40px rgba(0,188,212,0.25);
}

/* ── Thumbnail ── */

.sc-thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #0d0d1a;
    background-size: cover;
    background-position: center;
    overflow: hidden;
}

.sc-thumb.has-live-thumb {
    /* Screenshot live come sfondo – avatar più piccolo */
}

.sc-avatar {
    position: absolute;
    bottom: 8px;
    left: 8px;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid rgba(0,188,212,0.5);
    object-fit: cover;
    background: #1a1a2e;
    transition: border-color 0.25s;
}

.streamer-card.is-live .sc-avatar {
    border-color: #ff1744;
    width: 40px;
    height: 40px;
}

/* Badge LIVE in alto a destra */
.sc-live-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #ff1744;
    color: #fff;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
    letter-spacing: 0.5px;
}

/* Badge IN ONDA (player attivo) */
.sc-on-air {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #00bcd4;
    color: #000;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
}

/* Overlay "Guarda ora" al hover */
.sc-watch-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.25s ease;
}

.sc-watch-overlay i {
    font-size: 2.2rem;
    color: #ff1744;
}

.streamer-card.is-live:hover .sc-watch-overlay {
    opacity: 1;
}

/* ── Body ── */

.sc-body {
    padding: 0.75rem 0.85rem 0.9rem;
}

.sc-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
}

.sc-name {
    font-weight: 700;
    font-size: 0.95rem;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sc-role {
    display: block;
    font-size: 0.72rem;
    color: rgba(255,255,255,0.4);
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

/* Pill LIVE accanto al nome */
.live-pill {
    flex-shrink: 0;
    background: #ff1744;
    color: #fff;
    font-size: 0.62rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    animation: pulse 1.8s infinite;
}

/* Meta live: gioco + viewer */
.streamer-live-meta {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.3rem;
    font-size: 0.78rem;
}

.live-game    { color: #00bcd4; }
.live-viewers { color: rgba(255,255,255,0.6); }

.live-title {
    font-size: 0.76rem;
    color: rgba(255,255,255,0.55);
    margin: 0.15rem 0 0.4rem;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}


/* Platform badges */
.sc-platforms {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.5rem;
}

.platform-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    text-decoration: none;
    transition: all 0.2s ease;
    font-weight: 500;
}

.platform-badge.twitch {
    background: rgba(145,71,255,0.12);
    color: #9147ff;
    border: 1px solid rgba(145,71,255,0.25);
}

.platform-badge.twitch:hover {
    background: rgba(145,71,255,0.25);
    border-color: rgba(145,71,255,0.5);
}

.platform-badge.youtube {
    background: rgba(255,0,0,0.1);
    color: #ff4444;
    border: 1px solid rgba(255,68,68,0.25);
}

.platform-badge.youtube:hover {
    background: rgba(255,0,0,0.2);
    border-color: rgba(255,68,68,0.5);
}

/* Dot live piccolo (usato in badge e pill) */
.live-dot-sm {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: blink 1s infinite;
    flex-shrink: 0;
}

/* Notifica live – aggiunge close button */
.notif-close-btn {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    font-size: 1rem;
    padding: 0 0.3rem;
    line-height: 1;
    margin-left: 0.5rem;
    transition: color 0.2s;
}
.notif-close-btn:hover { color: #fff; }

/* ═══════════════════════════════════════════════════════════════════
   RESPONSIVE STREAMER SECTION
═══════════════════════════════════════════════════════════════════ */

@media (max-width: 1024px) {
    .streamers-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
}

@media (max-width: 768px) {
    .streamers-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .streamers-controls {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.6rem;
    }

    .streamer-filters {
        width: 100%;
    }

    .streamers-grid {
        grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
        gap: 0.75rem;
    }

    .sc-body { padding: 0.6rem 0.7rem 0.75rem; }
    .sc-name  { font-size: 0.87rem; }

    .tv-now-playing {
        font-size: 0.82rem;
        gap: 0.4rem;
    }
}

@media (max-width: 480px) {
    .streamers-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}