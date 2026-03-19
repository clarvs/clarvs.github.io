/**
 * TALENT SCRAPER - Sistema 2
 * Scrapa classifiche Fortnite Tracker per trovare talenti.
 *
 * Per ogni player dalla classifica estrae:
 *   - Nome      â†’ #profile-header .profile-header-user__nickname
 *   - PR EU     â†’ .profile-events-totals__value (label "Power Ranking")
 *   - Earnings  â†’ .profile-table-row__value (contiene $)
 *   - Media placement â†’ ultimi 10 tornei con PR > 1
 *
 * Profili scrapati in parallelo (CONCURRENCY = 10 browser indipendenti)
 */

const { connect } = require('puppeteer-real-browser');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const { supabase } = require('../../../supabase');

// Mutex in-process: previene esecuzioni concorrenti anche su eccezione
let _scraperLock = false;
const { Parser } = require('expr-eval');
const exprParser = new Parser();

const CONCURRENCY = parseInt(process.env.SCRAPER_CONCURRENCY) || 10;




// Workaround Windows: chrome-launcher tenta di eliminare la dir temp (lighthouse.XXXXXXXX)
// con rmSync mentre Chrome ha ancora file handle aperti â†’ EPERM non-fatale.
// Intercettiamo solo questo caso specifico per non sporcare i log.
process.on('uncaughtException', err => {
    if (err.code === 'EPERM' && err.path && err.path.includes('lighthouse')) {
        // Errore non-fatale: cleanup dir temp Chrome su Windows â€” ignorato
        return;
    }
    throw err;
});

class TalentScraper {
    constructor(options = {}) {
        this.browser = null;
        this.page = null;
        this.isRunning = false;
        this.recentLogs = []; // Telemetria in-memory (ultimi 50 log)
        this.progressDone = 0;
        this.progressTotal = 0;
        this.currentPhase = '';

        this.config = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            leaderboardTimeout: 120000,
            profileTimeout: 45000
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
            await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
            await fs.mkdir(path.join(__dirname, 'config'), { recursive: true });
        } catch (e) {
            console.error('Errore creazione directory:', e.message);
        }
    }

    // â”€â”€â”€ CONFIG URLs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    async getUrls() {
        try {
            const { data } = await supabase.from("talent_urls").select("url").order("id");
            return (data || []).map(function (r) { return r.url; });
        } catch (e) { return []; }
    }
    async saveUrls(urls) {
        await supabase.from('talent_urls').delete().neq('id', 0);
        if (urls && urls.length)
            await supabase.from('talent_urls').insert(urls.map(function (u) { return { url: u }; }));
    }

    // â”€â”€â”€ STATS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    async getLatestStats() {
        try {
            const [statsRes, urlsRes, metaRes] = await Promise.all([
                supabase.from('talent_stats').select('*').order('talent_score', { ascending: false, nullsFirst: false }),
                supabase.from('talent_urls').select('url').order('id'),
                supabase.from('scraper_meta').select('value').eq('key', 'talent_last_update').single()
            ]);
            const players = (statsRes.data || []).map(function (r) {
                return {
                    name: r.name,
                    profileUrl: r.profile_url,
                    pr: r.pr,
                    prRecent10: r.pr_recent10 || 0,
                    prRecent10SampleSize: r.pr_recent10_sample_size || 0,
                    earnings: r.earnings,
                    eventsTotal: r.events_total || 0,
                    avgTop: r.avg_top !== null && r.avg_top !== undefined ? r.avg_top : null,
                    avgTopRecent10: r.avg_top_recent10 || 0,
                    top10Tournaments: r.top10_tournaments || [],
                    talentScore: r.talent_score,
                    talentMetrics: r.talent_metrics,
                    eligible: r.eligible,
                    success: true
                };
            });
            return {
                lastUpdate: (metaRes.data && metaRes.data.value) || null,
                sourceUrls: (urlsRes.data || []).map(function (r) { return r.url; }),
                players: players
            };
        } catch (e) {
            return { lastUpdate: null, sourceUrls: [], players: [] };
        }
    }

    async saveData(data) {
        try {
            if (!data.players.length) {
                this.log('saveData: nessun player, salvataggio saltato');
                return;
            }

            const records = data.players.map(p2 => ({
                name: p2.name,
                profile_url: p2.profileUrl,
                pr: p2.pr || 0,
                pr_recent10: Math.round(p2.prRecent10 || 0),
                pr_recent10_sample_size: p2.prRecent10SampleSize || 0,
                events_total: p2.eventsTotal || 0,
                avg_top: p2.avgTop !== undefined ? p2.avgTop : null,
                avg_top_recent10: p2.avgTopRecent10 || 0,
                earnings: p2.earnings || 0,
                top10_tournaments: p2.top10Tournaments || [],
                talent_score: p2.talentScore,
                talent_metrics: p2.talentMetrics || null,
                eligible: p2.eligible !== false,
                last_scraped: new Date().toISOString()
            }));

            // Deduplicazione per nome: previene 'ON CONFLICT DO UPDATE command cannot affect row a second time'
            // Causa: stesso giocatore con casing diverso da URL multipli (es. 'PlayerX' vs 'playerx')
            const seenNames = new Set();
            const uniqueRecords = records.filter(r => {
                const key = r.name.toLowerCase();
                if (seenNames.has(key)) {
                    this.log("saveData: WARN duplicato rimosso -> " + r.name);
                    return false;
                }
                seenNames.add(key);
                return true;
            });
            if (uniqueRecords.length < records.length) {
                this.log("saveData: " + (records.length - uniqueRecords.length) + " duplicati rimossi prima dell upsert");
            }

            const CHUNK = 50;
            for (let i = 0; i < uniqueRecords.length; i += CHUNK) {
                const chunk = uniqueRecords.slice(i, i + CHUNK);
                const { error: upErr } = await supabase
                    .from('talent_stats')
                    .upsert(chunk, { onConflict: 'name' });
                if (upErr) throw upErr;
                this.log(`saveData: upsert ${Math.min(i + CHUNK, uniqueRecords.length)}/${uniqueRecords.length}`);
            }

            const { data: current } = await supabase.from('talent_stats').select('name');
            const newNamesSet = new Set(data.players.map(p => p.name));
            const toDelete = (current || []).map(r => r.name).filter(n => !newNamesSet.has(n));
            if (toDelete.length > 0) {
                const { error: delErr } = await supabase.from('talent_stats').delete().in('name', toDelete);
                if (delErr) this.log(`WARN cleanup vecchi player: ${delErr.message}`);
                else this.log(`saveData: eliminati ${toDelete.length} player non piÃ¹ in classifica`);
            }

            const { error: metaErr } = await supabase.from('scraper_meta').upsert({
                key: 'talent_last_update',
                value: data.lastUpdate,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });
            if (metaErr) throw metaErr;

            this.log(`saveData: completato â€” ${records.length} player salvati`);
        } catch (e) {
            this.log('Errore saveData: ' + e.message);
        }
    }

    // --- FORMULA CONFIG (carica da Supabase, fallback ai defaults) ---

    async getFormulaConfig() {
        const config = {};
        try {
            const { data, error } = await supabase.from("talent_formula_config").select("*");
            if (error) throw error;
            (data || []).forEach(row => {
                config[row.key] = {
                    expression: row.expression,
                    phase: row.phase !== null ? row.phase : 1,
                    label: row.label || row.key,
                    description: row.description || "",
                    isCustom: true,
                    isActive: row.is_active !== false,
                    isDefault: row.is_default === true,
                    fromDb: true
                };
            });
        } catch (e) { this.log("WARN formula config: " + e.message); }
        return config;
    }

    evalExpr(expr, context) {
        try {
            // Normalize Math.xxx() calls to bare function names (expr-eval has math built-ins)
            const normalized = expr.replace(/Math./g, '');
            return exprParser.evaluate(normalized, context);
        } catch (err) {
            throw new Error("Errore formula: " + err.message);
        }
    }
    // â”€â”€â”€ MAIN FLOW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    async runScraping() {
        if (_scraperLock) {
            this.log('[scraper] Gia in esecuzione, richiesta ignorata');
            return { skipped: true, reason: 'already_running' };
        }
        _scraperLock = true;
        this.isRunning = true;
        this.progressDone = 0;
        this.progressTotal = 0;
        this.currentPhase = 'Raccolta classifiche';
        const urls = await this.getUrls();
        if (urls.length === 0) {
            this.log('Nessun URL configurato per il talent scouting');
            _scraperLock = false;
            return;
        }
        this.log(`Avvio talent scraping â€” ${urls.length} classifiche da processare`);

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
                    await this.page.goto('about:blank', { waitUntil: 'load', timeout: 10000 }).catch(() => { });
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
                    this.log(`Trovati ${players.length} player in: ${url} â†’ ${newCount} nuovi${dupCount > 0 ? `, ${dupCount} giÃ  visti (scartati)` : ''}`);
                } catch (e) {
                    this.log(`Errore classifica ${url}: ${e.message}`);
                }
            }

            await this.closeBrowser();

            // Step 2: la deduplicazione Ã¨ giÃ  avvenuta inline
            const uniquePlayers = allPlayerLinks;
            this.log(`Player unici da profilare: ${uniquePlayers.length}`);

            // Step 3: scrapa profili in parallelo (batch da CONCURRENCY)
            const detailedPlayers = [];
            const totalBatches = Math.ceil(uniquePlayers.length / CONCURRENCY);
            this.progressDone = 0;
            this.progressTotal = uniquePlayers.length;
            this.currentPhase = 'Scansione profili';

            for (let i = 0; i < uniquePlayers.length; i += CONCURRENCY) {
                const batch = uniquePlayers.slice(i, i + CONCURRENCY);
                const batchNum = Math.floor(i / CONCURRENCY) + 1;
                this.log(`Batch ${batchNum}/${totalBatches}: ${batch.length} player in parallelo`);

                const batchResults = await Promise.all(
                    batch.map(player => this.scrapePlayerWithOwnBrowser(player))
                );
                detailedPlayers.push(...batchResults);
                this.progressDone += batch.length;

                if (i + CONCURRENCY < uniquePlayers.length) {
                    this.log(`Pausa 5s tra batch...`);
                    await this.delay(5000);
                }
            }

            // Filtra player inattivi (ultimo evento > 40 giorni fa)
            const activePlayers = detailedPlayers.filter(p => !p.inactive);
            if (activePlayers.length < detailedPlayers.length) {
                this.log(`Esclusi ${detailedPlayers.length - activePlayers.length} player inattivi (ultimo evento > 40 giorni fa)`);
            }
            detailedPlayers.length = 0;
            detailedPlayers.push(...activePlayers);

            this.currentPhase = 'Calcolo Talent Score';
            // Step 4: calcola Talent Score sul pool e ordina desc
            const scoredPlayers = await this.computeTalentScores(detailedPlayers);
            scoredPlayers.sort((a, b) => {
                if (a.talentScore === null && b.talentScore === null) return 0;
                if (a.talentScore === null) return 1;
                if (b.talentScore === null) return -1;
                return b.talentScore - a.talentScore;
            });
            detailedPlayers.length = 0;
            detailedPlayers.push(...scoredPlayers);

            this.currentPhase = 'Salvataggio dati';
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
            _scraperLock = false;
            this.isRunning = false;
        }
    }

    // â”€â”€â”€ SCRAPE LEADERBOARD (browser dedicato per URL) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            if (browser) await browser.close().catch(() => { });
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
                if (['profile', 'events', 'view', 'open', 'see more'].includes(lower)) return;
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

    // â”€â”€â”€ SCRAPE SINGOLO PROFILO (browser dedicato) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

            // Controllo inattivitÃ : escludi se l'ultimo evento Ã¨ > 40 giorni fa
            if (!details.lastEventDate) {
                this.log(`WARN ${details.name} â€” lastEventDate non trovata, player non escluso per inattivitÃ `);
            } else {
                const lastDate = new Date(details.lastEventDate);
                if (isNaN(lastDate.getTime())) {
                    this.log(`WARN ${details.name} â€” data non parsabile: "${details.lastEventDate}", player non escluso per inattivitÃ `);
                } else {
                    const now = Date.now();
                    const daysSince = (now - lastDate.getTime()) / (1000 * 60 * 60 * 24);
                    if (daysSince > 40) {
                        this.log(`ESCLUSO (inattivo) ${details.name} â€” ultimo evento: ${details.lastEventDate} (${Math.round(daysSince)} giorni fa)`);
                        return { ...details, inactive: true };
                    }
                }
            }

            this.log(`OK ${details.name} â€” PR: ${details.pr ?? 'N/A'} (Recent10: ${details.prRecent10} from ${details.prRecent10SampleSize} events) | Earnings: $${details.earnings} | Tornei: ${details.top10Tournaments.length} | Con PR: ${details.top10Tournaments.filter(t => t.prEarned > 0).length} | Eventi totali: ${details.eventsTotal ?? 0}`);
            if (details.top10Tournaments.length > 0) {
                details.top10Tournaments.forEach((t, i) => {
                    this.log(`   [${i + 1}] ${t.name} â†’ #${t.placement} (PR: ${t.prEarned})`);
                });
            }

            return details;

        } catch (e) {
            this.log(`ESCLUSO (errore scraping) ${player.name} â€” ${e.message}`);
            return {
                name: player.name,
                profileUrl: player.profileUrl,
                pr: null,
                prRecent10: 0,
                prRecent10SampleSize: 0,
                earnings: 0,
                top10Tournaments: [],
                lastUpdated: new Date().toISOString(),
                success: false
            };
        } finally {
            if (browser) await browser.close().catch(() => { });
        }
    }

    // â”€â”€â”€ SCRAPE PLAYER PROFILE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            const data = { name: null, pr: null, earnings: 0, tournaments: [], eventsTotal: 0 };

            // â”€â”€ NOME â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            const nameEl = document.querySelector('#profile-header .profile-header-user__nickname');
            if (nameEl) data.name = nameEl.textContent.trim();

            // â”€â”€ PR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

            // â”€â”€ EARNINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            document.querySelectorAll('.profile-table-row__value').forEach(el => {
                const text = el.textContent.trim();
                if (text.startsWith('$')) {
                    const num = parseInt(text.replace(/[$,\s]/g, ''));
                    if (!isNaN(num) && num > data.earnings) data.earnings = num;
                }
            });

            // â”€â”€ TOTAL EVENTS (tournament count) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            try {
                // Usa direttamente il valore con title dentro profile-stat-delta__container,
                // es: <div class="profile-stat-delta__container"><div class="profile-stat__value" title="129">129</div>...</div>
                const v = document.querySelector('.profile-stat-delta__container .profile-stat__value[title]');
                if (v) {
                    const raw = v.getAttribute('title') || v.textContent;
                    const num = parseInt((raw || '').trim().replace(/[,.\s]/g, ''));
                    if (!isNaN(num)) data.eventsTotal = num;
                }
            } catch (_) { /* ignore DOM issues */ }

            // â”€â”€ TORNEI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            
            // â”€â”€ PR RECENT 10 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // Sum of PR earned in the last 10 tracked tournaments (already filtered)
            data.prRecent10 = data.tournaments.reduce((sum, t) => sum + (t.prEarned || 0), 0);
            data.prRecent10SampleSize = data.tournaments.length;
            const _placements10 = data.tournaments.map(t => t.placement || 0).filter(p => p > 0);
            data.avgTopRecent10 = _placements10.length > 0
                ? Math.floor(_placements10.reduce((a, b) => a + b, 0) / _placements10.length)
                : 0;

            // â”€â”€ AVG TOP (media top generale, primo valore float nei profile-stat) â”€â”€
            data.avgTop = null;
            const allStatVals = document.querySelectorAll('.profile-stat__value[title]');
            for (const el of allStatVals) {
                const raw = (el.getAttribute('title') || '').replace(/[,s]/g, '');
                if (raw.includes('.')) {
                    const num = parseFloat(raw);
                    if (!isNaN(num)) { data.avgTop = Math.floor(num); break; }
                }
            }

            // â”€â”€ LAST EVENT DATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // Cerca il primo elemento che corrisponde a un pattern data (es. "May 13, 2025")
            const datePatterns = [
                /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},\s+\d{4}$/i,
                /^\d{1,2}\/\d{1,2}\/\d{4}$/,
                /^\d{4}-\d{2}-\d{2}$/
            ];
            const allDateItems = document.querySelectorAll('tr.profile-event-row div.profile-event-row__item');
            data.lastEventDate = null;
            for (const el of allDateItems) {
                const text = el.textContent.trim();
                if (datePatterns.some(p => p.test(text))) {
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
            prRecent10: stats.prRecent10,
            prRecent10SampleSize: stats.prRecent10SampleSize,
            earnings: stats.earnings,
            top10Tournaments: stats.tournaments,
            eventsTotal: stats.eventsTotal || 0,
            avgTop: stats.avgTop !== null && stats.avgTop !== undefined ? Math.floor(stats.avgTop) : null,
            avgTopRecent10: stats.avgTopRecent10 || 0,
            lastEventDate: stats.lastEventDate || null,
            lastUpdated: new Date().toISOString(),
            success: true
        };
    }

    // --- TALENT SCORE ---

    async computeTalentScores(players) {
        const formulaConfig = await this.getFormulaConfig();

        const eligible = players.filter(p => {
            if (!p.success) return false;
            if (!p.pr || p.pr === 0) { this.log(`ESCLUSO (PR=0 o null) ${p.name}`); return false; }
            const eventsWithPR = p.top10Tournaments.filter(t => t.prEarned > 0).length;
            if (eventsWithPR < 6) { this.log(`ESCLUSO (solo ${eventsWithPR} eventi con PR > 0, minimo 6) ${p.name}`); return false; }
            return true;
        });

        if (eligible.length === 0) {
            return players.map(p => ({ ...p, talentScore: null, talentMetrics: null, eligible: false }));
        }

        // Separa chiavi per fase
        const phase1Keys = Object.keys(formulaConfig).filter(k => formulaConfig[k].phase === 1);
        const phase2Keys = Object.keys(formulaConfig).filter(k => formulaConfig[k].phase === 2);
        const scoreKey = "SCORE";

        const metricsPool = eligible.map(p => ({ player: p, results: {} }));

        // --- RANK BASE CALCOLATI UPFRONT (prima delle formule) ---
        // RANK CONVENTION: Inverse rank. 1 = BEST player in pool.
        const N = eligible.length;
        const calcPercentile = (rank, total) => total <= 1 ? 1.0 : 1.0 - ((rank - 1) / (total - 1));

        const prRankMap = new Map();
        const earningsRankMap = new Map();
        const prDensityRankMap = new Map();

        [...metricsPool].sort((a, b) => (b.player.pr || 0) - (a.player.pr || 0))
            .forEach((m, i) => prRankMap.set(m.player.name, i + 1));
        [...metricsPool].sort((a, b) => (b.player.earnings || 0) - (a.player.earnings || 0))
            .forEach((m, i) => earningsRankMap.set(m.player.name, i + 1));
        [...metricsPool]
            .map(m => ({ name: m.player.name, val: m.player.pr > 0 ? (m.player.prRecent10 / m.player.pr) : 0 }))
            .sort((a, b) => b.val - a.val)
            .forEach((d, i) => prDensityRankMap.set(d.name, i + 1));

        // --- UNICO PASS FORMULA (contesto completo: grezze + contestuali) ---
        const allFormulaKeys = [...phase1Keys, ...phase2Keys];
        metricsPool.forEach(m => {
            const p = m.player;
            const earnings = p.earnings || 0;
            const eventsTotal = p.eventsTotal || p.top10Tournaments.length || 0;
            const prRnk = prRankMap.get(p.name);
            const earnRnk = earningsRankMap.get(p.name);
            const prDensity = p.pr > 0 ? (p.prRecent10 / p.pr) : 0;
            const prDensityRnk = prDensityRankMap.get(p.name);
            const rankDeltaRaw = N >= 2 ? (prRnk - prDensityRnk) / N : 0;

            const ctx = {
                pr: p.pr || 0,
                earnings,
                events_total: eventsTotal, eventsTotal,
                avg_top: p.avgTop || 0,
                avg_top_recent10: p.avgTopRecent10 || 0,
                avg_pr_recent10: Math.floor((p.prRecent10 || 0) / 10),
                N,
                prRank: prRnk,
                earningsRank: earnRnk,
                prPercentile: calcPercentile(prRnk, N),
                earningsPercentile: calcPercentile(earnRnk, N),
                PR_DENSITY: prDensity,
                rank_delta_raw: rankDeltaRaw
            };

            allFormulaKeys.forEach(key => {
                try {
                    m.results[key] = this.evalExpr(formulaConfig[key].expression, ctx);
                } catch (e) {
                    this.log(`Formula ${key} error for ${p.name}: ${e.message}`);
                    m.results[key] = 0;
                }
            });

            m.results.PR_DENSITY = prDensity;
            m.results.rank_delta_raw = rankDeltaRaw;
        });

        // --- PHASE 0: SCORE ---
        // Talent Score: media diretta dei valori raw delle metriche attive, clampati 0â€“1.
        // Ogni formula deve produrre un valore in range 0â€“1 by design.
        const customMetricKeys = Object.keys(formulaConfig).filter(k => {
            if (k === scoreKey) return false;
            const cfg = formulaConfig[k];
            if (!cfg) return false;
            if (!cfg.isCustom) return false;
            if (cfg.isActive === false) return false;
            return true;
        });

        metricsPool.forEach(m => {
            if (customMetricKeys.length === 0) {
                m.talentScore = 0;
                return;
            }
            let weightedSum = 0;
            let totalWeight = 0;
            customMetricKeys.forEach(k => {
                const v = m.results[k];
                const clamped = (typeof v === "number" && isFinite(v)) ? Math.max(0, Math.min(1, v)) : 0;
                const w = (formulaConfig[k]?.weight > 0) ? formulaConfig[k].weight : 1;
                weightedSum += clamped * w;
                totalWeight += w;
            });
            m.talentScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        });

        const scoreMap = {};
        metricsPool.forEach(m => {
            const finalMetrics = {};
            // Includi nel talentMetrics SOLO le metriche che hanno una riga in talent_formula_config (fromDb=true) e sono attive
            // Esclusi: SCORE, varianti _n e helper tecnici interni.
            Object.keys(m.results).forEach(k => {
                if (k === scoreKey) return;
                if (k === "PR_DENSITY" || k === "rank_delta_raw") return;
                const cfg = formulaConfig[k];
                if (!cfg) return;
                if (cfg.fromDb !== true) return;
                if (cfg.isActive === false) return;
                finalMetrics[k] = parseFloat((m.results[k] || 0).toFixed(4));
            });

            scoreMap[m.player.name] = {
                talentScore: parseFloat((m.talentScore || 0).toFixed(6)),
                talentMetrics: finalMetrics
            };
        });

        return players.map(p => {
            if (scoreMap[p.name]) return { ...p, ...scoreMap[p.name], eligible: true };
            return { ...p, talentScore: null, talentMetrics: null, eligible: false };
        });
    }

    // â”€â”€â”€ UTILITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        this.page = result.page;
        await this.page.setUserAgent(this.config.userAgent);
        this.log('Browser reale avviato (Cloudflare bypass attivo)');
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close().catch(() => { });
            this.browser = null;
            this.page = null;
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
        } catch { }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    log(message) {
        // Telemetria: buffer rolling in-memory
        this.recentLogs.push(message);
        if (this.recentLogs.length > 50) this.recentLogs.shift();
        const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
        console.log(`[TalentScraper ${ts}] ${message}`);
    }

    // â”€â”€â”€ LOOKUP SINGOLO PLAYER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    async lookupPlayer(profileUrl) {
        if (!profileUrl || !profileUrl.includes('fortnitetracker.com')) {
            throw new Error('URL non valido. Inserisci un link di fortnitetracker.com');
        }

        // Estrai nome dall'URL come placeholder finchÃ© non lo scrapiamo
        const namePart = decodeURIComponent(profileUrl.split('/').pop() || 'Unknown');
        const player = { name: namePart, profileUrl };

        this.log(`Lookup singolo player: ${profileUrl}`);
        const details = await this.scrapePlayerWithOwnBrowser(player);

        // Calcola talent score nel contesto del pool attuale (esclude eventuali copie dello stesso player)
        const existingData = await this.getLatestStats();
        const pool = (existingData.players || []).filter(p => p.profileUrl !== profileUrl && p.name !== details.name);

        const tempPool = [...pool, details];
        const scored = await this.computeTalentScores(tempPool);

        const result = scored.find(p => p.profileUrl === profileUrl || p.name === details.name);
        return result || details;
    }

    getStatus() {
        const pct = this.progressTotal > 0
            ? Math.round((this.progressDone / this.progressTotal) * 100)
            : 0;
        return {
            isRunning: this.isRunning,
            logs: this.recentLogs.slice(-20),
            progress: {
                done: this.progressDone,
                total: this.progressTotal,
                pct,
                phase: this.currentPhase
            }
        };
    }
}

module.exports = TalentScraper;
