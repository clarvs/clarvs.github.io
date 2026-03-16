/* ================================================================
   CLARVS — polish.css
   Micro-improvements: spacing, typography, transitions, UX details.
   NO colour changes — palette preserved 100%.
   ================================================================ */

/* ── Global Typography Refinements ── */
p, li, span, td, th, label {
    line-height: 1.7;
}

strong, b {
    font-weight: 700;
}

/* ── Section Heading vertical rhythm ── */
.section-title,
section h2 {
    margin-bottom: 2.8rem;
}

/* ── Reduced motion support (accessibility) ── */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* ── Better Button Focus ── */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 3px;
    border-radius: 4px;
    box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
}

/* ── Image rendering ── */
img {
    image-rendering: -webkit-optimize-contrast;
}

/* ── Nav link — better touch target on mobile ── */
@media (max-width: 768px) {
    .nav-link {
        font-size: 1.1rem;
        padding: 0.85rem 2rem;
        width: 100%;
        justify-content: center;
        border-bottom: 1px solid rgba(37, 99, 235, 0.08);
        border-radius: 0;
    }
    .nav-links li:last-child .nav-link {
        border-bottom: none;
    }
}

/* ── Roster page h1 underline decoration ── */
.roster-page h1 {
    position: relative;
    padding-bottom: 1.2rem;
}

.roster-page h1::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, #2563eb, transparent);
    box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

/* ── Staff page h1 decoration (same class) ── */
.staff-page h1 {
    position: relative;
    padding-bottom: 1.2rem;
}

.staff-page h1::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, #2563eb, transparent);
    box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

/* ── Stagger animation helpers ── */
.stagger-1 { animation-delay: 0.05s !important; }
.stagger-2 { animation-delay: 0.10s !important; }
.stagger-3 { animation-delay: 0.15s !important; }
.stagger-4 { animation-delay: 0.20s !important; }
.stagger-5 { animation-delay: 0.25s !important; }
.stagger-6 { animation-delay: 0.30s !important; }

/* ── Better card image transition ── */
.news-image {
    transition: transform 0.4s ease;
}
.news-card:hover .news-image {
    transform: scale(1.02);
}

/* ── Member card image zoom override (smoother) ── */
.member-card:hover .member-image {
    transform: scale(1.05);
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* ── Ticker label pill ── */
.ticker-header h2 {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
}

.ticker-header h2::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary-color, #2563eb);
    box-shadow: 0 0 8px rgba(37, 99, 235, 0.7);
    animation: blink 1.2s ease-in-out infinite;
}

/* ── Event card — better icon alignment ── */
.event-date i,
.event-time i {
    color: var(--primary-color, #2563eb);
    font-size: 0.82rem;
}

/* ── Footer social links — slightly larger hover zone ── */
.social-links a {
    transition: transform 0.25s ease, background 0.25s ease,
                border-color 0.25s ease, box-shadow 0.25s ease;
}

/* ── Read More arrow ── */
.read-more::after {
    content: '→';
    display: inline-block;
    transition: transform 0.25s ease;
}
.read-more:hover::after {
    transform: translateX(4px);
}

/* ── Better mobile roster card spacing ── */
@media (max-width: 480px) {
    .roster-grid,
    .roster-section .roster-grid {
        justify-content: center;
    }
}

/* ── TV page ── */
.tv-page {
    padding-bottom: 2rem;
}

/* ── Smooth page transitions ── */
main {
    animation: page-fade-in 0.45s ease-out both;
}

@keyframes page-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Slider dots — slightly larger tap target ── */
.dot {
    width: 10px;
    height: 10px;
    cursor: pointer;
    position: relative;
}

.dot::before {
    content: '';
    position: absolute;
    inset: -6px;
}

/* ── Chat input improvements ── */
#chat-input, #username-input {
    caret-color: #60a5fa;
}

/* ── Scrollbar on social posts ── */
.social-posts {
    gap: 1.6rem;
}

/* ── Roster stats chip — slightly larger text ── */
.chip-val {
    font-size: 0.92rem;
}

/* ── No results / empty state style ── */
.no-social,
.no-tournaments,
.loading,
.no-posts {
    font-size: 0.88rem;
}

/* ── Event type badge text refinement ── */
.event-type {
    font-size: 0.73rem;
    letter-spacing: 0.12em;
}

/* ── Player role text refinement ── */
.player-role {
    letter-spacing: 0.15em;
}

/* ================================================================
   SEZIONE 2 — Inner page headers & layout improvements
   ================================================================ */

/* ── Inner page main-container top spacing ── */
.main-container {
    padding-top: 96px;
    margin-top: 0 !important;
}

/* ── Roster/Staff page container visual depth ── */
.roster-page {
    position: relative;
}

/* Subtle ambient glow behind the roster container */
.roster-page::before {
    content: '';
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 1px;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(37, 99, 235, 0.3) 30%,
        rgba(96, 165, 250, 0.5) 50%,
        rgba(37, 99, 235, 0.3) 70%,
        transparent 100%
    );
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
    pointer-events: none;
}

/* ── TV page header ── */
.tv-page h1 {
    position: relative;
}

.tv-page h1::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, #2563eb, transparent);
    box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

/* ── Loading skeleton shimmer for dynamic grids ── */
@keyframes skeleton-pulse {
    0%   { opacity: 0.4; }
    50%  { opacity: 0.7; }
    100% { opacity: 0.4; }
}

.skeleton-card {
    background: rgba(37, 99, 235, 0.04);
    border: 1px solid rgba(37, 99, 235, 0.1);
    border-radius: 18px;
    animation: skeleton-pulse 1.6s ease-in-out infinite;
}

/* ── Section spacing refinements ── */
.news-section .container,
.upcoming-events .container,
.social-feed .container {
    padding: 0 1.5rem;
}

/* ── News card — remove bottom extra margin from excerpt ── */
.news-content {
    display: flex;
    flex-direction: column;
}

/* ── Event card — improve padding symmetry ── */
.event-card {
    gap: 0;
}

/* ── News image — ensure overflow hidden works ── */
.news-card {
    overflow: hidden;
}

/* ── Post image height consistency ── */
.post-image {
    background-size: cover;
    background-position: center top;
}

/* ── Social tab transitions ── */
.social-tab {
    transition: background 0.25s ease, color 0.25s ease,
                border-color 0.25s ease, box-shadow 0.25s ease;
}

/* ── Slider dot hover state ── */
.dot:hover {
    background: rgba(37, 99, 235, 0.5);
    transform: scale(1.15);
}

/* ── Streamer card body font size ── */
.sc-body {
    font-size: 0.9rem;
}

/* ── Platform badge refinements ── */
.platform-badge {
    font-size: 0.72rem;
    letter-spacing: 0.02em;
}

/* ── Live dot animation ── */
.live-dot-sm {
    animation: blink 1.2s ease-in-out infinite;
}

/* ── Admin page section dividers ── */
.admin-section {
    border-radius: 16px;
    overflow: hidden;
}

/* ── Mobile nav active link ── */
@media (max-width: 768px) {
    .nav-link.active {
        color: var(--glow-blue, #60a5fa);
        background: rgba(96, 165, 250, 0.1);
    }
    .nav-link.active::after {
        display: none;
    }
}

/* ── Better roster grid on medium screens ── */
@media (max-width: 900px) and (min-width: 481px) {
    .roster-grid,
    .roster-section .roster-grid {
        gap: 1.4rem;
    }
}

/* ── TV main layout — better gap on small screens ── */
@media (max-width: 1024px) {
    .tv-main-layout {
        gap: 1.5rem;
    }
}

/* ── Chat section height on tablet ── */
@media (max-width: 1024px) {
    .tv-chat-section {
        height: 380px;
    }
}

/* ── Ticker wrapper border refinements ── */
.ticker-wrapper {
    border-radius: 4px 0 0 4px;
}

/* ── Results section heading ── */
.results-ticker .ticker-header {
    margin-bottom: 1.2rem;
}

/* ── Footer — improve social links gap on mobile ── */
@media (max-width: 480px) {
    .social-links {
        gap: 1rem;
    }
    .social-links a {
        width: 40px;
        height: 40px;
    }
}

/* ── Roster page title spacing when h1 has underline ── */
.roster-page h1 {
    margin-bottom: 3rem;
}

/* ── Page fade-in — only on pages with main-container ── */
.main-container {
    animation: page-fade-in 0.4s ease-out both;
}

/* ── Better stat-chip contrast ── */
.stat-chip--pr .chip-lbl,
.stat-chip--earn .chip-lbl {
    opacity: 0.85;
}

/* ── Improved stats panel in roster cards ── */
.pr-earnings-section {
    gap: 0.6rem;
}

/* ── Smooth border-color on all glass cards ── */
.glass-card,
.news-card,
.event-card,
.social-post,
.roster-card,
.member-card,
.streamer-card,
.video-card {
    will-change: transform, box-shadow;
}

/* ── News date icon via CSS (matches JS-generated <time class='news-date'>) ── */
time.news-date::before {
    content: '073';
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    margin-right: 0.3rem;
    font-size: 0.78rem;
    opacity: 0.8;
}

/* ── Ticker placement coloring by position ── */
.ticker-item:has(.ticker-placement) {
    cursor: default;
}

/* ── Scrollbar color on chat messages (cross-browser) ── */
.chat-messages {
    scrollbar-color: rgba(37, 99, 235, 0.35) transparent;
}

/* ================================================================
   SEZIONE 3 — Edge cases & final polish
   ================================================================ */

/* ── Fix main-container overlap: home page usa .home-page non .main-container ── */
/* Ensure home.css .home-page padding-top:80px wins, not our 96px ── */
.home-page.main-container,
.home-page {
    padding-top: 80px !important;
    margin-top: 0 !important;
}

/* ── Better empty state paragraphs in grids ── */
#news-grid > p,
#events-list > p,
#staff-grid > p,
#roster-grid > p {
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
    padding: 2rem;
    text-align: center;
    width: 100%;
}

/* ── Auth modal body text ── */
.auth-form-group label {
    font-size: 0.88rem;
    letter-spacing: 0.03em;
    color: rgba(255, 255, 255, 0.85);
}

/* ── Hero scroll indicator (optional, subtle) ── */
.hero-content::after {
    content: '';
    display: block;
    width: 1px;
    height: 0;
    opacity: 0;
}

/* ── Better section separator spacing ── */
section + section::before {
    width: 60%;
}

/* ── Roster card hover transition timing ── */
.roster-card {
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                border-color 0.3s ease,
                box-shadow 0.3s ease;
}

/* ── Social post hover — more pronounced lift ── */
.social-post:hover {
    transform: translateY(-8px);
}

/* ── Ticker item font ── */
.ticker-player {
    font-family: 'Rajdhani', 'Outfit', sans-serif;
}

/* ── CTA button on mobile — better min-width ── */
@media (max-width: 480px) {
    .cta-button {
        font-size: 0.85rem;
        padding: 0.85rem 1.8rem;
    }
}

/* ── Ensure body font applies to buttons and inputs ── */
button, input, select, textarea {
    font-family: inherit;
}

/* ── Table in admin — better readability ── */
table {
    border-collapse: collapse;
}

/* ── News card — ensure content uses full height effectively ── */
.news-card {
    display: flex;
    flex-direction: column;
}

.news-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.news-excerpt {
    flex: 1;
}
