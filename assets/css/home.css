/* ============================================================
   CLARVS ESPORTS — home.css  (Premium Redesign)
   Color palette: #2563eb / #1d4ed8 / #1e3a8a / #60a5fa
   All existing class names preserved. CSS variables from main.css used.
   ============================================================ */

/* ---- Base reset for the page -------------------------------- */
body, html {
    background: #000 !important;
    min-height: 100vh;
    width: 100vw;
    overflow-x: hidden;
}

/* ---- Particle canvas ---------------------------------------- */
#particles-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
    will-change: transform;
    transform: translate3d(0, 0, 0);
}

/* ---- Page wrapper ------------------------------------------- */
.home-page {
    min-height: 100vh;
    position: relative;
    z-index: 1;
    padding-top: 80px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

/* ============================================================
   SECTION SEPARATORS — subtle gradient dividers
   ============================================================ */
section {
    margin-bottom: 5rem;
    padding: 3rem 0;
    position: relative;
}

section + section::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    height: 1px;
    background: linear-gradient(
        90deg,
        transparent 0%,
        var(--glass-border, rgba(37, 99, 235, 0.2)) 30%,
        var(--primary-color, #2563eb) 50%,
        var(--glass-border, rgba(37, 99, 235, 0.2)) 70%,
        transparent 100%
    );
}

/* ============================================================
   SECTION TITLES — h2.section-title + generic section h2
   ============================================================ */
section h2,
.section-title {
    color: var(--glow-blue, #60a5fa);
    margin-bottom: 3.5rem;
    text-align: center;
    font-size: clamp(1.6rem, 4vw, 2.6rem);
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    position: relative;
    text-shadow:
        0 0 12px rgba(96, 165, 250, 0.7),
        0 0 30px rgba(96, 165, 250, 0.3);
}

/* Decorative underline accent bar */
section h2::after,
.section-title::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(
        90deg,
        transparent,
        var(--primary-color, #2563eb),
        var(--glow-blue, #60a5fa),
        var(--primary-color, #2563eb),
        transparent
    );
    box-shadow: 0 0 10px rgba(96, 165, 250, 0.6);
}

/* ============================================================
   HERO SECTION
   ============================================================ */
.hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
}

.particles-bg {
    background: transparent;
}

.hero-content {
    max-width: 920px;
    padding: 2rem;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.2rem;
    transform: translate3d(0, 0, 0);
    will-change: transform, opacity;
}

/* --- Hero title with flicker glow ---------------------------- */
@keyframes title-glow-flicker {
    0%,  100% { text-shadow: 0 0 20px rgba(96, 165, 250, 0.9), 0 0 50px rgba(37, 99, 235, 0.5), 0 0 80px rgba(37, 99, 235, 0.2); }
    25%         { text-shadow: 0 0 15px rgba(96, 165, 250, 0.6), 0 0 35px rgba(37, 99, 235, 0.3); }
    50%         { text-shadow: 0 0 25px rgba(96, 165, 250, 1),   0 0 60px rgba(37, 99, 235, 0.7), 0 0 100px rgba(37, 99, 235, 0.3); }
    75%         { text-shadow: 0 0 18px rgba(96, 165, 250, 0.7), 0 0 40px rgba(37, 99, 235, 0.4); }
}

.hero-title {
    font-size: clamp(3.2rem, 9vw, 7rem);
    font-weight: 900;
    margin: 0;
    background: linear-gradient(135deg, var(--glow-blue, #60a5fa) 0%, var(--primary-color, #2563eb) 50%, var(--secondary-color, #1d4ed8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.12em;
    line-height: 1.05;
    transform: translate3d(0, 0, 0);
    will-change: transform;
    animation: title-glow-flicker 4s ease-in-out infinite;
    /* Glow applied via filter since text-fill hides text-shadow */
    filter: drop-shadow(0 0 18px rgba(96, 165, 250, 0.6));
}

/* Generic hero h1 fallback */
.hero h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin-bottom: 1rem;
    color: white;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero p {
    font-size: clamp(1rem, 3vw, 1.5rem);
    margin-bottom: 2rem;
    opacity: 0.9;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* --- Hero subtitle ------------------------------------------- */
.hero-subtitle {
    font-size: clamp(1rem, 2vw, 1.35rem);
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.88);
    font-weight: 300;
    letter-spacing: 0.04em;
    line-height: 1.6;
    max-width: 640px;
    text-align: center;
}

/* --- Hero tagline/quote -------------------------------------- */
.hero-text {
    text-align: center;
    font-style: italic;
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    opacity: 0.85;
    color: var(--primary-color, #2563eb);
    letter-spacing: 0.03em;
    text-shadow: 0 0 12px rgba(37, 99, 235, 0.4);
}

/* --- Hero buttons -------------------------------------------- */
.hero-buttons {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

/* ============================================================
   CTA BUTTONS — pill shape, gradient border, shimmer ::after
   ============================================================ */

/* Shimmer keyframe */
@keyframes btn-shimmer {
    0%   { left: -120%; }
    60%  { left: 120%; }
    100% { left: 120%; }
}

.cta-button {
    display: inline-block;
    padding: 0.95rem 2.2rem;
    background: linear-gradient(135deg, var(--primary-color, #2563eb), var(--secondary-color, #1d4ed8));
    color: #fff;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 18px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.15);
}

/* Sweep shimmer */
.cta-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: -120%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.28),
        transparent
    );
    transform: skewX(-20deg);
    animation: btn-shimmer 3.5s ease infinite;
}

/* Sweep overlay on hover (instant) */
.cta-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
    transition: left 0.45s ease;
}

.cta-button:hover::before {
    left: 100%;
}

.cta-button:hover {
    transform: translateY(-4px);
    box-shadow:
        0 8px 28px rgba(37, 99, 235, 0.55),
        0 0 0 2px rgba(96, 165, 250, 0.35),
        inset 0 1px 0 rgba(255,255,255,0.2);
    background: linear-gradient(135deg, var(--glow-blue, #60a5fa), var(--primary-color, #2563eb));
}

/* Transparent / outline variant */
.cta-button.transparent,
.cta-button.secondary {
    background: transparent;
    border: 2px solid var(--primary-color, #2563eb);
    color: var(--primary-color, #2563eb);
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
    /* Gradient border trick via box-shadow instead of border-image (pill-safe) */
}

.cta-button.transparent:hover,
.cta-button.secondary:hover {
    background: var(--primary-color, #2563eb);
    color: #000;
    box-shadow: 0 8px 28px rgba(37, 99, 235, 0.5), 0 0 0 2px rgba(96, 165, 250, 0.4);
    transform: translateY(-4px);
}

/* ============================================================
   ROSTER PREVIEW SECTION
   ============================================================ */
.roster-preview,
.team-preview {
    padding: 5rem 0;
    margin: 0;
    max-width: 100%;
    position: relative;
    overflow: visible;
}

/* Subtle ambient glow */
.roster-preview::before,
.team-preview::before {
    content: '';
    position: absolute;
    top: -100px;
    right: 5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.07) 0%, transparent 70%);
    pointer-events: none;
}

.roster-preview h2,
.team-preview h2 {
    text-align: center;
    color: var(--glow-blue, #60a5fa);
    font-size: 2.6rem;
    margin-bottom: 3.5rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-weight: 800;
    text-shadow:
        0 0 14px rgba(96, 165, 250, 0.7),
        0 0 40px rgba(96, 165, 250, 0.3);
    position: relative;
}

.roster-preview h2::after,
.team-preview h2::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, transparent, var(--primary-color, #2563eb), var(--glow-blue, #60a5fa), var(--primary-color, #2563eb), transparent);
    box-shadow: 0 0 10px rgba(96, 165, 250, 0.6);
}

/* ---- Slider wrapper ----------------------------------------- */
.roster-slider-wrapper {
    position: relative;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 80px;
}

.slider-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(37, 99, 235, 0.1);
    border: 2px solid var(--primary-color, #2563eb);
    color: var(--primary-color, #2563eb);
    width: 52px;
    height: 52px;
    border-radius: 50%;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    backdrop-filter: blur(6px);
    box-shadow: 0 0 15px rgba(37, 99, 235, 0.15);
}

.slider-btn.prev { left: 10px; }
.slider-btn.next { right: 10px; }

.slider-btn:hover {
    background: var(--primary-color, #2563eb);
    color: #000;
    transform: translateY(-50%) scale(1.12);
    box-shadow: 0 0 22px rgba(37, 99, 235, 0.5);
}

.roster-slider {
    width: 100%;
    overflow-x: hidden;
    overflow-y: visible;
    border-radius: 18px;
    padding-top: 14px;
    margin-top: -14px;
}

.roster-container {
    display: flex;
    gap: 2rem;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    align-items: center;
    min-height: 320px;
}

/* ---- Roster cards — glass morphism premium ------------------- */
.roster-card {
    flex: 0 0 280px;
    height: auto;
    min-height: 340px;
    background: rgba(0, 0, 0, 0.65);
    border-radius: 18px;
    border: 1px solid rgba(37, 99, 235, 0.18);
    overflow: hidden;
    transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
    position: relative;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

/* Subtle inner top highlight */
.roster-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.3), transparent);
    pointer-events: none;
}

.roster-card:hover {
    transform: translateY(-12px);
    border-color: var(--primary-color, #2563eb);
    box-shadow:
        0 0 0 1px rgba(96, 165, 250, 0.2),
        0 24px 50px rgba(37, 99, 235, 0.35),
        0 8px 20px rgba(0, 0, 0, 0.6);
}

.card-content {
    padding: 2rem;
    text-align: center;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* ---- Player avatar/initial — glowing ring on hover ---------- */
.player-initial {
    width: 82px;
    height: 82px;
    background: linear-gradient(135deg, var(--primary-color, #2563eb), var(--secondary-color, #1d4ed8));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    margin: 0 auto 1.5rem;
    box-shadow: 0 0 22px rgba(37, 99, 235, 0.5);
    transition: box-shadow 0.35s ease, transform 0.35s ease;
    border: 2px solid rgba(96, 165, 250, 0.3);
    position: relative;
}

.slider-arrow {
    display: none;
}

.player-avatar {
    width: 82px;
    height: 82px;
    border-radius: 50%;
    background-size: cover;
    background-position: center center;
    background-color: #00081a;
    margin: 0 auto 1.5rem;
    box-shadow: 0 0 22px rgba(37, 99, 235, 0.5);
    border: 2px solid rgba(37, 99, 235, 0.35);
    transition: box-shadow 0.35s ease, transform 0.35s ease;
    position: relative;
}

.roster-card:hover .player-initial,
.roster-card:hover .player-avatar {
    transform: scale(1.06);
    box-shadow:
        0 0 0 4px rgba(37, 99, 235, 0.25),
        0 0 30px rgba(96, 165, 250, 0.6),
        0 0 60px rgba(37, 99, 235, 0.3);
    border-color: var(--glow-blue, #60a5fa);
}

.roster-card h3 {
    color: #fff;
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
    letter-spacing: 0.04em;
}

.player-role {
    color: var(--primary-color, #2563eb);
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-bottom: 1.5rem;
    opacity: 0.9;
}

/* ---- Social icons inside cards ------------------------------ */
.social-icons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.social-icons i,
.social-icons a {
    color: rgba(255, 255, 255, 0.55);
    font-size: 1.2rem;
    transition: all 0.3s ease;
    cursor: pointer;
    text-decoration: none;
}

.social-icons a i {
    color: inherit;
}

.social-icons .fa-twitter:hover,
.social-icons a[href*="x.com"]:hover,
.social-icons a[href*="x.com"]:hover i {
    color: #000000 !important;
}

.social-icons .fa-instagram:hover,
.social-icons a[href*="instagram.com"]:hover i {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #ff0000 !important;
}

/* ---- Slider dots -------------------------------------------- */
.slider-dots {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    margin-top: 2.2rem;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.25);
    cursor: pointer;
    transition: all 0.35s ease;
    border: 1px solid rgba(37, 99, 235, 0.2);
}

.dot.active {
    background: var(--primary-color, #2563eb);
    transform: scale(1.3);
    box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
}

/* ============================================================
   RESULTS TICKER
   ============================================================ */
.results-ticker {
    padding: 2rem 0;
    overflow: hidden;
}

.ticker-header {
    text-align: center;
    margin-bottom: 1.4rem;
}

.ticker-header h2 {
    font-size: 1.4rem;
    color: var(--primary-color, #2563eb);
    text-shadow: 0 0 12px rgba(37, 99, 235, 0.55);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 700;
}

.ticker-wrapper {
    overflow: hidden;
    border-top: 1px solid rgba(37, 99, 235, 0.25);
    border-bottom: 1px solid rgba(37, 99, 235, 0.25);
    border-left: 4px solid var(--primary-color, #2563eb);
    background: rgba(0, 5, 26, 0.85);
    padding: 0.55rem 0;
    position: relative;
    box-shadow:
        inset 0 1px 0 rgba(96, 165, 250, 0.05),
        inset 0 -1px 0 rgba(96, 165, 250, 0.05),
        4px 0 18px rgba(37, 99, 235, 0.12);
}

/* Fade-edge masks */
.ticker-wrapper::before,
.ticker-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 80px;
    z-index: 2;
    pointer-events: none;
}

.ticker-wrapper::before {
    left: 0;
    background: linear-gradient(90deg, rgba(0, 5, 26, 0.95) 0%, transparent 100%);
}

.ticker-wrapper::after {
    right: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(0, 5, 26, 0.95) 100%);
}

.ticker-track {
    display: flex;
    gap: 0;
    white-space: nowrap;
    width: max-content;
    will-change: transform;
}

.ticker-track {
    pointer-events: none;
}

.ticker-item {
    pointer-events: none;
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.5rem 2.2rem;
    border-right: 1px solid rgba(37, 99, 235, 0.12);
    font-size: 0.88rem;
    transition: background 0.25s;
    white-space: nowrap;
}



.ticker-player {
    color: var(--primary-color, #2563eb);
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.ticker-separator {
    color: rgba(255, 255, 255, 0.18);
    font-size: 0.7rem;
}

.ticker-tournament {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
}

.ticker-arrow {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.82rem;
}

.ticker-placement {
    color: #f59e0b;
    font-weight: 800;
    font-size: 0.88rem;
}

/* ============================================================
   NEWS SECTION
   ============================================================ */
.news-section {
    background: rgba(0,0,0,0.3) !important;
    border-radius: 24px;
    padding: 4rem 0;
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.news-card {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 18px;
    overflow: hidden;
    transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
    border: 1px solid rgba(37, 99, 235, 0.12);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

.news-card:hover {
    transform: translateY(-10px);
    box-shadow:
        0 0 0 1px rgba(96, 165, 250, 0.2),
        0 20px 50px rgba(37, 99, 235, 0.25),
        0 8px 20px rgba(0, 0, 0, 0.5);
    border-color: rgba(37, 99, 235, 0.35);
}

/* Image with bottom-to-top gradient overlay */
.news-image {
    height: 200px;
    background-size: cover;
    background-position: center;
    background-color: #00081a;
    position: relative;
    overflow: hidden;
}

.news-image::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.05) 0%,
        rgba(37, 99, 235, 0.08) 60%,
        rgba(0, 0, 0, 0.7) 100%
    );
    transition: opacity 0.35s ease;
}

.news-card:hover .news-image::after {
    opacity: 0.7;
}

.news-content {
    padding: 1.6rem;
    font-family: 'Roboto', sans-serif;
}

.news-content h3 {
    color: #fff;
    margin-bottom: 0.5rem;
    font-size: 1.3rem;
    font-weight: 700;
    text-align: center;
    line-height: 1.3;
}

.news-date {
    color: var(--primary-color, #2563eb);
    font-size: 0.82rem;
    margin-bottom: 0.9rem;
    font-weight: 600;
    text-align: center;
    letter-spacing: 0.06em;
    opacity: 0.85;
}

.news-excerpt {
    color: rgba(255, 255, 255, 0.75);
    margin-bottom: 1.5rem;
    line-height: 1.65;
    font-size: 0.95rem;
}

.read-more {
    color: var(--primary-color, #2563eb);
    text-decoration: none;
    font-weight: 700;
    transition: color 0.3s ease, letter-spacing 0.3s ease;
    text-transform: uppercase;
    font-size: 0.82rem;
    letter-spacing: 0.1em;
}

.read-more:hover {
    color: var(--glow-blue, #60a5fa);
    letter-spacing: 0.18em;
    text-decoration: none;
}

/* ============================================================
   EVENTS SECTION
   ============================================================ */
.upcoming-events {
    background: rgba(0,0,0,0.3) !important;
    border-radius: 24px;
    padding: 4rem 0;
}

.events-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.8rem;
}

.event-card {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 16px;
    padding: 2rem 2rem 2rem 2.5rem;
    text-align: left;
    transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
    border: 1px solid rgba(37, 99, 235, 0.14);
    border-left: 4px solid var(--primary-color, #2563eb);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* Animated shimmer sweep */
.event-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.06), transparent);
    transition: left 0.55s ease;
    pointer-events: none;
}

.event-card:hover::before {
    left: 100%;
}

.event-card:hover {
    transform: translateY(-7px);
    border-left-color: var(--glow-blue, #60a5fa);
    box-shadow:
        0 0 0 1px rgba(37, 99, 235, 0.15),
        0 20px 45px rgba(37, 99, 235, 0.2),
        -4px 0 18px rgba(37, 99, 235, 0.15);
    border-color: rgba(37, 99, 235, 0.25);
}

.event-type {
    background: linear-gradient(135deg, var(--primary-color, #2563eb), var(--secondary-color, #1d4ed8));
    color: #fff;
    padding: 0.35rem 0.9rem;
    border-radius: 20px;
    font-weight: 700;
    margin-bottom: 0.9rem;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(37, 99, 235, 0.3);
}

.event-title {
    color: #fff;
    margin-bottom: 0.9rem;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1.3;
}

.event-details {
    display: flex;
    justify-content: flex-start;
    gap: 1.2rem;
    margin-bottom: 0.9rem;
    flex-wrap: wrap;
}

.event-date, .event-time {
    color: var(--primary-color, #2563eb);
    font-size: 0.88rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 600;
}

.event-description {
    color: rgba(255, 255, 255, 0.75);
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    line-height: 1.6;
}

.event-button {
    background: transparent;
    color: var(--primary-color, #2563eb);
    border: 2px solid var(--primary-color, #2563eb);
    padding: 0.7rem 1.8rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 700;
    transition: all 0.3s ease;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.82rem;
    display: inline-block;
}

.event-button:hover {
    background: var(--primary-color, #2563eb);
    color: #000;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.event-image {
    width: 100%;
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
}

.event-image img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 10px;
    object-fit: contain;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

/* ============================================================
   SOCIAL FEED
   ============================================================ */
.social-feed {
    background: rgba(0,0,0,0.55) !important;
    padding: 3.5rem;
    border-radius: 24px;
    border: 1px solid rgba(37, 99, 235, 0.12);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}

/* --- Tab buttons -------------------------------------------- */
.social-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 2.5rem;
    gap: 0.75rem;
    border-bottom: 1px solid rgba(37, 99, 235, 0.18);
    padding-bottom: 1.2rem;
}

.social-tab {
    padding: 0.65rem 1.6rem;
    border: 1px solid rgba(37, 99, 235, 0.2);
    background: rgba(37, 99, 235, 0.04);
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.88rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: all 0.3s ease;
    border-radius: 50px;
}

.social-tab:hover {
    background: rgba(37, 99, 235, 0.12);
    color: var(--primary-color, #2563eb);
    border-color: rgba(37, 99, 235, 0.4);
}

.social-tab.active {
    color: #000;
    background: var(--primary-color, #2563eb);
    border-color: var(--primary-color, #2563eb);
    box-shadow:
        0 4px 18px rgba(37, 99, 235, 0.4),
        0 0 0 2px rgba(96, 165, 250, 0.15);
}

/* --- Posts grid --------------------------------------------- */
.social-posts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    align-items: start;
}

.social-post {
    background: rgba(0, 0, 0, 0.45);
    border-radius: 14px;
    overflow: hidden;
    transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
    border: 1px solid rgba(37, 99, 235, 0.1);
    backdrop-filter: blur(10px);
}

.social-post:hover {
    transform: translateY(-7px);
    box-shadow: 0 14px 36px rgba(37, 99, 235, 0.2);
    border-color: rgba(37, 99, 235, 0.3);
}

.post-image {
    height: 200px;
    background-size: cover;
    background-position: center;
    background-color: #00081a;
}

.post-content {
    padding: 1.1rem 1.2rem;
}

.post-content p {
    color: rgba(255, 255, 255, 0.88);
    margin-bottom: 0.9rem;
    line-height: 1.55;
    font-size: 0.93rem;
}

.post-stats {
    display: flex;
    gap: 1rem;
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.85rem;
}

.post-stats span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.post-stats i {
    color: var(--primary-color, #2563eb);
}

/* ============================================================
   LOADING / EMPTY STATES
   ============================================================ */
.loading, .no-posts {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    padding: 2.5rem;
    font-style: italic;
    font-size: 0.95rem;
}

/* ============================================================
   INSTAGRAM / TWITTER EMBEDS
   ============================================================ */
.instagram-embed, .twitter-embed {
    max-width: 100%;
    margin: 0;
    padding: 0;
}


/* ============================================================
   HOME STAT CHIPS
   ============================================================ */
.home-stat-chips {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 0.6rem;
    margin-bottom: 0.8rem;
}

.home-stat-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(37, 99, 235, 0.15);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 20px;
    padding: 0.22rem 0.65rem;
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.04em;
}

.home-stat-chip .chip-val {
    color: #ffffff;
}

.home-stat-chip .chip-lbl {
    color: #60a5fa;
    font-size: 0.66rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.home-stat-chip.chip-earn .chip-val {
    color: #f59e0b;
}

/* ============================================================
   SCROLL REVEAL ANIMATION
   ============================================================ */
.reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.75s cubic-bezier(0.77, 0, 0.18, 1), transform 0.75s cubic-bezier(0.77, 0, 0.18, 1);
    will-change: opacity, transform;
}

.reveal.visible {
    opacity: 1;
    transform: translateY(0);
}

/* ============================================================
   FOOTER
   ============================================================ */

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
}



.footer-container p {
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    font-size: 0.88rem;
    letter-spacing: 0.05em;
}




/* ============================================================
   RESPONSIVE -- 768px
   ============================================================ */
@media (max-width: 768px) {
    .hero {
        height: 60vh;
        min-height: 400px;
    }

    .hero-content {
        padding: 1rem;
        gap: 1.5rem;
    }

    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }

    .cta-button {
        width: 100%;
        max-width: 260px;
        text-align: center;
    }

    section {
        margin-bottom: 3.5rem;
        padding: 1.5rem 0;
    }

    .social-feed {
        padding: 2rem 1.2rem;
    }

    .upcoming-events, .news-section {
        padding: 2.5rem 0;
    }

    .social-tabs {
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
    }

    .social-tab {
        padding: 0.5rem 1.1rem;
        font-size: 0.82rem;
    }

    .event-card, .news-card {
        margin: 0 0.5rem;
    }

    .event-card {
        text-align: center;
        padding-left: 1.5rem;
        border-left-width: 3px;
    }

    .event-details {
        justify-content: center;
    }

    .social-posts {
        grid-template-columns: 1fr;
    }

    .roster-slider-wrapper {
        padding: 0 60px;
    }

    .slider-btn {
        width: 44px;
        height: 44px;
        font-size: 1.2rem;
    }

    .slider-btn.prev { left: 5px; }
    .slider-btn.next { right: 5px; }

    .roster-card {
        flex: 0 0 250px;
    }
}
/* ============================================================
   RESPONSIVE — 480px
   ============================================================ */
@media (max-width: 480px) {
    .news-grid, .social-posts, .events-list {
        grid-template-columns: 1fr;
    }

    .container {
        padding: 0 0.75rem;
    }

    .roster-slider-wrapper {
        padding: 0 50px;
    }

    .roster-card {
        flex: 0 0 220px;
        height: 280px;
    }

    .player-initial,
    .player-avatar {
        width: 64px;
        height: 64px;
        font-size: 1.5rem;
    }

    .slider-btn {
        width: 40px;
        height: 40px;
        font-size: 1.1rem;
    }

    .slider-btn.prev { left: 2px; }
    .slider-btn.next { right: 2px; }

    .roster-preview {
        margin: 1rem;
        padding: 2.5rem 0;
    }

    .social-feed {
        padding: 2rem 0.8rem;
        border-radius: 14px;
    }

    .hero-title {
        font-size: clamp(2.4rem, 10vw, 4rem);
        letter-spacing: 0.08em;
    }
}
