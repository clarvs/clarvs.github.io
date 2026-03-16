// Placeholder per socialfeed.js
console.log('Socialfeed.js caricato');

document.addEventListener('DOMContentLoaded', function() {
    const socialPosts = document.getElementById('social-posts');
    let currentPlatform = 'instagram';
    
    // Funzione per ricaricare gli script
    function reloadScripts(platform) {
        return new Promise((resolve) => {
            const oldInstagramScript = document.querySelector('script[src*="instagram.com/embed.js"]');
            const oldTwitterScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
            if (oldInstagramScript) oldInstagramScript.remove();
            if (oldTwitterScript) oldTwitterScript.remove();

            if (platform === 'instagram' || platform === 'both') {
                const instagramScript = document.createElement('script');
                instagramScript.src = '//www.instagram.com/embed.js';
                instagramScript.async = true;
                instagramScript.onload = () => {
                    if (window.instgrm) window.instgrm.Embeds.process();
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
                        if (window.twttr && window.twttr.widgets) window.twttr.widgets.load();
                        resolve();
                    }, 500);
                };
                twitterScript.onerror = () => resolve();
                document.body.appendChild(twitterScript);
            }
        });
    }
    
    function showEmptyState(platform) {
        socialPosts.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); grid-column: 1 / -1;">
                <i class="fab fa-${platform === 'twitter' ? 'x-twitter' : platform} fa-3x" style="margin-bottom: 20px; opacity: 0.2;"></i>
                <p style="font-size: 1.1rem; letter-spacing: 1px;">NESSUN POST CONFIGURATO</p>
                <p style="font-size: 0.85rem; margin-top: 8px;">Aggiungi link social dal pannello admin per vederli qui.</p>
            </div>
        `;
    }

    async function loadInstagramPosts() {
        let permalinks = [];
        try {
            const res = await fetch(API_BASE + '/api/home-content');
            if (res.ok) {
                const content = await res.json();
                const insta = content?.social?.instagram;
                if (insta && insta.length > 0) {
                    permalinks = insta.filter(i => i.permalink).map(i => i.permalink);
                }
            }
        } catch (e) { console.error('Load Error:', e); }

        if (permalinks.length === 0) {
            showEmptyState('instagram');
            return;
        }

        socialPosts.innerHTML = permalinks.map(p => `
            <div class="instagram-embed">
                <blockquote class="instagram-media" data-instgrm-permalink="${p}"></blockquote>
            </div>
        `).join('');
        await reloadScripts('instagram');
    }

    async function loadTwitterPosts() {
        let tweets = [];
        try {
            const res = await fetch(API_BASE + '/api/home-content');
            if (res.ok) {
                const content = await res.json();
                const tw = content?.social?.twitter;
                if (tw && tw.length > 0) {
                    tweets = tw.filter(t => t.link);
                }
            }
        } catch (e) { console.error('Load Error:', e); }

        if (tweets.length === 0) {
            showEmptyState('twitter');
            return;
        }

        socialPosts.innerHTML = tweets.map(t => `
            <div class="twitter-embed" style="margin-bottom: 20px;">
                <blockquote class="twitter-tweet" data-theme="dark" data-link-color="#00ffff" data-dnt="true">
                    <a href="${t.link}">${t.date || ''}</a>
                </blockquote>
            </div>
        `).join('');
        
        await reloadScripts('twitter');
    }

    const socialTabs = document.querySelectorAll('.social-tab');
    socialTabs.forEach(tab => {
        tab.addEventListener('click', async function() {
            const platform = this.getAttribute('data-platform');
            if (platform === currentPlatform) return;
            
            socialTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentPlatform = platform;
            
            if (platform === 'instagram') {
                await loadInstagramPosts();
            } else if (platform === 'twitter') {
                await loadTwitterPosts();
            }
        });
    });

    loadInstagramPosts();
});
