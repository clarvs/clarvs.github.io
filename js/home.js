// Variabili globali slider
let currentSlide = 0;
const slideWidth = 300; // 280px card + 20px gap
let maxSlides = 0;
let autoSlideInterval;

// --- Inizializzazione ---
document.addEventListener('DOMContentLoaded', function() {
    loadRosterCards().then(() => {
        initRosterSlider();
        startAutoSlide();
    });
    loadTicker();
    loadNews();
    loadEvents();
    if (typeof addTournamentToMenu === 'function') addTournamentToMenu();

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu')) {
            document.getElementById('userDropdown')?.classList.remove('active');
        }
    });
});

// --- Roster dinamico da API ---

async function loadRosterCards() {
    const container = document.getElementById('rosterContainer');
    if (!container) return;

    const socialIcons = {
        twitter:   'fab fa-twitter',
        instagram: 'fab fa-instagram',
        twitch:    'fab fa-twitch',
        youtube:   'fab fa-youtube',
        tiktok:    'fab fa-tiktok'
    };

    const categoryLabel = {
        proPlayer:      'PRO PLAYER',
        talent:         'TALENT',
        academy:        'ACADEMY',
        contentCreator: 'CONTENT CREATOR'
    };

    function formatPR(value) {
        if (!value) return null;
        return value.toLocaleString('it-IT');
    }

    function formatEarnings(value) {
        if (!value) return null;
        return '$' + value.toLocaleString('it-IT');
    }

    try {
        let roster = null;
        let statsMap = {};

        const [rRes, sRes] = await Promise.all([
            fetch('/scraper/config/roster.json'),
            fetch('/scraper/data/player-stats.json')
        ]);
        if (rRes.ok) roster = await rRes.json();
        if (sRes.ok) {
            const statsData = await sRes.json();
            (statsData.players || []).forEach(p => {
                statsMap[p.name.toLowerCase()] = p.stats;
            });
        }

        if (!roster || roster.length === 0) return;

        container.innerHTML = roster.map(player => {
            const initials = player.name
                .split(' ')
                .map(w => w[0] || '')
                .join('')
                .toUpperCase()
                .slice(0, 2);

            const socials = Object.entries(player.socials || {})
                .filter(([, url]) => url)
                .map(([p, url]) => `<a href="${url}" target="_blank"><i class="${socialIcons[p] || 'fas fa-link'}"></i></a>`)
                .join('');

            const avatar = player.imageUrl
                ? `<div class="player-avatar" style="background-image:url('${player.imageUrl}')"></div>`
                : `<div class="player-initial">${initials}</div>`;

            const stats = statsMap[player.name.toLowerCase()];
            const pr = stats?.pr ? formatPR(stats.pr) : null;
            const earnings = stats?.earnings ? formatEarnings(stats.earnings) : null;

            const statsHtml = (pr || earnings) ? `
                <div class="home-stat-chips">
                    ${pr ? `<span class="home-stat-chip"><span class="chip-val">${pr}</span><span class="chip-lbl">PR EU</span></span>` : ''}
                    ${earnings ? `<span class="home-stat-chip chip-earn"><span class="chip-val">${earnings}</span></span>` : ''}
                </div>` : '';

            return `
                <div class="roster-card">
                    <div class="card-content">
                        ${avatar}
                        <h3>${player.name}</h3>
                        <p class="player-role">${categoryLabel[player.category] || player.role.toUpperCase()}</p>
                        ${statsHtml}
                        <div class="social-icons">${socials}</div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Errore caricamento roster slider:', e);
    }
}

let _tickerRafId = null;

async function loadTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    try {
        let statsData  = null;
        let rosterData = null;

        const [sr, rr] = await Promise.all([
            fetch('/scraper/data/player-stats.json'),
            fetch('/scraper/config/roster.json')
        ]);
        if (sr.ok) statsData  = await sr.json();
        if (rr.ok) rosterData = await rr.json();

        if (!statsData || !statsData.players || statsData.players.length === 0) {
            hideTicker();
            return;
        }

        const trackerUrls = {};
        (rosterData || []).forEach(p => {
            if (p.ftTrackerUrl) trackerUrls[p.name] = p.ftTrackerUrl;
        });

        const items = [];
        statsData.players.forEach(player => {
            (player.stats?.tournaments || []).forEach(t => {
                items.push({
                    playerName:     player.name,
                    tournamentName: t.name || 'Tournament',
                    placement:      t.placement
                });
            });
        });

        if (items.length === 0) {
            hideTicker();
            return;
        }

        const html = items.map(item => `
            <div class="ticker-item">
                <span class="ticker-player">${item.playerName}</span>
                <span class="ticker-separator">|</span>
                <span class="ticker-tournament">${item.tournamentName}</span>
                <span class="ticker-arrow">&#8594;</span>
                <span class="ticker-placement">#${item.placement}</span>
            </div>
        `).join('');

        // Popola con una copia sola, misura, poi duplica
        track.innerHTML = html;
        track.style.transform = '';

        // Aspetta 2 frame affinché il browser calcoli scrollWidth
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        const singleWidth = track.scrollWidth;
        if (singleWidth === 0) { hideTicker(); return; }

        // Duplica per loop seamless
        track.innerHTML = html + html;

        // Ferma eventuale animazione precedente
        if (_tickerRafId) { cancelAnimationFrame(_tickerRafId); _tickerRafId = null; }

        // Scorrimento JS: 80 px/sec, costante indipendente dal framerate
        const SPEED = 80;
        let pos  = 0;
        let last = null;

        function tick(ts) {
            if (last !== null) {
                pos += SPEED * (ts - last) / 1000;
                if (pos >= singleWidth) pos -= singleWidth;
                track.style.transform = `translateX(-${pos}px)`;
            }
            last = ts;
            _tickerRafId = requestAnimationFrame(tick);
        }

        _tickerRafId = requestAnimationFrame(tick);

    } catch (e) {
        console.error('Errore caricamento ticker:', e);
        hideTicker();
    }
}

function hideTicker() {
    const section = document.querySelector('.results-ticker');
    if (section) section.style.display = 'none';
}

// --- Funzioni dropdown ---
function toggleDropdown() {
    document.getElementById('userDropdown')?.classList.toggle('active');
}

function openLogin()    { alert('Funzione Login - Da implementare'); }
function openRegister() { alert('Funzione Registrazione - Da implementare'); }
function openAdmin()    { alert('Funzione Admin Panel - Da implementare'); }

// --- Slider e Particelle ---

function initRosterSlider() {
    const container = document.getElementById('rosterContainer');
    if (!container) return;
    const cards        = container.children;
    const containerWidth = container.offsetWidth;
    const totalWidth   = cards.length * (280 + 32);
    maxSlides          = Math.max(0, Math.ceil((totalWidth - containerWidth) / slideWidth));
}

function nextSlide() {
    const container = document.getElementById('rosterContainer');
    if (!container) return;
    currentSlide = currentSlide < maxSlides ? currentSlide + 1 : 0;
    container.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
}

function previousSlide() {
    const container = document.getElementById('rosterContainer');
    if (!container) return;
    currentSlide = currentSlide > 0 ? currentSlide - 1 : maxSlides;
    container.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
}

function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(nextSlide, 4000);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

document.querySelector('.slider-controls')?.addEventListener('mouseenter', stopAutoSlide);
document.querySelector('.slider-controls')?.addEventListener('mouseleave', startAutoSlide);
window.addEventListener('resize', initRosterSlider);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// --- Cache home content ---
let _homeContent = null;
async function getHomeContent() {
    if (!_homeContent) {
        try {
            const res = await fetch('/scraper/config/home-content.json');
            if (res.ok) _homeContent = await res.json();
        } catch (e) { /* ignora */ }
    }
    return _homeContent || { news: [], events: [], social: { instagram: [], twitter: [] } };
}

// --- Notizie ---
async function loadNews() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    const content  = await getHomeContent();
    const newsData = content.news || [];

    if (newsData.length === 0) {
        newsGrid.innerHTML = '<p style="text-align:center;color:#888">Nessuna notizia disponibile.</p>';
        return;
    }

    newsGrid.innerHTML = newsData.map(news => `
        <article class="news-card">
            <div class="news-image" style="background-image: url('${news.image}')"></div>
            <div class="news-content">
                <h3>${news.title}</h3>
                <time class="news-date">${news.date}</time>
                <p class="news-excerpt">${news.content}</p>
            </div>
        </article>
    `).join('');
}

// --- Eventi ---
async function loadEvents() {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) return;

    const content    = await getHomeContent();
    const eventsData = content.events || [];

    if (eventsData.length === 0) {
        eventsList.innerHTML = '<p style="text-align:center;color:#888">Nessun evento in programma.</p>';
        return;
    }

    eventsList.innerHTML = eventsData.map(event => `
        <div class="event-card">
            <div class="event-type">${event.type}</div>
            <h3 class="event-title">${event.title}</h3>
            <div class="event-details">
                <div class="event-date"><i class="fas fa-calendar"></i> ${event.date}</div>
                <div class="event-time"><i class="fas fa-clock"></i> ${event.time}</div>
            </div>
        </div>
    `).join('');
}
