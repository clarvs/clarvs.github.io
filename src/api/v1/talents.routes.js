'use strict';
const router = require('express').Router();
const { Parser } = require('expr-eval');
const { supabase } = require('../../config/supabase');
const { requireAuth } = require('../../middleware/auth');
const { talentScraper } = require('../../config/scraper');

const exprParser = new Parser();

// === SSRF PROTECTION — URL validation for scraper endpoints ===
function validateScraperUrl(url) {
  if (!url || typeof url !== 'string') return false;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  // Solo HTTPS
  if (parsed.protocol !== 'https:') return false;

  // Allowlist domini
  const ALLOWED_DOMAINS = ['fortnitetracker.com', 'tracker.gg'];
  const hostname = parsed.hostname.toLowerCase();
  const isAllowed = ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  if (!isAllowed) return false;

  // Block IP privati (anche se la domain resolution potrebbe risolvere a IP privati,
  // questo blocca URL con IP diretti)
  const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|169\.254\.|::1|localhost)/i;
  if (privateIpRegex.test(hostname)) return false;

  return true;
}


// === API ENDPOINTS TALENT SCOUTING ===
router.get('/stats', async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        const stats = await talentScraper.getLatestStats();
        // Paginazione opzionale: se non specificata restituisce tutto (backward compat)
        if (req.query.page !== undefined || req.query.limit !== undefined) {
            const page = Math.max(0, parseInt(req.query.page) || 0);
            const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 100));
            const players = stats.players || [];
            const paginated = players.slice(page * limit, (page + 1) * limit);
            return res.json({ ...stats, players: paginated, page, limit, total: players.length });
        }
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// GET /api/talents/urls
router.get('/urls', async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ urls: [] });
        const urls = await talentScraper.getUrls();
        res.json({ urls });
    } catch (e) {
        res.status(500).json({ urls: [] });
    }
});

// POST /api/talents/urls/add
router.post('/urls/add', requireAuth, async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL mancante' });
        const urls = await talentScraper.getUrls();
        if (!urls.includes(url)) {
            urls.push(url);
            await talentScraper.saveUrls(urls);
        }
        res.json({ success: true, urls });
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// DELETE /api/talents/urls/remove
router.delete('/urls/remove', requireAuth, async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        const { index } = req.body;
        const urls = await talentScraper.getUrls();
        if (index >= 0 && index < urls.length) {
            urls.splice(index, 1);
            await talentScraper.saveUrls(urls);
        }
        res.json({ success: true, urls });
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// POST /api/talents/run
router.post('/run', requireAuth, async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        talentScraper.runScraping().catch(e => console.error('❌ Errore talent scraping:', e));
        res.json({ success: true, message: 'Talent scouting avviato in background' });
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// GET /api/talents/status
router.get('/status', (req, res) => {
    try {
        if (!talentScraper) return res.json({ isRunning: false });
        res.json(talentScraper.getStatus());
    } catch (e) {
        res.status(500).json({ error: 'Errore interno server' });
    }
});


// POST /api/talents/lookup — scrapa un singolo profilo e restituisce le sue stats
router.post('/lookup', requireAuth, async (req, res) => {
    try {
        if (!talentScraper) return res.status(503).json({ error: 'Scraper non disponibile' });
        const { profileUrl, save } = req.body;
        if (!profileUrl) return res.status(400).json({ error: 'profileUrl mancante' });
        if (!validateScraperUrl(profileUrl)) {
          return res.status(400).json({ error: 'URL non valido o dominio non autorizzato' });
        }
        const result = await talentScraper.lookupPlayer(profileUrl);
        
        // Se richiesto il salvataggio, inserisci/aggiorna nel pool scouting
        if (save && result && result.success !== false) {
            await supabase.from('talent_stats').upsert({
                name: result.name,
                pr: result.pr || 0,
                pr_recent10: result.prRecent10 || 0,
                pr_recent10_sample_size: result.prRecent10SampleSize || 0,
                earnings: result.earnings || 0,
                profile_url: result.profileUrl,
                top10_tournaments: result.top10Tournaments || [],
                last_event_date: result.lastEventDate,
                success: true,
                eligible: result.eligible !== false,
                inactive: !!result.inactive
            }, { onConflict: 'name' });
        }

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// GET /api/talents/formula
router.get('/formula', async (req, res) => {
    try {
        const { data, error } = await supabase.from('talent_formula_config').select('*');
        if (error) throw error;
        res.json(data || []);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/talents/formula
router.put('/formula', requireAuth, async (req, res) => {
    try {
        const {
            key, expression, phase, label, description,
            is_active, min_range, max_range, weight, normalization_enabled
        } = req.body;

        if (!key || !expression) return res.status(400).json({ error: 'key e expression richiesti' });

        // ... (Key validation check logic remains same)
        if (!/^[A-Z][A-Z0-9]{0,19}$/.test(key)) {
            return res.status(400).json({ error: 'Key non valida.' });
        }
        if (phase !== undefined && parseInt(phase) === 0) {
            return res.status(400).json({ error: "Solo l'owner può gestire la Phase 0 (SCORE)." });
        }

        const row = {
            key,
            expression
        };
        if (phase !== undefined) row.phase = parseInt(phase);
        if (label !== undefined) row.label = label;
        if (description !== undefined) row.description = description;
        if (is_active !== undefined) row.is_active = is_active;
        if (min_range !== undefined) row.min_range = parseFloat(min_range);
        if (max_range !== undefined) row.max_range = parseFloat(max_range);
        if (weight !== undefined) row.weight = parseFloat(weight);
        if (normalization_enabled !== undefined) row.normalization_enabled = normalization_enabled;
        if (req.body.ui_config !== undefined) row.ui_config = req.body.ui_config;

        const { error } = await supabase.from('talent_formula_config').upsert(row, { onConflict: 'key' });
        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/talents/formula/custom (Nuova metrica)
router.post('/formula/custom', requireAuth, async (req, res) => {
    try {
        const {
            key, expression, phase, label, description,
            is_active, min_range, max_range, weight, normalization_enabled
        } = req.body;

        if (!key || !expression || phase === undefined) return res.status(400).json({ error: 'campi obbligatori mancanti' });

        if (!/^[A-Z][A-Z0-9]{0,19}$/.test(key)) {
            return res.status(400).json({ error: 'Key non valida.' });
        }
        if (parseInt(phase) === 0) return res.status(400).json({ error: 'Solo l\'owner può gestire la Phase 0 (SCORE).' });

        // Verifica esistenza
        const { data: existing } = await supabase.from('talent_formula_config').select('key').eq('key', key).single();
        if (existing) return res.status(409).json({ error: 'Metrica già esistente' });

        const { error } = await supabase.from('talent_formula_config').insert({
            key, expression,
            phase: parseInt(phase),
            label, description,
            is_active: is_active !== false,
            min_range: parseFloat(min_range) || 0,
            max_range: parseFloat(max_range) || 100,
            weight: parseFloat(weight) || 0,
            normalization_enabled: normalization_enabled !== false,
            is_default: false,
            ui_config: req.body.ui_config || {}
        });
        if (error) throw error;
        res.status(201).json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/talents/preview — Anteprima formula su un player reale
router.get('/preview', requireAuth, async (req, res) => {
    try {
        const { expression, phase, playerName } = req.query;
        if (!expression || phase === undefined) return res.status(400).json({ error: 'expression e phase richiesti' });

        // 1. Prendi un player di esempio e tutti i dati per i rank
        const { data: allPlayers, error } = await supabase.from('talent_stats')
            .select('name, pr, earnings, pr_recent10, avg_top, avg_top_recent10, events_total, top10_tournaments')
            .limit(500);

        if (error) throw error;
        if (!allPlayers || allPlayers.length === 0) return res.status(404).json({ error: 'Nessun player nel pool per l\'anteprima' });

        // 2. Carica configurazione formule corrente (per dipendenze phase 2)
        const { data: currentConfigs } = await supabase.from('talent_formula_config').select('*');
        const formulaConfig = {};
        (currentConfigs || []).forEach(c => formulaConfig[c.key] = c);

        // 3. Simula calcolo — usa expr-eval (sandboxed, no new Function)
        const evalExpr = (expr, ctx) => {
            try {
                // Normalizza: Math.log() => log() ecc. (expr-eval ha funzioni math built-in)
                const normalized = expr.replace(/Math./g, '');
                const { Math: _m, ...evalCtx } = ctx;
                return exprParser.evaluate(normalized, evalCtx);
            } catch (e) { return 0; }
        };

        let sample = allPlayers[0];
        if (playerName) {
            const found = allPlayers.find(p => p.name === playerName);
            if (found) sample = found;
        }

        const N = allPlayers.length;

        let result = 0;
        const events = sample.top10_tournaments || [];

        // Contesto unificato: grezze + contestuali (rank, percentili, PR_DENSITY, rank_delta_raw)
        const calcPercentile = (rank, total) => total <= 1 ? 1.0 : 1.0 - ((rank - 1) / (total - 1));
        const eventsTotal = sample.events_total || events.length || 0;

        const prRank = [...allPlayers].sort((a, b) => (b.pr || 0) - (a.pr || 0)).findIndex(p => p.name === sample.name) + 1;
        const earnRank = [...allPlayers].sort((a, b) => (b.earnings || 0) - (a.earnings || 0)).findIndex(p => p.name === sample.name) + 1;
        const prDensityRank = [...allPlayers]
            .map(p => ({ name: p.name, val: p.pr > 0 ? ((p.pr_recent10 || 0) / p.pr) : 0 }))
            .sort((a, b) => b.val - a.val)
            .findIndex(p => p.name === sample.name) + 1;

        const prDensity = sample.pr > 0 ? ((sample.pr_recent10 || 0) / sample.pr) : 0;
        const rankDeltaRaw = N >= 2 ? (prRank - prDensityRank) / N : 0;

        const ctx = {
            pr: sample.pr || 0,
            earnings: sample.earnings || 0,
            events_total: eventsTotal, eventsTotal,
            avg_top: sample.avg_top || 0,
            avg_top_recent10: sample.avg_top_recent10 || 0,
            avg_pr_recent10: Math.floor((sample.pr_recent10 || 0) / 10),
            N, Math,
            prRank,
            earningsRank: earnRank,
            prPercentile: calcPercentile(prRank, N),
            earningsPercentile: calcPercentile(earnRank, N),
            PR_DENSITY: prDensity,
            rank_delta_raw: rankDeltaRaw
        };

        result = evalExpr(expression, ctx);

        res.json({
            playerName: sample.name,
            result: result,
            poolAvg: 0, // Opzionale
            percentile: 50 // Opzionale
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/talents/formula
router.delete('/formula', requireAuth, async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) return res.status(400).json({ error: 'key richiesta' });

        // Controlla is_default sul DB — non una lista hardcoded
        const { data: existing, error: fetchErr } = await supabase
            .from('talent_formula_config')
            .select('is_default')
            .eq('key', key)
            .single();

        if (fetchErr || !existing) return res.status(404).json({ error: 'Metrica non trovata' });
        if (existing.is_default === true) {
            return res.status(403).json({ error: 'Le metriche di sistema non si eliminano. Usa Reset per ripristinare il default.' });
        }

        const { error } = await supabase.from('talent_formula_config').delete().eq('key', key);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

