body, html {
    background: #000 !important;
}

/* =============================================
   MAIN CONTAINER OVERRIDE — roster only
   ============================================= */
.main-container {
    padding: 2rem 0 0 !important;
    max-width: 100% !important;
}

/* =============================================
   ROSTER PAGE CONTAINER
   ============================================= */
.roster-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 2.5rem 4rem;
}

.roster-page h1 {
    padding-top: 0.5rem;
    text-align: center;
    margin-bottom: 2.5rem;
    color: #2563eb;
    font-size: 2.4rem;
    font-weight: 800;
    letter-spacing: 4px;
    text-transform: uppercase;
    text-shadow:
        0 0 10px #2563eb,
        0 0 24px rgba(37, 99, 235, 0.6),
        0 0 48px rgba(96, 165, 250, 0.25);
}

/* =============================================
   ROSTER SECTIONS
   ============================================= */
#roster-grid,
#staff-grid {
    display: block;
    width: 100%;
}

.roster-section {
    margin-bottom: 4.5rem;
    width: 100%;
    clear: both;
    display: block;
}

.roster-section:last-child {
    margin-bottom: 2rem;
}

.roster-section h2 {
    color: #2563eb;
    text-align: center;
    margin-bottom: 2.25rem;
    font-size: 1.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 5px;
    text-shadow:
        0 0 12px rgba(37, 99, 235, 0.6),
        0 0 28px rgba(96, 165, 250, 0.2);
    position: relative;
    padding-bottom: 1rem;
    border-bottom: none;
}

.roster-section h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, #2563eb, transparent);
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

/* =============================================
   ROSTER GRID
   ============================================= */
.roster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 240px));
    justify-content: center;
    gap: 1.75rem;
    width: 100%;
    margin-bottom: 2rem;
}

.roster-section .roster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 240px));
    justify-content: center;
    gap: 1.75rem;
    width: 100%;
    margin-bottom: 0;
}

/* =============================================
   MEMBER CARD
   ============================================= */
.member-card {
    background: linear-gradient(
        145deg,
        rgba(0, 5, 20, 0.92) 0%,
        rgba(0, 3, 15, 0.95) 100%
    ) !important;
    border-radius: 18px;
    overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                box-shadow 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                border-color 0.35s ease;
    border: 1px solid rgba(37, 99, 235, 0.18);
    box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(37, 99, 235, 0.05) inset;
    position: relative;
    width: 100%;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

.member-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(96, 165, 250, 0.55);
    box-shadow:
        0 8px 40px rgba(0, 0, 0, 0.6),
        0 0 28px rgba(37, 99, 235, 0.35),
        0 0 60px rgba(96, 165, 250, 0.12),
        0 0 0 1px rgba(96, 165, 250, 0.15) inset;
}

/* Shimmer sweep on hover */
.member-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(37, 99, 235, 0.08) 50%,
        transparent 100%
    );
    transition: left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 1;
    pointer-events: none;
}

.member-card:hover::before {
    left: 100%;
}

/* Top edge accent line */
.member-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.6), transparent);
    opacity: 0;
    transition: opacity 0.35s ease;
    z-index: 2;
    pointer-events: none;
}

.member-card:hover::after {
    opacity: 1;
}

/* =============================================
   MEMBER IMAGE
   ============================================= */
.member-image {
    height: 220px;
    background-size: cover;
    background-position: center;
    background-color: #00081a;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #444;
    font-size: 0.9rem;
    position: relative;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Subtle gradient overlay at the bottom of the image */
.member-image::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60%;
    background: linear-gradient(
        to top,
        rgba(0, 10, 14, 0.85) 0%,
        rgba(0, 10, 14, 0.4) 50%,
        transparent 100%
    );
    z-index: 1;
    pointer-events: none;
}

/* Zoom the background image on card hover */
.member-card:hover .member-image {
    transform: scale(1.04);
}

.member-image::after {
    content: 'Foto in arrivo...';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.45;
    font-size: 0.8rem;
    letter-spacing: 1px;
    z-index: 2;
    color: rgba(37, 99, 235, 0.6);
}

.member-image[style*="background-image"]::after {
    display: none;
}

/* =============================================
   MEMBER INFO
   ============================================= */
.member-info {
    padding: 1.4rem 1.5rem 1.5rem;
    position: relative;
    z-index: 2;
}

.member-info h3 {
    color: #ffffff;
    margin-bottom: 0.35rem;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1.2;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.member-info .role {
    color: var(--primary-color, #2563eb);
    font-weight: 700;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-size: 0.72rem;
    text-shadow: 0 0 8px rgba(37, 99, 235, 0.5);
}

.member-info .game {
    color: rgba(255, 255, 255, 0.52);
    margin-bottom: 1rem;
    font-size: 0.8rem;
    letter-spacing: 0.3px;
}

/* =============================================
   SOCIAL LINKS
   ============================================= */
.member-info .social-links {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
}

.member-info .social-links a {
    color: rgba(255, 255, 255, 0.55);
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    padding: 0.45rem;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.08);
    border: 1px solid rgba(37, 99, 235, 0.15);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
}

.member-info .social-links a:hover {
    transform: translateY(-3px);
    color: #60a5fa;
    background: rgba(37, 99, 235, 0.2);
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow:
        0 6px 20px rgba(37, 99, 235, 0.3),
        0 0 12px rgba(96, 165, 250, 0.2);
}

/* Platform-specific hover colors */
.member-info .social-links a.twitter:hover,
.member-info .social-links a[href*="x.com"]:hover {
    color: #000000 !important;
    background: rgba(0, 0, 0, 0.2);
}

.member-info .social-links a.instagram:hover,
.member-info .social-links a[href*="instagram.com"]:hover {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
}

.member-info .social-links a.instagram:hover i,
.member-info .social-links a[href*="instagram.com"]:hover i {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.member-info .social-links a.twitch:hover,
.member-info .social-links a[href*="twitch.tv"]:hover {
    color: #9146ff !important;
    background: rgba(145, 70, 255, 0.12);
    border-color: rgba(145, 70, 255, 0.4);
    box-shadow: 0 6px 20px rgba(145, 70, 255, 0.25);
}

.member-info .social-links a.youtube:hover,
.member-info .social-links a[href*="youtube.com"]:hover {
    color: #ff0000 !important;
    background: rgba(255, 0, 0, 0.12);
    border-color: rgba(255, 0, 0, 0.35);
    box-shadow: 0 6px 20px rgba(255, 0, 0, 0.2);
}

/* No-social placeholder */
.no-social {
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
    font-size: 0.78rem;
    letter-spacing: 0.3px;
}

/* =============================================
   STAT CHIPS (PR / EARNINGS)
   ============================================= */
.member-stats {
    display: flex;
    gap: 0.4rem;
    margin-bottom: 0.85rem;
    flex-wrap: wrap;
    align-items: center;
}

.stat-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.28rem 0.7rem;
    border-radius: 20px;
    font-weight: 700;
    white-space: nowrap;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.stat-chip--pr {
    background: rgba(37, 99, 235, 0.15);
    border: 1px solid rgba(96, 165, 250, 0.3);
    box-shadow: 0 2px 10px rgba(37, 99, 235, 0.12);
}

.stat-chip--pr:hover {
    box-shadow: 0 3px 16px rgba(37, 99, 235, 0.3);
    transform: translateY(-1px);
}

.stat-chip--earn {
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.4);
    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.1);
}

.stat-chip--earn:hover {
    box-shadow: 0 3px 16px rgba(245, 158, 11, 0.28);
    transform: translateY(-1px);
}

.chip-val {
    font-size: 0.82rem;
    color: #fff;
    font-weight: 700;
}

.stat-chip--earn .chip-val {
    color: #f59e0b;
}

.chip-lbl {
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: rgba(37, 99, 235, 0.7);
    font-weight: 700;
}

/* =============================================
   STATS LAST UPDATE BANNER
   ============================================= */
.stats-last-update {
    text-align: center;
    margin: 2rem 0;
    padding: 1rem 1.5rem;
    background: rgba(37, 99, 235, 0.07);
    border-radius: 12px;
    border: 1px solid rgba(37, 99, 235, 0.25);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

.update-info {
    color: rgba(255, 255, 255, 0.92);
    font-size: 0.9rem;
    letter-spacing: 0.02em;
}

.update-info i {
    color: #2563eb;
    margin-right: 0.5rem;
}

.update-info strong {
    color: #2563eb;
}

.update-info small {
    display: block;
    margin-top: 0.5rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.78rem;
}

/* =============================================
   PLAYER STATS PANEL
   ============================================= */
.player-stats {
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(37, 99, 235, 0.06);
    border-radius: 10px;
    border: 1px solid rgba(37, 99, 235, 0.18);
    animation: stats-appear 0.5s ease-out;
    transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
}

.player-stats.stats-error {
    background: rgba(244, 67, 54, 0.06);
    border-color: rgba(244, 67, 54, 0.2);
}

@keyframes stats-appear {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.member-card:hover .player-stats {
    background: rgba(37, 99, 235, 0.11);
    border-color: rgba(37, 99, 235, 0.38);
    transition: all 0.3s ease;
}

/* =============================================
   STATS HEADER
   ============================================= */
.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(37, 99, 235, 0.18);
}

.stats-title {
    font-size: 0.88rem;
    font-weight: 600;
    color: #2563eb;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.stats-update {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.5);
}

/* =============================================
   PR & EARNINGS STAT BOXES
   ============================================= */
.pr-earnings-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0.75rem 0.5rem;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.pr-box {
    border-color: rgba(255, 193, 7, 0.28);
    background: rgba(255, 193, 7, 0.04);
}

.earnings-box {
    border-color: rgba(76, 175, 80, 0.28);
    background: rgba(76, 175, 80, 0.04);
}

.stat-box .stat-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 0.3rem;
}

.stat-box .stat-value {
    font-size: 1.05rem;
    font-weight: 700;
    color: #2563eb;
    text-shadow: 0 0 6px rgba(37, 99, 235, 0.35);
}

.pr-box .stat-value {
    color: #ffc107;
    text-shadow: 0 0 6px rgba(255, 193, 7, 0.35);
}

.earnings-box .stat-value {
    color: #4caf50;
    text-shadow: 0 0 6px rgba(76, 175, 80, 0.35);
}

/* =============================================
   TOURNAMENTS SECTION
   ============================================= */
.tournaments-section {
    margin-top: 1rem;
}

.tournaments-title {
    font-size: 0.8rem;
    color: #2563eb;
    margin-bottom: 0.5rem;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1.2px;
}

.tournaments-list {
    max-height: 150px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(37, 99, 235, 0.3) transparent;
}

.tournaments-list::-webkit-scrollbar {
    width: 4px;
}

.tournaments-list::-webkit-scrollbar-thumb {
    background: rgba(37, 99, 235, 0.3);
    border-radius: 2px;
}

.tournament-item {
    padding: 0.55rem 0.6rem;
    margin-bottom: 0.45rem;
    background: rgba(0, 0, 0, 0.22);
    border-radius: 5px;
    border-left: 3px solid rgba(37, 99, 235, 0.5);
    transition: border-color 0.25s ease, background 0.25s ease;
}

.tournament-item:hover {
    background: rgba(37, 99, 235, 0.07);
    border-left-color: rgba(96, 165, 250, 0.8);
}

.tournament-item:last-child {
    margin-bottom: 0;
}

.tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.3rem;
}

.tournament-name {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
}

.tournament-placement {
    font-size: 0.78rem;
    font-weight: 700;
    color: #2563eb;
    text-shadow: 0 0 5px rgba(37, 99, 235, 0.35);
}

.tournament-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
}

.tournament-kills,
.tournament-points {
    color: rgba(255, 255, 255, 0.6);
}

.no-tournaments {
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.78rem;
    padding: 1rem;
    font-style: italic;
}

/* =============================================
   STATS ERROR STATE
   ============================================= */
.stats-error-message {
    text-align: center;
    padding: 1rem;
    color: rgba(255, 255, 255, 0.65);
}

.stats-error-message p {
    color: #f44336;
    margin-bottom: 0.5rem;
}

/* =============================================
   STATS GRID (legacy compatibility)
   ============================================= */
.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.stat-label {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 0.2rem;
}

.stat-value {
    font-size: 1rem;
    font-weight: 700;
    color: #2563eb;
    text-shadow: 0 0 6px rgba(37, 99, 235, 0.35);
}

/* =============================================
   STATS FOOTER
   ============================================= */
.stats-footer {
    margin-top: 0.8rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    text-align: center;
}

.stats-footer small {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.68rem;
}

/* =============================================
   LOADING STATE
   ============================================= */
.stats-loading {
    margin: 1rem 0;
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.88rem;
    animation: loading-pulse 2s infinite;
}

@keyframes loading-pulse {
    0%, 100% { opacity: 0.45; }
    50% { opacity: 1; }
}

/* =============================================
   STATS STATUS INDICATORS
   ============================================= */
.stats-success {
    color: #4CAF50;
}

.stats-error {
    color: #F44336;
}


/* =============================================
   STAFF GRID OVERRIDES
   ============================================= */
#staff-grid .roster-section {
    width: 100%;
    margin-bottom: 3.5rem;
}

#staff-grid .roster-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 220px));
    justify-content: center;
    gap: 1.5rem;
}

#staff-grid .member-card {
    width: 100%;
}

/* =============================================
   RESPONSIVE — TABLET (≤ 768px)
   ============================================= */
@media (max-width: 768px) {
    .roster-page {
        padding: 2.5rem 1.5rem;
        margin: 1rem;
        border-radius: 18px;
    }

    .member-card {
        width: 100%;
    }

    .member-image {
        height: 200px;
    }

    .roster-section h2 {
        font-size: 1.5rem;
        letter-spacing: 3px;
    }

    .roster-grid,
    .roster-section .roster-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 200px));
        gap: 1.25rem;
    }
}

/* =============================================
   RESPONSIVE — MOBILE (≤ 480px)
   ============================================= */
@media (max-width: 480px) {
    .roster-page {
        padding: 1.5rem 1rem;
        margin: 0.75rem;
        border-radius: 14px;
    }

    .roster-page h1 {
        font-size: 1.6rem;
        letter-spacing: 2px;
    }

    .roster-section h2 {
        font-size: 1.2rem;
        letter-spacing: 2.5px;
    }

    .member-card {
        width: 100%;
    }

    .member-image {
        height: 165px;
    }

    .roster-grid,
    .roster-section .roster-grid {
        gap: 0.9rem;
    }

    .member-info {
        padding: 1rem 1rem 1.1rem;
    }

    .member-info h3 {
        font-size: 0.95rem;
    }

    .stats-grid {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
    }

    .stat-value {
        font-size: 0.9rem;
    }

    .stat-label {
        font-size: 0.65rem;
    }

    .stats-header {
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
    }

    .stat-chip {
        padding: 0.3rem 0.7rem;
    }

    .chip-val {
        font-size: 0.8rem;
    }
}
