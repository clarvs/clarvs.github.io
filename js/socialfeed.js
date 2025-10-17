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
                twitterScript.charset = 'utf-8';
                twitterScript.onload = () => {
                    setTimeout(() => {
                        if (window.twttr && window.twttr.widgets) {
                            window.twttr.widgets.load();
                        }
                        resolve();
                    }, 500);
                };
                twitterScript.onerror = () => {
                    console.log('Errore caricamento Twitter script');
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
                <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DPtTLWaCL2s/">
                </blockquote>
            </div>
            <div class="instagram-embed">
                <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DPrOXAViI2K/">
                </blockquote>
            </div>
            <div class="instagram-embed">
                <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DPouvaJCI15/">
                </blockquote>
            </div>
        `;
        await reloadScripts('instagram');
    }

    // Funzione per caricare i post di X
    async function loadTwitterPosts() {
        socialPosts.innerHTML = `
            <div class="twitter-embed" style="margin-bottom: 20px;">
                <blockquote class="twitter-tweet" data-theme="dark" data-link-color="#00ffff" data-dnt="true">
                    <a href="https://twitter.com/Pantefn7/status/1978560891252527237?ref_src=twsrc%5Etfw">December 17, 2024</a>
                </blockquote>
            </div>
            <div class="twitter-embed" style="margin-bottom: 20px;">
                <blockquote class="twitter-tweet" data-theme="dark" data-link-color="#00ffff" data-dnt="true">
                    <a href="https://twitter.com/Pantefn7/status/1977046923585470486?ref_src=twsrc%5Etfw">December 16, 2024</a>
                </blockquote>
            </div>
            <div class="twitter-embed" style="margin-bottom: 20px;">
                <blockquote class="twitter-tweet" data-theme="dark" data-link-color="#00ffff" data-dnt="true">
                    <a href="https://twitter.com/Pantefn7/status/1969435357469876732?ref_src=twsrc%5Etfw">December 15, 2024</a>
                </blockquote>
            </div>
        `;
        
        // Rimuovi script esistente
        const oldScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
        if (oldScript) oldScript.remove();
        
        // Carica script Twitter
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        
        script.onload = () => {
            console.log('Twitter script caricato');
            if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load().then(() => {
                    console.log('Twitter widgets caricati');
                });
            }
        };
        
        script.onerror = () => {
            console.error('Errore nel caricamento script Twitter');
            // Fallback: mostra messaggio di errore
            socialPosts.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888;">
                    <p>⚠️ Impossibile caricare i tweet</p>
                    <p>Prova a ricaricare la pagina o controlla la connessione</p>
                    <div style="margin-top: 20px;">
                        <a href="https://x.com/Pantefn7" target="_blank" style="color: #00ffff; text-decoration: none;">
                            🐦 Visita il profilo X di Pante
                        </a>
                    </div>
                </div>
            `;
        };
        
        document.head.appendChild(script);
        
        // Timeout di sicurezza
        setTimeout(() => {
            const tweets = document.querySelectorAll('.twitter-tweet');
            tweets.forEach(tweet => {
                if (tweet.innerHTML.includes('Caricamento') || tweet.children.length <= 1) {
                    tweet.innerHTML = `
                        <div style="padding: 20px; border: 1px solid #333; border-radius: 10px; background: #111;">
                            <p style="color: #888; margin: 0;">❌ Tweet non caricato</p>
                            <a href="${tweet.querySelector('a').href}" target="_blank" style="color: #00ffff;">
                                Visualizza su X →
                            </a>
                        </div>
                    `;
                }
            });
        }, 5000);
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