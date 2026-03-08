/**
 * TALENT SCRAPER - Sistema 2
 * Scrapa classifiche Fortnite Tracker per trovare talenti.
 *
 * Per ogni player dalla classifica estrae:
 *   - Nome      → #profile-header .profile-header-user__nickname
 *   - PR EU     → .profile-events-totals__value (label "Power Ranking")
 *   - Earnings  → .profile-table-row__value (contiene $)
 *   - Media placement → ultimi 10 tornei con PR > 1
 *
 * Profili scrapati in parallelo (CONCURRENCY = 10 browser indipendenti)
 */

const { connect } = require('puppeteer-real-browser');
const cron = require('node-cron');
const fs   = require('fs').promises;
const path = require('path');

const CONCURRENCY = parseInt(process.env.SCRAPER_CONCURRENCY) || 10;

// Workaround Windows: chrome-launcher tenta di eliminare la dir temp (lighthouse.XXXXXXXX)
// con rmSync mentre Chrome ha ancora file handle aperti → EPERM non-fatale.
// Intercettiamo solo questo caso specifico per non sporcare i log.
process.on('uncaughtException', err => {
    if (err.code === 'EPERM' && err.path && err.path.includes('lighthouse')) {
        // Errore non-fatale: cleanup dir temp Chrome su Windows — ignorato
        return;
    }
    throw err;
});

class TalentScraper {
    constructor(options = {}) {
        this.browser = null;
        this.page    = null;
        this.isRunning = false;

        this.configFile = path.join(__dirname, 'config', 'talent-urls.json');
        this.dataFile   = path.join(__dirname, 'data',   'talent-stats.json');
        this.logFile    = path.join(__dirname, 'logs',   'talent-scraper.log');

        this.config = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            leaderboardTimeout: 0,
            profileTimeout:     45000
        };

        this.setupDirectories();

        if (options.enableScheduling !== false) {
            // Avvio automatico alle 01:30 (dopo il team scraper delle 01:00)
            cron.schedule('30 1 * * *', () => {
                this.log('[01:30] Avvio talent scraping pianificato');
                this.runScraping();
            });
        }
    }

    async setupDirectories() {
        try {
            await fs.mkdir(path.join(__dirname, 'data'),   { recursive: true });
            await fs.mkdir(path.join(__dirname, 'logs'),   { recursive: true });
            await fs.mkdir(path.join(__dirname, 'config'), { recursive: true });
        } catch (e) {
            console.error('Errore creazione directory:', e.message);
        }
    }

    // ─── CONFIG URLs ─────────────────────────────────────────────────────────────

    async getUrls() {
        try {
            const data = await fs.readFile(this.configFile, 'utf8');
            return JSON.parse(data).urls || [];
        } catch {
            return [];
        }
    }

    async saveUrls(urls) {
        await fs.mkdir(path.dirname(this.configFile), { recursive: true });
        await fs.writeFile(this.configFile, JSON.stringify({ urls }, null, 2), 'utf8');
    }

    // ─── STATS ───────────────────────────────────────────────────────────────────

    async getLatestStats() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            return JSON.parse(data);
        } catch {
            return { lastUpdate: null, sourceUrls: [], players: [] };
        }
    }

    async saveData(data) {
        await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2), 'utf8');
        this.log(`Talent stats salvate: ${data.players.length} player`);
    }

    // ─── MAIN FLOW ───────────────────────────────────────────────────────────────

    async runScraping() {
        if (this.isRunning) {
            this.log('Talent scraping gia in corso, saltato');
            return;
        }

        const urls = await this.getUrls();
        if (urls.length === 0) {
            this.log('Nessun URL configurato per il talent scouting');
            return;
        }

        this.isRunning = true;
        this.log(`Avvio talent scraping — ${urls.length} classifiche da processare`);

        try {
            // Step 1: raccogli player dalle classifiche (browser singolo, sequenziale)
            // Un unico browser processa tutti gli URL in serie
            await this.initLeaderboardBrowser();

            const allPlayerLinks = [];
            const seenNames = new Set();

            for (let _ui = 0; _ui < urls.length; _ui++) {
                const url = urls[_ui];
                // Reset pagina tra un URL e l'altro per evitare problemi di stato/Cloudflare
                if (_ui > 0) {
                    await this.page.goto('about:blank', { waitUntil: 'load', timeout: 10000 }).catch(() => {});
                }
                this.log(`Scraping classifica (${_ui + 1}/${urls.length}): ${url}`);
                try {
                    const players = await this.scrapeLeaderboard(url, this.page);
                    let newCount = 0;
                    for (const p of players) {
                        const key = p.name.toLowerCase();
                        if (!seenNames.has(key)) {
                            seenNames.add(key);
                            allPlayerLinks.push(p);
                            newCount++;
                        }
                    }
                    const dupCount = players.length - newCount;
                    this.log(`Trovati ${players.length} player in: ${url} → ${newCount} nuovi${dupCount > 0 ? `, ${dupCount} già visti (scartati)` : ''}`);
                } catch (e) {
                    this.log(`Errore classifica ${url}: ${e.message}`);
                }
            }

            await this.closeBrowser();

            // Step 2: la deduplicazione è già avvenuta inline
            const uniquePlayers = allPlayerLinks;
            this.log(`Player unici da profilare: ${uniquePlayers.length}`);

            // Step 3: scrapa profili in parallelo (batch da CONCURRENCY)
            const detailedPlayers = [];
            const totalBatches = Math.ceil(uniquePlayers.length / CONCURRENCY);

            for (let i = 0; i < uniquePlayers.length; i += CONCURRENCY) {
                const batch = uniquePlayers.slice(i, i + CONCURRENCY);
                const batchNum = Math.floor(i / CONCURRENCY) + 1;
                this.log(`Batch ${batchNum}/${totalBatches}: ${batch.length} player in parallelo`);

                const batchResults = await Promise.all(
                    batch.map(player => this.scrapePlayerWithOwnBrowser(player))
                );
                detailedPlayers.push(...batchResults);

                if (i + CONCURRENCY < uniquePlayers.length) {
                    this.log(`Pausa 5s tra batch...`);
                    await this.delay(5000);
                }
            }

            // Filtra player inattivi (ultimo evento > 60 giorni fa)
            const activePlayers = detailedPlayers.filter(p => !p.inactive);
            if (activePlayers.length < detailedPlayers.length) {
                this.log(`Esclusi ${detailedPlayers.length - activePlayers.length} player inattivi (ultimo evento > 60 giorni fa)`);
            }
            detailedPlayers.length = 0;
            detailedPlayers.push(...activePlayers);

            // Step 4: calcola Talent Score sul pool e ordina desc
            const scoredPlayers = this.computeTalentScores(detailedPlayers);
            scoredPlayers.sort((a, b) => {
                if (a.talentScore === null && b.talentScore === null) return 0;
                if (a.talentScore === null) return 1;
                if (b.talentScore === null) return -1;
                return b.talentScore - a.talentScore;
            });
            detailedPlayers.length = 0;
            detailedPlayers.push(...scoredPlayers);

            // Step 5: salva
            await this.saveData({
                lastUpdate: new Date().toISOString(),
                sourceUrls: urls,
                players: detailedPlayers
            });

            this.log(`Talent scraping completato! ${detailedPlayers.length} player processati`);

        } catch (e) {
            this.log(`Errore generale: ${e.message}`);
        } finally {
            await this.closeBrowser();
            this.isRunning = false;
        }
    }

    // ─── SCRAPE LEADERBOARD (browser dedicato per URL) ────────────────────────────

    async scrapeLeaderboardWithOwnBrowser(url) {
        let browser = null;
        try {
            const result = await connect({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--lang=it-IT,it,en-US,en',
                    '--window-size=1920,1080',
                    '--window-position=-32000,-32000'
                ],
                turnstile: true,
                connectOption: { defaultViewport: this.config.viewport },
                disableXvfb: true
            });
            browser = result.browser;
            const page = result.page;
            await page.setUserAgent(this.config.userAgent);
            return await this.scrapeLeaderboard(url, page);
        } finally {
            if (browser) await browser.close().catch(() => {});
        }
    }

    async scrapeLeaderboard(url, page) {

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: this.config.leaderboardTimeout
        });

        await this.humanBehavior(page);

        try {
            await page.waitForSelector(
                '.trn-table__container table.trn-table tbody tr',
                { timeout: 20000 }
            );
            this.log('Tabella classifica rilevata');
        } catch {
            this.log('Timeout attesa tabella, provo comunque...');
        }

        const players = await page.evaluate(() => {
            const results = [];

            const exactLinks = document.querySelectorAll(
                '.trn-table__container table.trn-table tbody tr ' +
                'td.trn-table__column-left .leaderboard__user a.leaderboard-user__profile'
            );

            exactLinks.forEach(a => {
                const href = a.getAttribute('href');
                const nicknameEl = a.querySelector('.leaderboard-user__nickname');
                const name = nicknameEl ? nicknameEl.textContent.trim() : a.textContent.trim();
                if (!name || !href) return;
                const profileUrl = href.startsWith('http')
                    ? href
                    : 'https://fortnitetracker.com' + href;
                results.push({ name, profileUrl });
            });

            if (results.length > 0) return results;

            // Fallback
            const fallbackLinks = document.querySelectorAll('a[href*="/profile/"]');
            fallbackLinks.forEach(a => {
                const href = a.getAttribute('href');
                const name = a.textContent.trim();
                if (!name || name.length === 0 || name.length > 60) return;
                const lower = name.toLowerCase();
                if (['profile','events','view','open','see more'].includes(lower)) return;
                const profileUrl = href.startsWith('http')
                    ? href
                    : 'https://fortnitetracker.com' + href;
                results.push({ name, profileUrl });
            });

            return results;
        });

        this.log(`Strategia usata: trovati ${players.length} player`);
        return players;
    }

    // ─── SCRAPE SINGOLO PROFILO (browser dedicato) ────────────────────────────────

    async scrapePlayerWithOwnBrowser(player) {
        let browser = null;
        try {
            const result = await connect({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--lang=it-IT,it,en-US,en',
                    '--window-size=1920,1080',
                    '--window-position=-32000,-32000'
                ],
                turnstile: true,
                connectOption: { defaultViewport: this.config.viewport },
                disableXvfb: true
            });

            browser = result.browser;
            const page = result.page;
            await page.setUserAgent(this.config.userAgent);

            const details = await this.scrapePlayerProfile(player, page);

            // Controllo inattività: escludi se l'ultimo evento è > 60 giorni fa
            if (!details.lastEventDate) {
                this.log(`WARN ${details.name} — lastEventDate non trovata, player non escluso per inattività`);
            } else {
                const lastDate = new Date(details.lastEventDate);
                if (isNaN(lastDate.getTime())) {
                    this.log(`WARN ${details.name} — data non parsabile: "${details.lastEventDate}", player non escluso per inattività`);
                } else {
                    const now = Date.now();
                    const daysSince = (now - lastDate.getTime()) / (1000 * 60 * 60 * 24);
                    if (daysSince > 60) {
                        this.log(`ESCLUSO (inattivo) ${details.name} — ultimo evento: ${details.lastEventDate} (${Math.round(daysSince)} giorni fa)`);
                        return { ...details, inactive: true };
                    }
                }
            }

            this.log(`OK ${details.name} — PR: ${details.pr ?? 'N/A'} | Earnings: $${details.earnings} | Tornei: ${details.top10Tournaments.length} | Con PR: ${details.top10Tournaments.filter(t => t.prEarned > 0).length}`);
            if (details.top10Tournaments.length > 0) {
                details.top10Tournaments.forEach((t, i) => {
                    this.log(`   [${i + 1}] ${t.name} → #${t.placement} (PR: ${t.prEarned})`);
                });
            }

            return details;

        } catch (e) {
            this.log(`ESCLUSO (errore scraping) ${player.name} — ${e.message}`);
            return {
                name: player.name,
                profileUrl: player.profileUrl,
                pr: null,
                earnings: 0,
                top10Tournaments: [],
                lastUpdated: new Date().toISOString(),
                success: false
            };
        } finally {
            if (browser) await browser.close().catch(() => {});
        }
    }

    // ─── SCRAPE PLAYER PROFILE ───────────────────────────────────────────────────

    async scrapePlayerProfile(player, page) {
        await page.goto(player.profileUrl, {
            waitUntil: 'domcontentloaded',
            timeout: this.config.profileTimeout
        });

        await this.humanBehavior(page);

        try {
            await page.waitForSelector('#profile-header', { timeout: 20000 });
        } catch {
            this.log(`Timeout profile header per: ${player.name}`);
        }

        await this.delay(3000);

        try {
            await page.waitForSelector('tr.profile-event-row', { timeout: 20000 });
        } catch {
            this.log(`Timeout tornei per: ${player.name}, provo comunque`);
        }

        await this.delay(2000);

        const stats = await page.evaluate(() => {
            const data = { name: null, pr: null, earnings: 0, tournaments: [] };

            // ── NOME ──────────────────────────────────────────────────────────────
            const nameEl = document.querySelector('#profile-header .profile-header-user__nickname');
            if (nameEl) data.name = nameEl.textContent.trim();

            // ── PR ────────────────────────────────────────────────────────────────
            const totalsItems = document.querySelectorAll(
                '.profile-events-totals__item, .profile-events-totals > div, .profile-events-totals > *'
            );
            totalsItems.forEach(item => {
                const label = item.querySelector('[class*="label"]');
                const value = item.querySelector('.profile-events-totals__value');
                if (label && value) {
                    const labelText = label.textContent.trim().toLowerCase();
                    if (labelText.includes('power ranking') || labelText === 'pr') {
                        const num = parseInt(value.textContent.trim().replace(/[,\s]/g, ''));
                        if (!isNaN(num)) data.pr = num;
                    }
                }
            });
            if (data.pr === null) {
                document.querySelectorAll('.profile-events-totals__value').forEach(el => {
                    const num = parseInt(el.textContent.trim().replace(/[,\s]/g, ''));
                    if (!isNaN(num) && num > 100 && data.pr === null) data.pr = num;
                });
            }

            // ── EARNINGS ──────────────────────────────────────────────────────────
            document.querySelectorAll('.profile-table-row__value').forEach(el => {
                const text = el.textContent.trim();
                if (text.startsWith('$')) {
                    const num = parseInt(text.replace(/[$,\s]/g, ''));
                    if (!isNaN(num) && num > data.earnings) data.earnings = num;
                }
            });

            // ── TORNEI ────────────────────────────────────────────────────────────
            const allTournaments = [];
            document.querySelectorAll('tr.profile-event-row').forEach(row => {
                const pointsEl = row.querySelector('div.profile-event-row__points');
                if (!pointsEl) return;
                const prText = Array.from(pointsEl.childNodes)
                    .filter(n => n.nodeType === 3)
                    .map(n => n.textContent.trim())
                    .join('')
                    .replace(/,/g, '');
                const prEarned = parseFloat(prText) || 0;
                if (prEarned < 0) return;

                const placementEl = row.querySelector('a.profile-event-row__placement');
                if (!placementEl) return;
                const placement = parseInt(placementEl.textContent.trim().replace('#', '').replace(/,/g, ''));
                if (isNaN(placement)) return;

                const titleEl = row.querySelector('.profile-event-row__title');
                const tourName = titleEl ? titleEl.textContent.trim() : 'Tournament';

                allTournaments.push({ name: tourName, placement, prEarned });
            });
            data.tournaments = allTournaments.slice(0, 10);

            // ── LAST EVENT DATE ───────────────────────────────────────────────────
            // Cerca il primo elemento che corrisponde a un pattern data (es. "May 13, 2025")
            const datePattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},\s+\d{4}$/i;
            const allDateItems = document.querySelectorAll('tr.profile-event-row div.profile-event-row__item');
            data.lastEventDate = null;
            for (const el of allDateItems) {
                const text = el.textContent.trim();
                if (datePattern.test(text)) {
                    data.lastEventDate = text;
                    break;
                }
            }

            return data;
        });

        return {
            name: stats.name || player.name,
            profileUrl: player.profileUrl,
            pr: stats.pr,
            earnings: stats.earnings,
            top10Tournaments: stats.tournaments,
            lastEventDate: stats.lastEventDate || null,
            lastUpdated: new Date().toISOString(),
            success: true
        };
    }

    // ─── TALENT SCORE ────────────────────────────────────────────────────────────

    computeTalentScores(players) {
        // Criteri di esclusione con log esplicito per ogni player scartato
        const eligible = players.filter(p => {
            if (!p.success) {
                // già loggato in scrapePlayerWithOwnBrowser, ma riloghiamo per chiarezza
                return false;
            }
            if (!p.pr || p.pr === 0) {
                this.log(`ESCLUSO (PR=0 o null) ${p.name}`);
                return false;
            }
            const eventsWithPR = p.top10Tournaments.filter(t => t.prEarned > 0).length;
            if (eventsWithPR < 6) {
                this.log(`ESCLUSO (solo ${eventsWithPR} eventi con PR > 0, minimo 6) ${p.name}`);
                return false;
            }
            return true;
        });

        if (eligible.length === 0) {
            return players.map(p => ({ ...p, talentScore: null, talentMetrics: null, eligible: false }));
        }

        // Calcolo metriche grezze
        const metrics = eligible.map(p => {
            const events = p.top10Tournaments;
            const eventsWithPR = events.filter(t => t.prEarned > 0);

            // RPQ: media pesata (eventi 0-3 peso 1.5, eventi 4-9 peso 1.0)
            let weightedSum = 0, weightTotal = 0;
            events.forEach((t, i) => {
                const w = i < 4 ? 1.5 : 1.0;
                weightedSum += t.prEarned * w;
                weightTotal += w;
            });
            const RPQ = weightTotal > 0 ? weightedSum / weightTotal : 0;

            // GT: ratio media(eventi 0-3) / media(eventi 4-9), cappato [0.2, 2.5]
            const recent4 = events.slice(0, 4);
            const older6  = events.slice(4, 10);
            const avgRecent = recent4.length > 0 ? recent4.reduce((s, t) => s + t.prEarned, 0) / recent4.length : 0;
            const avgOlder  = older6.length  > 0 ? older6.reduce((s, t) => s + t.prEarned, 0)  / older6.length  : 0;
            let GT;
            if (avgOlder > 0) {
                GT = avgRecent / avgOlder;
            } else {
                GT = avgRecent > 0 ? 2.5 : 1.0;
            }
            GT = Math.max(0.2, Math.min(2.5, GT));

            // F: frequenza = count(PR > 0) / 10
            const F = eventsWithPR.length / 10;

            // PRI: peak recentness index — top 3 per PR, posizione media (1 = più recente)
            const indexed = events.map((t, i) => ({ prEarned: t.prEarned, position: i + 1 }));
            const top3    = [...indexed].sort((a, b) => b.prEarned - a.prEarned).slice(0, 3);
            const avgPos  = top3.length > 0 ? top3.reduce((s, t) => s + t.position, 0) / top3.length : 5.5;
            const PRI = 1 - (avgPos - 1) / 9;

            // E: earnings invertite — chi ha guadagnato poco e' ancora sotto il radar del mercato
            // 1/(1+earnings): earnings=0 -> E=1.0 (massimo), earnings alte -> E tende a 0
            const E = 1 / (1 + (p.earnings || 0));

            return { player: p, RPQ, GT, F, PRI, E };
        });

        // US: undervaluation signal — rank-based
        // Ordina per RPQ desc → rpqRank; ordina per PR desc → prRank
        // US = max(0, (prRank - rpqRank) / N)
        // Chi produce molto ma ha PR basso → prRank alto (scarso), rpqRank basso (buono) → US alta
        {
            const N = metrics.length;
            const byRPQ = [...metrics].sort((a, b) => b.RPQ - a.RPQ);
            const byPR  = [...metrics].sort((a, b) => (b.player.pr ?? 0) - (a.player.pr ?? 0));
            const rpqRankMap = new Map();
            const prRankMap  = new Map();
            byRPQ.forEach((m, i) => rpqRankMap.set(m.player.name, i + 1));
            byPR.forEach((m,  i) => prRankMap.set(m.player.name,  i + 1));
            metrics.forEach(m => {
                const rpqRank = rpqRankMap.get(m.player.name);
                const prRank  = prRankMap.get(m.player.name);
                m.US = Math.max(0, (prRank - rpqRank) / N);
            });
        }

        // Min-max normalizzazione [0.01, 1.0] per ogni metrica
        // Il floor a 0.01 evita che il peggiore del pool azzeri la formula moltiplicativa
        for (const key of ['RPQ', 'GT', 'F', 'US', 'PRI', 'E']) {
            const values = metrics.map(m => m[key]);
            const min = Math.min(...values);
            const max = Math.max(...values);
            metrics.forEach(m => {
                m[`${key}_n`] = max > min
                    ? 0.01 + 0.99 * (m[key] - min) / (max - min)
                    : 0.5;
            });
        }

        // Score moltiplicativo
        metrics.forEach(m => {
            m.talentScore =
                Math.pow(m.RPQ_n, 0.30) *
                Math.pow(m.US_n,  0.25) *
                Math.pow(m.F_n,   0.15) *
                Math.pow(m.GT_n,  0.15) *
                Math.pow(m.PRI_n, 0.10) *
                Math.pow(m.E_n,   0.05);
        });

        // Mappa nome → score
        const scoreMap = {};
        metrics.forEach(m => {
            scoreMap[m.player.name] = {
                talentScore: parseFloat(m.talentScore.toFixed(6)),
                talentMetrics: {
                    RPQ: parseFloat(m.RPQ.toFixed(2)),
                    GT:  parseFloat(m.GT.toFixed(3)),
                    E:   parseFloat(m.E.toFixed(4)),
                    F:   parseFloat(m.F.toFixed(2)),
                    US:  parseFloat(m.US.toFixed(3)),
                    PRI: parseFloat(m.PRI.toFixed(3))
                }
            };
        });

        return players.map(p => {
            if (scoreMap[p.name]) {
                return { ...p, ...scoreMap[p.name], eligible: true };
            }
            return { ...p, talentScore: null, talentMetrics: null, eligible: false };
        });
    }

    // ─── UTILITY ─────────────────────────────────────────────────────────────────

    deduplicatePlayers(players) {
        const seen = new Set();
        return players.filter(p => {
            const key = p.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    async initLeaderboardBrowser() {
        const result = await connect({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--lang=it-IT,it,en-US,en',
                '--window-size=1920,1080',
                '--window-position=-32000,-32000'
            ],
            turnstile: true,
            connectOption: { defaultViewport: this.config.viewport },
            disableXvfb: true
        });

        this.browser = result.browser;
        this.page    = result.page;
        await this.page.setUserAgent(this.config.userAgent);
        this.log('Browser reale avviato (Cloudflare bypass attivo)');
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close().catch(() => {});
            this.browser = null;
            this.page    = null;
        }
    }

    async humanBehavior(page) {
        try {
            await page.evaluate(async () => {
                await new Promise(resolve => {
                    let scrolled = 0;
                    const total = Math.floor(Math.random() * 600) + 300;
                    const timer = setInterval(() => {
                        window.scrollBy(0, 40);
                        scrolled += 40;
                        if (scrolled >= total) { clearInterval(timer); resolve(); }
                    }, 80);
                });
            });
            const x = Math.floor(Math.random() * 800) + 100;
            const y = Math.floor(Math.random() * 400) + 100;
            await page.mouse.move(x, y, { steps: 10 });
            await this.delay(Math.floor(Math.random() * 1000) + 500);
        } catch {}
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    log(message) {
        const ts  = new Date().toISOString();
        const msg = `[${ts}] ${message}`;
        console.log(msg);
        fs.appendFile(this.logFile, msg + '\n').catch(() => {});
    }

    // ─── LOOKUP SINGOLO PLAYER ───────────────────────────────────────────────────

    async lookupPlayer(profileUrl) {
        if (!profileUrl || !profileUrl.includes('fortnitetracker.com')) {
            throw new Error('URL non valido. Inserisci un link di fortnitetracker.com');
        }

        // Estrai nome dall'URL come placeholder finché non lo scrapiamo
        const namePart = decodeURIComponent(profileUrl.split('/').pop() || 'Unknown');
        const player   = { name: namePart, profileUrl };

        this.log(`Lookup singolo player: ${profileUrl}`);
        const details = await this.scrapePlayerWithOwnBrowser(player);

        // Calcola talent score nel contesto del pool attuale (esclude eventuali copie dello stesso player)
        const existingData = await this.getLatestStats();
        const pool = (existingData.players || []).filter(p => p.profileUrl !== profileUrl && p.name !== details.name);

        const tempPool = [...pool, details];
        const scored   = this.computeTalentScores(tempPool);

        const result = scored.find(p => p.profileUrl === profileUrl || p.name === details.name);
        return result || details;
    }

    getStatus() {
        return { isRunning: this.isRunning };
    }
}

module.exports = TalentScraper;
