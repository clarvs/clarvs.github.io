'use strict';
const router = require('express').Router();
const { requireAuth } = require('../../middleware/auth');
const { fortniteScaper } = require('../../config/scraper');

// GET /players/stats - Ottieni statistiche di tutti i player
router.get('/players/stats', async (req, res) => {
    try {
        if (!fortniteScaper) {
            return res.status(503).json({
                error: 'Scraper non disponibile',
                players: []
            });
        }

        const stats = await fortniteScaper.getLatestStats();
        res.json({
            success: true,
            lastUpdate: stats.lastUpdate,
            players: stats.players || []
        });

    } catch (error) {
        console.error('Errore API /api/players/stats:', error);
        res.status(500).json({
            error: 'Errore interno server',
            players: []
        });
    }
});

// GET /players/stats/:playerName - Ottieni stats di un player specifico
router.get('/players/stats/:playerName', async (req, res) => {
    try {
        if (!fortniteScaper) {
            return res.status(503).json({ error: 'Scraper non disponibile' });
        }

        const playerName = req.params.playerName;
        const stats = await fortniteScaper.getLatestStats();
        const player = stats.players?.find(p =>
            p.name.toLowerCase() === playerName.toLowerCase()
        );

        if (!player) {
            return res.status(404).json({ error: 'Player non trovato' });
        }

        res.json({
            success: true,
            player: player
        });

    } catch (error) {
        console.error('Errore API player ' + req.params.playerName + ':', error);
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// POST /scraper/run - Avvia scraping manualmente (per test/admin)
router.post('/scraper/run', requireAuth, async (req, res) => {
    try {
        if (!fortniteScaper) {
            return res.status(503).json({ error: 'Scraper non disponibile' });
        }

        const { trigger = 'manual' } = req.body;

        // Avvia scraping in background
        fortniteScaper.runScraping(trigger).catch(error => {
            console.error('Errore scraping manuale:', error);
        });

        res.json({
            success: true,
            message: 'Scraping avviato',
            trigger: trigger
        });

    } catch (error) {
        console.error('Errore avvio scraping manuale:', error);
        res.status(500).json({ error: 'Errore interno server' });
    }
});

// GET /scraper/status - Stato del scraper
router.get('/scraper/status', (req, res) => {
    try {
        if (!fortniteScaper) {
            return res.json({
                available: false,
                error: 'Scraper non inizializzato'
            });
        }

        const status = fortniteScaper.getStatus();
        res.json({
            available: true,
            ...status
        });

    } catch (error) {
        console.error('Errore status scraper:', error);
        res.status(500).json({ error: 'Errore interno server' });
    }
});

module.exports = router;
