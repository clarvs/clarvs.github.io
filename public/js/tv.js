/**
 * Clarvs TV
 *
 * Struttura pagina:
 *  - Player principale: mostra in automatico il video YouTube più recente tra tutti i canali.
 *    Se qualcuno è live (Twitch o YouTube) switcha automaticamente alla diretta.
 *  - "I Nostri Canali": card compatte per ogni streamer con indicatore live.
 *  - "Video YouTube": griglia di tutti i video recenti dai canali YouTube.
 *
 * Config: js/tv-config.js  →  window.TV_CONFIG = { twitch: {...}, youtube: {...} }
 * Streamers: Roster (automatico, da /api/roster) + lista manuale (localStorage clarvsTV_streamers)
 */

// ─── Utility ──────────────────────────────────────────────────────────────────

function parseTwitchUser(val) {
    if (!val) return null;
    const m = val.match(/twitch\.tv\/([^/?#\s]+)/i);
    return ((m ? m[1] : val).toLowerCase().trim()) || null;
}

function parseYtHandle(val) {
    if (!val) return null;
    const m = val.match(/youtube\.com\/((?:@|channel\/|c\/)[^/?#\s]+)/i);
    return m ? m[1] : null;
}

function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtViewers(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1)     + 'K';
    return String(n);
}

function trunc(str, len) {
    return str && str.length > len ? str.slice(0, len) + '…' : (str || '');
}

function relativeDate(isoStr) {
    if (!isoStr) return '';
    const diff  = Date.now() - new Date(isoStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (days  > 30)  return new Date(isoStr).toLocaleDateString('it-IT');
    if (days  >  0)  return `${days} ${days  === 1 ? 'giorno' : 'giorni'} fa`;
    if (hours >  0)  return `${hours} ${hours === 1 ? 'ora'    : 'ore'}   fa`;
    if (mins  >  0)  return `${mins}  min fa`;
    return 'Adesso';
}

// ─── App ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function () {
    console.log('[Clarvs TV] Avvio...');

    // ── DOM ──────────────────────────────────────────────────────────────────
    const tvScreen           = document.getElementById('tv-screen');
    const streamStatus       = document.getElementById('stream-status');
    const fullscreenBtn      = document.getElementById('fullscreen-btn');
    const backBtn            = document.getElementById('back-to-playlist-btn');
    const nowPlayingBar      = document.getElementById('tv-now-playing');
    const nowPlayingName     = document.getElementById('now-playing-name');
    const nowPlayingPlatform = document.getElementById('now-playing-platform');
    const channelsGrid       = document.getElementById('channels-grid');
    const videosGrid         = document.getElementById('videos-grid');
    const videosSection      = document.getElementById('videos-section');
    const liveCountBadge     = document.getElementById('live-count-badge');
    const lastCheckEl        = document.getElementById('last-check-time');
    const refreshLiveBtn     = document.getElementById('refresh-live-btn');
    const noApiWarning       = document.getElementById('no-api-warning');

    if (!tvScreen) { console.error('[Clarvs TV] #tv-screen non trovato'); return; }

    // ── Stato ─────────────────────────────────────────────────────────────────
    let streamers     = [];
    let tvConfig      = {};
    let liveData      = {};       // { id: { isLive, platform, title, gameName, viewerCount, thumbnailUrl, lastVideos } }
    let allVideos     = [];       // tutti i video YT ordinati per data (più recente prima)
    let currentMode   = 'idle';   // 'idle' | 'video' | 'live' | 'manual'
    let activeId      = null;
    let currentFilter = 'all';
    let liveTimer     = null;

    // ── Config ────────────────────────────────────────────────────────────────
    async function loadConfig() {
        // Aspetta che tv-config.js abbia caricato le chiavi dal server
        if (window.TV_CONFIG_PROMISE) {
            try { await window.TV_CONFIG_PROMISE; } catch {}
        }
        if (window.TV_CONFIG) {
            tvConfig = window.TV_CONFIG;
            const tw = !!(tvConfig.twitch && tvConfig.twitch.clientId && tvConfig.twitch.accessToken);
            const yt = !!(tvConfig.youtube && tvConfig.youtube.apiKey);
            console.log("[TV Config] Twitch:" + (tw ? "OK" : "mancante") + " | YouTube:" + (yt ? "OK" : "mancante"));
        } else {
            tvConfig = {};
            console.warn("[TV Config] Chiavi non disponibili - server offline o .env non configurato");
        }
    }

    // ── Streamers (Roster + manuale) ──────────────────────────────────────────
    async function loadStreamers() {
        const result = [];
        const seen   = new Set();

        // 1. Roster automatico
        try {
            let data = null;
            try { const r = await fetch('/api/roster');              if (r.ok) data = await r.json(); } catch {}
            // Solo API
            if (!data) { /* fall through */ }

            if (data) {
                for (const p of data) {
                    const tw = parseTwitchUser(p.socials?.twitch);
                    const yt = parseYtHandle(p.socials?.youtube);
                    if (!tw && !yt) continue;
                    const key = `${tw}|${yt}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    result.push({
                        id: `roster_${p.id}`, name: p.name,
                        avatar: p.imageUrl || null,
                        twitch: tw, youtubeUrl: p.socials?.youtube || null,
                        youtubeHandle: yt, source: 'roster'
                    });
                }
            }
        } catch (e) { console.error('[TV] Errore roster:', e); }

        // 2. Lista manuale
        let manual = [];
        try { const r = await fetch('/api/tv/streamers'); if (r.ok) manual = await r.json(); } catch {}
        if (!manual.length) {
            try { const raw = localStorage.getItem('clarvsTV_streamers'); if (raw) manual = JSON.parse(raw); } catch {}
        }
        for (const s of manual) {
            const key = `${s.twitch || ''}|${s.youtubeHandle || ''}`;
            if (seen.has(key)) continue;
            seen.add(key);
            result.push({ ...s, source: 'manual' });
        }

        streamers = result;
        console.log(`[TV] ${streamers.length} streamer (${result.filter(s=>s.source==='roster').length} roster, ${result.filter(s=>s.source==='manual').length} manuali)`);
    }

    // ── Twitch API ────────────────────────────────────────────────────────────
    async function checkTwitchLive() {
        const clientId    = tvConfig?.twitch?.clientId?.trim();
        const accessToken = tvConfig?.twitch?.accessToken?.trim();
        if (!clientId || !accessToken) {
            if (noApiWarning) noApiWarning.style.display = 'flex';
            return {};
        }
        if (noApiWarning) noApiWarning.style.display = 'none';

        const list = streamers.filter(s => s.twitch);
        if (!list.length) return {};

        const qs = list.map(s => `user_login=${encodeURIComponent(s.twitch)}`).join('&');
        try {
            const r = await fetch(`https://api.twitch.tv/helix/streams?${qs}`, {
                headers: { 'Client-Id': clientId, 'Authorization': `Bearer ${accessToken}` }
            });
            if (!r.ok) {
                console.error(`[Twitch API] Errore ${r.status}${r.status === 401 ? ' – token scaduto' : ''}`);
                return {};
            }
            const json = await r.json();
            const liveMap = {};
            for (const s of (json.data || [])) {
                liveMap[s.user_login.toLowerCase()] = {
                    isLive: true, platform: 'twitch',
                    title: s.title, gameName: s.game_name,
                    viewerCount: s.viewer_count,
                    thumbnailUrl: s.thumbnail_url?.replace('{width}','320').replace('{height}','180')
                };
            }
            const result = {};
            for (const s of list) {
                result[s.id] = liveMap[s.twitch.toLowerCase()] || { isLive: false, platform: 'twitch' };
                console.log(`[Twitch] ${s.twitch} → ${result[s.id].isLive ? '🔴 LIVE' : '⚫ offline'}`);
            }
            return result;
        } catch (e) { console.error('[Twitch API] Fetch fallito:', e); return {}; }
    }

    // ── YouTube API ───────────────────────────────────────────────────────────
    async function checkYouTubeLive() {
        const apiKey = tvConfig?.youtube?.apiKey?.trim();
        if (!apiKey) return {};

        const list = streamers.filter(s => s.youtubeHandle || s.youtubeUrl);
        if (!list.length) return {};

        const result = {};
        if (!tvConfig._ytCache) tvConfig._ytCache = {};

        await Promise.all(list.map(async s => {
            try {
                // Risolve handle → Channel ID
                let channelId = tvConfig._ytCache[s.id];
                if (!channelId) {
                    const handle = s.youtubeHandle;
                    if (!handle) return;
                    const cr = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`);
                    if (!cr.ok) return;
                    channelId = (await cr.json()).items?.[0]?.id;
                    if (!channelId) return;
                    tvConfig._ytCache[s.id] = channelId;
                }

                // Controlla live
                const lr = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`);
                if (!lr.ok) return;
                const lj = await lr.json();

                if (lj.items?.length) {
                    const v = lj.items[0];
                    result[s.id] = {
                        isLive: true, platform: 'youtube',
                        videoId: v.id.videoId,
                        title: v.snippet.title,
                        thumbnailUrl: v.snippet.thumbnails?.medium?.url
                    };
                    console.log(`[YouTube] ${s.youtubeHandle} → 🔴 LIVE`);
                } else {
                    // Ultimi 3 video
                    const vr = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=3&key=${apiKey}`);
                    const vj = vr.ok ? await vr.json() : { items: [] };
                    result[s.id] = {
                        isLive: false, platform: 'youtube', channelId,
                        lastVideos: (vj.items || []).map(v => ({
                            videoId: v.id.videoId,
                            title: v.snippet.title,
                            channelName: s.name,
                            streamerId: s.id,
                            publishedAt: v.snippet.publishedAt,
                            thumbnailUrl: v.snippet.thumbnails?.medium?.url
                                || `https://i.ytimg.com/vi/${v.id.videoId}/mqdefault.jpg`
                        }))
                    };
                    console.log(`[YouTube] ${s.youtubeHandle} → ⚫ offline (${result[s.id].lastVideos.length} video)`);
                }
            } catch (e) { console.error(`[YouTube] Errore ${s.youtubeHandle}:`, e); }
        }));

        return result;
    }

    // ── Live check globale ────────────────────────────────────────────────────
    async function checkAllLive() {
        if (!streamers.length) return;
        console.log('[Live Check] Avvio...');

        const [twitchData, ytData] = await Promise.all([checkTwitchLive(), checkYouTubeLive()]);

        for (const s of streamers) {
            const tw = twitchData[s.id] || {};
            const yt = ytData[s.id]     || {};
            if (tw.isLive) {
                liveData[s.id] = { ...tw };
            } else if (yt.isLive) {
                liveData[s.id] = { ...yt };
            } else {
                liveData[s.id] = {
                    isLive: false,
                    hasTwitch: !!s.twitch,
                    hasYoutube: !!(s.youtubeHandle || s.youtubeUrl),
                    lastVideos: yt.lastVideos || []
                };
            }
        }

        // Raccoglie tutti i video YouTube ordinati per data (più recente prima)
        const videos = [];
        for (const s of streamers) {
            for (const v of (liveData[s.id]?.lastVideos || [])) {
                videos.push({ ...v, channelName: s.name, streamerId: s.id, avatar: s.avatar });
            }
        }
        allVideos = videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        renderChannels();
        renderYoutubeVideos();
        handleAutoSwitch();
        updateLastCheck();
        console.log('[Live Check] Completato');
    }

    // ── Auto-switch ───────────────────────────────────────────────────────────
    function handleAutoSwitch() {
        if (currentMode === 'manual') return;

        const liveStreamer = streamers.find(s => liveData[s.id]?.isLive);

        if (liveStreamer && currentMode !== 'live') {
            console.log(`[Auto-Switch] ${liveStreamer.name} è live`);
            loadStreamerPlayer(liveStreamer);
            currentMode = 'live';
            showLiveNotification(liveStreamer);
        } else if (!liveStreamer && currentMode === 'live') {
            // Nessuno più live → torna al video più recente
            loadMostRecentVideo();
        }
    }

    // ── Player: video più recente ─────────────────────────────────────────────
    function loadMostRecentVideo() {
        if (!allVideos.length) {
            showPlaceholder();
            return;
        }
        const v = allVideos[0];
        const s = streamers.find(x => x.id === v.streamerId);

        activeId    = v.streamerId;
        currentMode = 'video';

        tvScreen.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${v.videoId}?autoplay=1&rel=0&modestbranding=1"
                frameborder="0" allow="autoplay; fullscreen" allowfullscreen
                width="100%" height="100%" title="${escHtml(v.title)}">
            </iframe>`;

        setStatus(false);
        setNowPlaying(true, v.channelName, '<i class="fab fa-youtube" style="color:#ff0000"></i> YouTube');
        if (backBtn) backBtn.style.display = 'none'; // non c'è playlist a cui tornare
        if (s) highlightChannel(s.id);
    }

    // ── Player: stream live ───────────────────────────────────────────────────
    function loadStreamerPlayer(s) {
        const info     = liveData[s.id] || {};
        const hostname = window.location.hostname || 'localhost';

        let embedUrl = '', platformLabel = '';

        if ((info.platform === 'twitch' || !info.platform) && s.twitch) {
            embedUrl      = `https://player.twitch.tv/?channel=${s.twitch}&parent=${hostname}&autoplay=true`;
            platformLabel = `<i class="fab fa-twitch" style="color:#9147ff"></i> Twitch`;
        } else if (info.platform === 'youtube' && info.videoId) {
            embedUrl      = `https://www.youtube.com/embed/${info.videoId}?autoplay=1`;
            platformLabel = `<i class="fab fa-youtube" style="color:#ff0000"></i> YouTube Live`;
        } else { return; }

        activeId = s.id;

        tvScreen.innerHTML = `
            <iframe src="${embedUrl}" frameborder="0"
                allow="autoplay; fullscreen; microphone; camera"
                allowfullscreen width="100%" height="100%"
                title="${escHtml(s.name)} – Live">
            </iframe>`;

        setStatus(true, s.name);
        setNowPlaying(true, s.name, platformLabel);
        if (backBtn) backBtn.style.display = 'inline-flex';
        highlightChannel(s.id);
    }

    // ── Player: video YouTube specifico ───────────────────────────────────────
    function loadYouTubeVideo(videoId, channelName, streamerId) {
        activeId    = streamerId;
        currentMode = 'manual';

        tvScreen.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
                frameborder="0" allow="autoplay; fullscreen" allowfullscreen
                width="100%" height="100%">
            </iframe>`;

        setStatus(false);
        setNowPlaying(true, channelName, '<i class="fab fa-youtube" style="color:#ff0000"></i> YouTube');
        if (backBtn) backBtn.style.display = 'inline-flex';
        highlightChannel(streamerId);
    }

    // ── Placeholder quando non c'è niente da caricare ─────────────────────────
    function showPlaceholder() {
        currentMode = 'idle';
        activeId    = null;
        tvScreen.innerHTML = `
            <div class="tv-placeholder">
                <i class="fas fa-tv"></i>
                <p>Nessun contenuto disponibile</p>
                <small>Aggiungi canali YouTube nella sezione Admin per vedere i video</small>
            </div>`;
        setStatus(false);
        setNowPlaying(false);
    }

    // ── UI: Canali ────────────────────────────────────────────────────────────
    function renderChannels() {
        if (!channelsGrid) return;
        const list = filteredStreamers();

        if (!streamers.length) {
            channelsGrid.innerHTML = `
                <div class="streamers-empty">
                    <i class="fas fa-satellite-dish"></i>
                    <p>Nessun canale configurato.</p>
                    <small>Aggiungi link Twitch/YouTube ai player nel <strong>Roster</strong>.</small>
                </div>`;
        } else if (!list.length) {
            channelsGrid.innerHTML = `
                <div class="streamers-empty">
                    <i class="fas fa-filter"></i>
                    <p>Nessuno con questo filtro.</p>
                </div>`;
        } else {
            channelsGrid.innerHTML = '';
            list.forEach(s => channelsGrid.appendChild(buildChannelCard(s)));
        }

        const n = streamers.filter(s => liveData[s.id]?.isLive).length;
        if (liveCountBadge) {
            liveCountBadge.textContent  = n;
            liveCountBadge.style.display = n > 0 ? 'inline-flex' : 'none';
        }
    }

    function filteredStreamers() {
        switch (currentFilter) {
            case 'live':    return streamers.filter(s => liveData[s.id]?.isLive);
            case 'twitch':  return streamers.filter(s => s.twitch);
            case 'youtube': return streamers.filter(s => s.youtubeHandle || s.youtubeUrl);
            default:        return streamers;
        }
    }

    function buildChannelCard(s) {
        const info     = liveData[s.id] || {};
        const isLive   = !!info.isLive;
        const isActive = activeId === s.id;

        const thumbBg = isLive && info.thumbnailUrl
            ? `style="background-image:url('${info.thumbnailUrl}')"` : '';

        const badges = [];
        if (s.twitch) badges.push(`
            <a href="https://twitch.tv/${escHtml(s.twitch)}" target="_blank"
               class="platform-badge twitch" onclick="event.stopPropagation()">
                <i class="fab fa-twitch"></i> ${escHtml(s.twitch)}
            </a>`);
        if (s.youtubeUrl) badges.push(`
            <a href="${escHtml(s.youtubeUrl)}" target="_blank"
               class="platform-badge youtube" onclick="event.stopPropagation()">
                <i class="fab fa-youtube"></i> ${escHtml(s.youtubeHandle || 'YouTube')}
            </a>`);

        let meta = '';
        if (isLive) {
            meta = `
                <div class="streamer-live-meta">
                    ${info.gameName    ? `<span class="live-game"><i class="fas fa-gamepad"></i> ${escHtml(info.gameName)}</span>` : ''}
                    ${info.viewerCount != null ? `<span class="live-viewers"><i class="fas fa-eye"></i> ${fmtViewers(info.viewerCount)}</span>` : ''}
                </div>
                ${info.title ? `<p class="live-title">${escHtml(trunc(info.title, 50))}</p>` : ''}`;
        }

        const card = document.createElement('div');
        card.className = ['streamer-card', isLive && 'is-live', isActive && 'is-active']
            .filter(Boolean).join(' ');
        card.dataset.streamerId = s.id;

        card.innerHTML = `
            <div class="sc-thumb ${isLive ? 'has-live-thumb' : ''}" ${thumbBg}>
                <img src="${escHtml(s.avatar || '../assets/Images/players/default.jpg')}"
                     alt="${escHtml(s.name)}" class="sc-avatar" onerror="this.style.display='none'">
                ${isLive ? `
                    <div class="sc-live-badge"><span class="live-dot-sm"></span> LIVE</div>
                    <div class="sc-watch-overlay">
                        <i class="fas fa-play-circle"></i>
                        <span>Guarda ora</span>
                    </div>` : ''}
                ${isActive ? `<div class="sc-on-air"><i class="fas fa-tv"></i> IN ONDA</div>` : ''}
            </div>
            <div class="sc-body">
                <div class="sc-name-row">
                    <span class="sc-name">${escHtml(s.name)}</span>
                    ${isLive ? `<span class="live-pill"><span class="live-dot-sm"></span> LIVE</span>` : ''}
                </div>
                ${meta}
                <div class="sc-platforms">${badges.join('')}</div>
            </div>`;

        card.addEventListener('click', () => {
            if (!s.twitch && !s.youtubeHandle && !s.youtubeUrl) return;
            if (activeId === s.id && currentMode !== 'idle') {
                // Deseleziona
                loadMostRecentVideo();
                return;
            }
            currentMode = 'manual';
            loadStreamerPlayer(s);
        });

        return card;
    }

    function highlightChannel(streamerId) {
        document.querySelectorAll('.streamer-card').forEach(c => {
            c.classList.toggle('is-active', String(c.dataset.streamerId) === String(streamerId));
        });
    }

    // ── UI: Video YouTube ─────────────────────────────────────────────────────
    function renderYoutubeVideos() {
        if (!videosGrid || !videosSection) return;

        if (!allVideos.length) {
            videosSection.style.display = 'none';
            return;
        }

        videosSection.style.display = 'block';
        videosGrid.innerHTML = '';

        allVideos.forEach(v => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-thumb">
                    <img src="${escHtml(v.thumbnailUrl)}" alt="${escHtml(v.title)}" loading="lazy">
                    <div class="video-play-overlay"><i class="fas fa-play-circle"></i></div>
                </div>
                <div class="video-info">
                    <p class="video-title" title="${escHtml(v.title)}">${escHtml(trunc(v.title, 60))}</p>
                    <div class="video-meta">
                        <span class="video-channel">
                            ${v.avatar ? `<img src="${escHtml(v.avatar)}" class="video-channel-avatar" onerror="this.style.display='none'">` : ''}
                            ${escHtml(v.channelName)}
                        </span>
                        <span class="video-date">${relativeDate(v.publishedAt)}</span>
                    </div>
                </div>`;

            card.addEventListener('click', () => loadYouTubeVideo(v.videoId, v.channelName, v.streamerId));
            videosGrid.appendChild(card);
        });
    }

    // ── UI helpers ────────────────────────────────────────────────────────────
    function setStatus(isLive, name = '') {
        if (!streamStatus) return;
        if (isLive) {
            streamStatus.className = 'stream-status live';
            streamStatus.innerHTML = `<span class="dot live"></span><span>🔴 LIVE: ${escHtml(name)}</span>`;
        } else {
            streamStatus.className = 'stream-status';
            streamStatus.innerHTML = `<span class="dot"></span><span>📺 Clarvs TV</span>`;
        }
    }

    function setNowPlaying(active, name = '', platform = '') {
        if (!nowPlayingBar) return;
        nowPlayingBar.style.display = active ? 'flex' : 'none';
        if (active) {
            if (nowPlayingName)     nowPlayingName.textContent = name;
            if (nowPlayingPlatform) nowPlayingPlatform.innerHTML = platform;
        }
    }

    function updateLastCheck() {
        if (!lastCheckEl) return;
        const d = new Date();
        lastCheckEl.textContent = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    }

    function showLiveNotification(s) {
        document.querySelector('.live-notification')?.remove();
        const info = liveData[s.id] || {};
        const plat = info.platform === 'youtube'
            ? '<i class="fab fa-youtube" style="color:#ff4444"></i>'
            : '<i class="fab fa-twitch"  style="color:#9147ff"></i>';
        const el = document.createElement('div');
        el.className = 'live-notification';
        el.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-broadcast-tower"></i>
                <div>
                    <strong>🔴 LIVE ORA!</strong>
                    <p>${escHtml(s.name)} è in diretta ${plat}</p>
                    ${info.gameName ? `<span>${escHtml(info.gameName)}</span>` : ''}
                </div>
                <button class="notif-close-btn" onclick="this.closest('.live-notification').remove()">✕</button>
            </div>`;
        document.body.appendChild(el);
        setTimeout(() => el?.remove(), 9_000);
    }

    // ── Fullscreen ────────────────────────────────────────────────────────────
    function toggleFullscreen() {
        const c = document.querySelector('.tv-container');
        if (!c) return;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            (c.requestFullscreen || c.webkitRequestFullscreen || c.mozRequestFullScreen).call(c);
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen).call(document);
        }
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    async function init() {
        await loadConfig();
        await loadStreamers();

        // Placeholder mentre si caricano i dati
        showPlaceholder();
        renderChannels();

        // Controlli
        fullscreenBtn?.addEventListener('click', toggleFullscreen);
        document.addEventListener('fullscreenchange', () => {
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = document.fullscreenElement
                    ? '<i class="fas fa-compress"></i> Esci'
                    : '<i class="fas fa-expand"></i> Schermo Intero';
            }
        });

        backBtn?.addEventListener('click', () => {
            currentMode = 'video';
            loadMostRecentVideo();
        });

        refreshLiveBtn?.addEventListener('click', async () => {
            refreshLiveBtn.classList.add('spinning');
            await checkAllLive();
            refreshLiveBtn.classList.remove('spinning');
        });

        document.querySelectorAll('.streamer-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.streamer-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderChannels();
            });
        });

        // Primo live check + carica video più recente
        await checkAllLive();

        // Se nessuno è live, carica il video più recente automaticamente
        if (currentMode !== 'live') {
            loadMostRecentVideo();
        }

        // Controllo periodico ogni 5 minuti
        liveTimer = setInterval(checkAllLive, 5 * 60_000);
        console.log('[Clarvs TV] Pronto.');
    }

    init();
});
