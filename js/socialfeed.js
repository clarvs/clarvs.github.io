// Placeholder per socialfeed.js
console.log('Socialfeed.js caricato');

document.addEventListener('DOMContentLoaded', function() {
    const socialPosts = document.getElementById('social-posts');
    let currentPlatform = 'instagram';
    
    // Funzione per ricaricare gli script
    function reloadScripts(platform) {
        return new Promise((resolve) => {
            // Rimuovi gli script esistenti
            const oldInstagramScript = document.querySelector('script[src*="instagram.com/embed.js"]');
            const oldTwitterScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
            if (oldInstagramScript) oldInstagramScript.remove();
            if (oldTwitterScript) oldTwitterScript.remove();

            // Ricarica gli script necessari
            if (platform === 'instagram' || platform === 'both') {
                const instagramScript = document.createElement('script');
                instagramScript.src = '//www.instagram.com/embed.js';
                instagramScript.async = true;
                instagramScript.onload = () => {
                    if (window.instgrm) {
                        window.instgrm.Embeds.process();
                    }
                    resolve();
                };
                document.body.appendChild(instagramScript);
            }

            if (platform === 'twitter' || platform === 'both') {
                const twitterScript = document.createElement('script');
                twitterScript.src = 'https://platform.twitter.com/widgets.js';
                twitterScript.async = true;
                twitterScript.onload = () => {
                    if (window.twttr) {
                        window.twttr.widgets.load();
                    }
                    resolve();
                };
                document.body.appendChild(twitterScript);
            }
        });
    }
    
    // Funzione per caricare i post Instagram
    async function loadInstagramPosts() {
        socialPosts.innerHTML = `
            <div class="instagram-embed">
                <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DIzQ2_goxGv/">
                </blockquote>
            </div>
            <div class="instagram-embed">
                <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DKDhj6JItwy/">
                </blockquote>
            </div>
            <div class="instagram-embed">
                <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DKDtTgcozwg/">
                </blockquote>
            </div>
        `;
        await reloadScripts('instagram');
    }

    // Funzione per caricare i post di X
    async function loadTwitterPosts() {
        socialPosts.innerHTML = `
            <div class="twitter-embed">
                <blockquote class="twitter-tweet">
                    <a href="https://twitter.com/ClarvsTeam/status/1910408782472946171"></a>
                </blockquote>
            </div>
            <div class="twitter-embed">
                <blockquote class="twitter-tweet">
                    <a href="https://twitter.com/Debian_fn/status/1931656484368077141"></a>
                </blockquote>
            </div>
            <div class="twitter-embed">
                <blockquote class="twitter-tweet">
                    <a href="https://twitter.com/Pantefn7/status/1927134123174363641"></a>
                </blockquote>
            </div>
        `;
        await reloadScripts('twitter');
    }

    // Gestione dei tab
    const socialTabs = document.querySelectorAll('.social-tab');
    socialTabs.forEach(tab => {
        tab.addEventListener('click', async function() {
            const platform = this.getAttribute('data-platform');
            
            // Se siamo già sulla stessa piattaforma, non fare nulla
            if (platform === currentPlatform) return;
            
            // Rimuovi active da tutti i tab
            socialTabs.forEach(t => t.classList.remove('active'));
            
            // Aggiungi active al tab corrente
            this.classList.add('active');
            
            // Aggiorna la piattaforma corrente
            currentPlatform = platform;
            
            // Carica i post appropriati
            if (platform === 'instagram') {
                await loadInstagramPosts();
            } else if (platform === 'twitter') {
                await loadTwitterPosts();
            }
        });
    });

    // Carica i post Instagram all'avvio
    loadInstagramPosts();
});
