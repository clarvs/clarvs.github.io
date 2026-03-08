/**
 * Script standalone per GitHub Actions.
 * Esegue team scraper poi talent scraper in sequenza e termina.
 */

const FortniteTrackerScraper = require('./fortnite-tracker-scraper');
const TalentScraper = require('./talent-scraper');

async function run() {
    console.log('=== STANDALONE SCRAPER AVVIATO ===');
    console.log('Data:', new Date().toISOString());

    // ── TEAM SCRAPER ────────────────────────────────────────────────────────────
    console.log('\n--- Team Scraper ---');
    const teamScraper = new FortniteTrackerScraper({
        enableScheduling:  false,
        enableStartupTest: false
    });

    try {
        await teamScraper.runScraping('github_actions');
        console.log('Team scraper completato');
    } catch (e) {
        console.error('Errore team scraper:', e.message);
    }

    // Pausa tra i due scraper
    await new Promise(r => setTimeout(r, 10000));

    // ── TALENT SCRAPER ──────────────────────────────────────────────────────────
    console.log('\n--- Talent Scraper ---');
    const talentScraper = new TalentScraper({ enableScheduling: false });

    try {
        await talentScraper.runScraping();
        console.log('Talent scraper completato');
    } catch (e) {
        console.error('Errore talent scraper:', e.message);
    }

    console.log('\n=== STANDALONE SCRAPER TERMINATO ===');
    process.exit(0);
}

run().catch(e => {
    console.error('Errore fatale:', e);
    process.exit(1);
});
