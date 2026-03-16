/**
 * FORTNITE TRACKER WEB SCRAPER
 * Usa puppeteer-real-browser (stesso del talent scraper) per bypassare Cloudflare.
 * Il browser reale con turnstile:true risolve automaticamente i challenge.
 * Scheduling: ogni notte alle 01:00
 */

const { connect } = require('puppeteer-real-browser');
const cron = require('node-cron');
const fs   = require('fs').promises;
const path = require('path');
const { supabase } = require('../supabase');

// Mutex in-process: previene esecuzioni concorrenti anche su eccezione
let _scraperLock = false;

class FortniteTrackerScraper {
    constructor(options = {}) {
        this.isRunning = false;
        this.browser   = null;
        this.page      = null;
        this.enableScheduling  = options.enableScheduling  !== false;
        this.enableStartupTest = options.enableStartupTest !== false;

        this.config = {
            userAgent:            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport:             { width: 1920, height: 1080 },
            delayBetweenPlayers:  25000,
            requestTimeout:       45000,
        };

        this.players = []; // caricati async in runScraping()


        this.setupDirectories();

        if (this.enableScheduling) {
            this.initScheduler();
        }
    }

    async setupDirectories() {
        try {
            await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        } catch {}
    }

    initScheduler() {
        cron.schedule('0 1 * * *', () => {
            this.log('[01:00] Avvio scraping pianificato');
            this.runScraping('scheduled');
        });

        if (this.enableStartupTest) {
            setTimeout(() => {
                this.log('[DEV] Test scraping all\'avvio');
                this.runScraping('startup_test');
            }, 5000);
        }
    }

    async runScraping(trigger = 'manual') {
        if (_scraperLock) {
            this.log('[scraper] Gia in esecuzione, richiesta ignorata');
            return { skipped: true, reason: 'already_running' };
        }
        _scraperLock = true;
        // Ricarica roster da Supabase ad ogni scansione
        try {
            const { data: roster } = await supabase.from("roster").select("*").not("ft_tracker_url", "is", null);
            this.players = (roster || []).map(function(p) { return {
                name:     p.name,
                url:      p.ft_tracker_url,
                username: p.ft_tracker_username,
                platform: p.ft_platform,
                region:   p.ft_region || undefined
            }; });
            this.log("Player da scansionare: " + this.players.length);
        } catch (e) {
            this.log("Errore rilettura roster: " + e.message);
        }
        this.log(`Inizio scraping (trigger: ${trigger})`);

        try {
            const results = [];
            const batchSize = 10;
            const totalBatches = Math.ceil(this.players.length / batchSize);

            for (let i = 0; i < this.players.length; i += batchSize) {
                const batch = this.players.slice(i, i + batchSize);
                const batchNum = Math.floor(i / batchSize) + 1;
                this.log(`Batch ${batchNum}/${totalBatches}: parallelo [${batch.map(p => p.name).join(', ')}]`);

                const batchResults = await Promise.allSettled(
                    batch.map(player => this.scrapePlayerIndependent(player))
                );

                batchResults.forEach((result, idx) => {
                    if (result.status === 'fulfilled') {
                        results.push(result.value);
                    } else {
                        this.log(`[${batch[idx].name}] Fallito: ${result.reason}`);
                        results.push(this.createDefaultStats(batch[idx]));
                    }
                });

                if (i + batchSize < this.players.length) {
                    this.log('Pausa 5s tra batch...');
                    await this.delay(5000);
                }
            }

            await this.saveStats(results);
            this.log(`Scraping completato. Players aggiornati: ${results.length}`);

        } catch (error) {
            this.log(`Errore generale scraping: ${error.message}`);
        } finally {
            _scraperLock = false;
        }
    }

    // ─── SCRAPING INDIPENDENTE (browser proprio per ogni player) ─────────────
    async scrapePlayerIndependent(player, maxRetries = 2) {
        let browser = null;
        let page    = null;

        const initBr = async () => {
            if (browser) { try { await browser.close(); } catch {} browser = null; page = null; }
            const args = [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--lang=en-US,en',
                `--window-size=${this.config.viewport.width},${this.config.viewport.height}`,
                '--window-position=-32000,-32000',
            ];
            const result = await connect({
                headless: false,
                args,
                turnstile: true,
                connectOption: { defaultViewport: this.config.viewport },
                disableXvfb: true
            });
            browser = result.browser;
            page    = result.page;
            await page.setUserAgent(this.config.userAgent);
            this.log(`[${player.name}] Browser avviato`);
        };

        const closeBr = async () => {
            if (browser) { try { await browser.close(); } catch {} browser = null; page = null; }
        };

        const totalAttempts = maxRetries + 1;
        for (let attempt = 1; attempt <= totalAttempts; attempt++) {
            this.log(`[${player.name}] Tentativo ${attempt}/${totalAttempts}`);
            try {
                await initBr();
                const stats = await this.scrapePlayerStats(player, page);
                return stats;
            } catch (error) {
                this.log(`[${player.name}] Tentativo ${attempt} fallito: ${error.message}`);
                if (attempt < totalAttempts) {
                    this.log(`[${player.name}] Riprovo tra 10s...`);
                    await this.delay(10000);
                } else {
                    this.log(`[${player.name}] Tutti i tentativi esauriti`);
                    return this.createDefaultStats(player);
                }
            } finally {
                await closeBr();
            }
        }
        return this.createDefaultStats(player);
    }

    async scrapeWithRetry(player, maxRetries = 2) {
        const totalAttempts = maxRetries + 1;

        for (let attempt = 1; attempt <= totalAttempts; attempt++) {
            this.log(`[${player.name}] Tentativo ${attempt}/${totalAttempts} — connessione diretta`);

            try {
                await this.initBrowser();
                const stats = await this.scrapePlayerStats(player);
                this.log(`Stats estratte per ${player.name} (tentativo ${attempt})`);
                return stats;
            } catch (error) {
                this.log(`Tentativo ${attempt} fallito per ${player.name}: ${error.message}`);
                await this.closeBrowser();

                if (attempt < totalAttempts) {
                    this.log(`Riprovo tra 10s...`);
                    await this.delay(10000);
                } else {
                    this.log(`Tutti i tentativi esauriti per ${player.name}`);
                    return this.createDefaultStats(player);
                }
            }
        }
        return this.createDefaultStats(player);
    }

    async initBrowser() {
        await this.closeBrowser();

        const args = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--lang=en-US,en',
            `--window-size=${this.config.viewport.width},${this.config.viewport.height}`,
            '--window-position=-32000,-32000',
        ];

        const result = await connect({
            headless: false,
            args,
            turnstile: true,
            connectOption: {
                defaultViewport: this.config.viewport
            },
            disableXvfb: true
        });

        this.browser = result.browser;
        this.page    = result.page;

        await this.page.setUserAgent(this.config.userAgent);

        this.log('Browser avviato (diretto)');
    }

    async closeBrowser() {
        if (this.browser) {
            try { await this.browser.close(); } catch {}
            this.browser = null;
            this.page    = null;
        }
    }

    async scrapePlayerStats(player, page = null) {
        if (!page) page = this.page;

        // Step 1: visita la home per stabilire sessione (Cloudflare cookie)
        this.log(`[${player.name}] Visita home fortnitetracker.com...`);
        await page.goto('https://fortnitetracker.com', {
            waitUntil: 'domcontentloaded',
            timeout:   this.config.requestTimeout
        });
        await this.humanBehavior(page);
        await this.delay(2000 + Math.random() * 2000);

        // Step 2: naviga al profilo
        this.log(`[${player.name}] Caricamento profilo: ${player.url}`);
        await page.goto(player.url, {
            waitUntil: 'domcontentloaded',
            timeout:   this.config.requestTimeout
        });

        // Attende che Cloudflare (se presente) venga risolto dal turnstile auto-clicker
        await this.waitForCloudflare(page, 45000);

        // Simulazione umana + 5 secondi extra per lasciare che la pagina si stabilizzi
        await this.humanBehavior(page);
        await this.delay(5000);
        await this.humanBehavior(page);
        await this.delay(3000);

        // Estrai statistiche competitive
        const stats = await page.evaluate(() => {
            const data = { pr: null, earnings: 0, tournaments: [], _debug: {} };
            const pageText = document.body.innerText || document.body.textContent || '';

            data._debug.pageTextLength = pageText.length;
            data._debug.pageTitle      = document.title || '';
            data._debug.isNotFound     = /not found|profile not found|no results|couldn.t find/i.test(pageText);

            if (pageText.length < 100) {
                data._debug.reason = 'page too short';
                return data;
            }

            // === POWER RANKING (selettore DOM diretto) ===
            // Prova prima con label + value abbinati
            const totalsItems = document.querySelectorAll(
                '.profile-events-totals__item, .profile-events-totals > div, .profile-events-totals > *'
            );
            totalsItems.forEach(item => {
                const label = item.querySelector('[class*="label"]');
                const value = item.querySelector('.profile-events-totals__value');
                if (label && value) {
                    const labelText = label.textContent.trim().toLowerCase();
                    if (labelText.includes('power ranking') || labelText === 'pr') {
                        const num = parseInt(value.textContent.trim().replace(/[,.\s]/g, ''));
                        if (!isNaN(num)) data.pr = num;
                    }
                }
            });
            // Fallback: prende il primo valore numeroso trovato in .profile-events-totals__value
            if (data.pr === null) {
                document.querySelectorAll('.profile-events-totals__value').forEach(el => {
                    if (data.pr !== null) return;
                    const num = parseInt(el.textContent.trim().replace(/[,.\s]/g, ''));
                    if (!isNaN(num) && num > 1000) data.pr = num;
                });
            }

            // === EARNINGS ===
            const textLines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            let maxEarnings = 0;
            for (const line of textLines) {
                const keywordMatch = line.match(/(?:Earnings?|Prize|Total|Won)[:\s]*\$?(\d{1,6})/i);
                if (keywordMatch) {
                    const amount = parseInt(keywordMatch[1].replace(/,/g, ''));
                    if (amount > maxEarnings && amount < 1000000) maxEarnings = amount;
                }
                const dollarMatch = line.match(/\$(\d{2,6})/);
                if (dollarMatch) {
                    const amount = parseInt(dollarMatch[1].replace(/,/g, ''));
                    if (amount >= 50 && amount < 1000000 && amount > maxEarnings) maxEarnings = amount;
                }
            }
            data.earnings = maxEarnings;

            // === TOURNAMENTS (selettori DOM, stesso approccio del talent scraper) ===
            data._debug.totalLines = textLines.length;

            document.querySelectorAll('tr.profile-event-row').forEach(row => {
                if (data.tournaments.length >= 5) return;

                const placementEl = row.querySelector('a.profile-event-row__placement');
                if (!placementEl) return;
                const placement = parseInt(placementEl.textContent.trim().replace('#', '').replace(/,/g, ''));
                if (isNaN(placement) || placement <= 0) return;

                const titleEl = row.querySelector('.profile-event-row__title');
                const name    = titleEl ? titleEl.textContent.trim() : null;
                if (!name) return;

                data.tournaments.push({ name, placement });
            });

            // Fallback testo se i selettori non trovano nulla (pagina non ancora renderizzata)
            if (data.tournaments.length === 0) {
                for (let i = 0; i < textLines.length && data.tournaments.length < 5; i++) {
                    const line = textLines[i];
                    const placementMatch = line.match(/#(\d{1,5})/);
                    if (!placementMatch) continue;
                    const placement = parseInt(placementMatch[1]);
                    let name = null;
                    for (let j = Math.max(0, i-5); j < i; j++) {
                        const s = textLines[j];
                        if (s.length > 5 && s.length < 120 && !/^\d+$/.test(s)) {
                            name = s;
                            break;
                        }
                    }
                    if (name) data.tournaments.push({ name, placement });
                }
            }

            return data;
        });

        const dbg = stats._debug || {};
        this.log(`[${player.name}] pageText: ${dbg.pageTextLength ?? '?'} chars | lines: ${dbg.totalLines ?? '?'} | notFound: ${dbg.isNotFound ?? false}`);
        this.log(`[${player.name}] PR: ${stats.pr} | Earnings: ${stats.earnings} | Tornei: ${stats.tournaments?.length ?? 0}`);

        if (dbg.isNotFound) {
            this.log(`[${player.name}] Pagina sembra non trovata — verifica l'URL nel roster`);
        }

        if (dbg.pageTextLength < 200) {
            throw new Error(`Pagina troppo corta (${dbg.pageTextLength} chars) — probabilmente Cloudflare`);
        }

        const { _debug, ...cleanStats } = stats;

        return {
            name:        player.name,
            username:    player.username,
            platform:    player.platform,
            lastUpdated: new Date().toISOString(),
            stats: {
                pr:          cleanStats.pr,
                earnings:    cleanStats.earnings,
                tournaments: cleanStats.tournaments
            },
            success: true
        };
    }

    // Attende che Cloudflare risolva il challenge (turnstile lo clicca automaticamente)
    async waitForCloudflare(page, maxWait = 45000) {
        const start = Date.now();
        while (Date.now() - start < maxWait) {
            try {
                const title = await page.title();
                if (title && !title.includes('Just a moment') && !title.toLowerCase().includes('cloudflare')) {
                    this.log(`Pagina caricata: "${title}"`);
                    return true;
                }
                this.log(`Cloudflare challenge... (${Math.round((Date.now() - start) / 1000)}s/${maxWait / 1000}s) — turnstile in risoluzione`);
            } catch {}
            await this.delay(3000);
        }
        this.log(`Timeout Cloudflare dopo ${maxWait / 1000}s`);
        return false;
    }

    async humanBehavior(page) {
        try {
            await page.evaluate(async () => {
                await new Promise(resolve => {
                    let scrolled = 0;
                    const total = Math.floor(Math.random() * 500) + 200;
                    const timer = setInterval(() => {
                        window.scrollBy(0, 35);
                        scrolled += 35;
                        if (scrolled >= total) { clearInterval(timer); resolve(); }
                    }, 80);
                });
            });
            const x = Math.floor(Math.random() * 700) + 100;
            const y = Math.floor(Math.random() * 400) + 100;
            await page.mouse.move(x, y, { steps: 10 });
            await this.delay(Math.random() * 800 + 400);
        } catch {}
    }

    createDefaultStats(player) {
        return {
            name:        player.name,
            username:    player.username,
            platform:    player.platform,
            lastUpdated: new Date().toISOString(),
            stats: { pr: null, earnings: 0, tournaments: [] },
            success: false
        };
    }

    async saveStats(statsArray) {
        try {
            // Batch upsert — unica chiamata DB per chunk invece di N chiamate singole
            const records = statsArray.map(function(player) {
                var tournaments = ((player.stats && player.stats.tournaments) || [])
                    .filter(function(t) { return t.placement <= 500; })
                    .map(function(t) { return { name: t.name, placement: t.placement }; })
                    .slice(0, 10);
                return {
                    player_name:  player.name,
                    username:     player.username,
                    platform:     player.platform,
                    pr:           (player.stats && player.stats.pr) || 0,
                    earnings:     (player.stats && player.stats.earnings) || 0,
                    tournaments:  tournaments,
                    success:      player.success !== false,
                    last_updated: new Date().toISOString()
                };
            });
            const BATCH_SIZE = 10;
            for (var b = 0; b < records.length; b += BATCH_SIZE) {
                var chunk = records.slice(b, b + BATCH_SIZE);
                await supabase.from('player_stats').upsert(chunk, { onConflict: 'player_name' });
            }
            this.log("Stats salvate su Supabase: " + statsArray.length + " player");
        } catch (error) {
            this.log("Errore salvataggio stats: " + error.message);
        }
    }
    async getLatestStats() {
        try {
            const { data } = await supabase.from('player_stats').select('*').order('player_name');
            if (!data || !data.length) return { lastUpdate: null, players: [] };
            const lastUpdate = data.reduce(function(m, r) { return r.last_updated > m ? r.last_updated : m; }, '');
            const players = data.map(function(r) {
                return {
                    name:        r.player_name,
                    username:    r.username,
                    platform:    r.platform,
                    lastUpdated: r.last_updated,
                    stats:       { pr: r.pr, earnings: r.earnings, tournaments: r.tournaments || [] },
                    success:     r.success
                };
            });
            return { lastUpdate, players };
        } catch (e) {
            return { lastUpdate: null, players: [] };
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    log(message) {
        // logging disabilitato
    }

    getStatus() {
        return {
            isRunning:    this.isRunning,
            playersCount: this.players.length,
            lastRun:      null
        };
    }
}

module.exports = FortniteTrackerScraper;
