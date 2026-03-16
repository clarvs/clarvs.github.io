/**
 * Clarvs TV — Config loader
 * Le chiavi API sono nel file .env (mai nel codice sorgente).
 * Questo file carica la configurazione dal server via GET /api/tv/config.
 * Se il server non e disponibile (es. GitHub Pages), TV_CONFIG resta null
 * e la TV funziona in modalita sola lettura (nessun live check).
 */

window.TV_CONFIG = null;

window.TV_CONFIG_PROMISE = fetch("/api/tv/config")
    .then(r => r.ok ? r.json() : null)
    .then(config => {
        if (config) {
            window.TV_CONFIG = config;
            console.log("[TV Config] Caricato dal server — Twitch:" +
                (!!(config.twitch && config.twitch.clientId) ? "OK" : "mancante") +
                " | YouTube:" +
                (!!(config.youtube && config.youtube.apiKey) ? "OK" : "mancante"));
        }
        return config;
    })
    .catch(() => {
        console.warn("[TV Config] Server non disponibile — la TV funziona senza live check.");
        return null;
    });