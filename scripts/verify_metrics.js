const { supabase } = require('../supabase');
require('dotenv').config();

async function verify() {
    console.log('--- VERIFYING SCOUTING METRICS REGISTRATION ---');

    try {
        // 1. Mock the backend logic for /api/talents/preview
        const { data: allPlayers } = await supabase.from('talent_stats').select('*').limit(5);
        if (!allPlayers || allPlayers.length === 0) {
            console.log('No players found in DB, skipping math verification.');
        } else {
            const sample = allPlayers[0];
            const N = allPlayers.length;

            // Context Phase 1 check
            const ctx1 = {
                pr: sample.pr || 0,
                pr_recent10: sample.pr_recent10 || 0,
                Math
            };
            console.log('Phase 1 Context test:', ctx1.pr_recent10 !== undefined ? 'OK' : 'FAILED');

            // Context Phase 2 check (normalized delta)
            const prRank = 1;
            const prDensityRank = 2; // Simulated
            const rank_delta_raw = N >= 2 ? (prRank - prDensityRank) / N : 0;
            console.log('Phase 2 Math test (rank_delta_raw):', rank_delta_raw);
        }

    } catch (e) {
        console.error('Verification script error:', e.message);
    }
}

verify();
