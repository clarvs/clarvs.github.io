document.addEventListener('DOMContentLoaded', function() {

    const rosterContainer = document.getElementById('roster-grid');

    // ─── CARICAMENTO ROSTER ────────────────────────────────────────────────────

    function formatPR(value) {
        if (!value) return null;
        return value.toLocaleString('it-IT'); // 97263 → "97.263"
    }

    function formatEarnings(value) {
        if (!value) return null;
        return '$' + value.toLocaleString('it-IT');
    }

    async function loadRoster() {
        let roster = null;
        let statsMap = {};

        try {
            const [rRes, sRes] = await Promise.all([
                fetch('/api/roster'),
                fetch('/scraper/data/player-stats.json')
            ]);
            if (rRes.ok) roster = await rRes.json();
            if (sRes.ok) {
                const statsData = await sRes.json();
                (statsData.players || []).forEach(p => {
                    statsMap[p.name.toLowerCase()] = p.stats;
                });
            }
        } catch (e) {
            console.error('Errore caricamento roster:', e);
        }

        if (!roster || roster.length === 0) {
            rosterContainer.innerHTML = '<p style="text-align:center;color:#888;padding:3rem">Roster non disponibile.</p>';
            return;
        }

        const categories = [
            { key: 'proPlayer',      label: 'Pro Players' },
            { key: 'talent',         label: 'Talents' },
            { key: 'academy',        label: 'Academy' },
            { key: 'contentCreator', label: 'Content Creators' }
        ];

        categories.forEach((cat, sectionIndex) => {
            const members = roster.filter(p => p.category === cat.key);

            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'roster-section';

            const sectionTitle = document.createElement('h2');
            sectionTitle.textContent = cat.label;
            sectionDiv.appendChild(sectionTitle);

            const sectionGrid = document.createElement('div');
            sectionGrid.className = 'roster-grid';

            if (members.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.className = 'empty-section-message';
                emptyMsg.textContent = 'Coming soon...';
                emptyMsg.style.cssText = 'text-align:center;color:#888;font-style:italic;padding:2rem;';
                sectionGrid.appendChild(emptyMsg);
            } else {
                members.forEach((player, memberIndex) => {
                    const card = document.createElement('div');
                    card.className = 'member-card hover-lift animate-scale-in';
                    card.style.animationDelay = `${(sectionIndex * 3 + memberIndex) * 0.1}s`;

                    let socialLinks = '';
                    Object.entries(player.socials || {}).forEach(([platform, url]) => {
                        if (url) {
                            socialLinks += `<a href="${url}" target="_blank" title="${platform}"><i class="${getSocialIcon(platform)}"></i></a>`;
                        }
                    });

                    const stats    = statsMap[player.name.toLowerCase()];
                    const pr       = stats?.pr       ? formatPR(stats.pr)           : null;
                    const earnings = stats?.earnings ? formatEarnings(stats.earnings) : null;

                    const statsHtml = (pr || earnings) ? `
                        <div class="member-stats">
                            ${pr       ? `<span class="stat-chip stat-chip--pr"><span class="chip-val">${pr}</span><span class="chip-lbl">PR EU</span></span>` : ''}
                            ${earnings ? `<span class="stat-chip stat-chip--earn"><span class="chip-val">${earnings}</span></span>` : ''}
                        </div>` : '';

                    card.innerHTML = `
                        <div class="member-image" style="background-image: url('${player.imageUrl}'); background-color: #333;"></div>
                        <div class="member-info">
                            <h3>${player.name}</h3>
                            <p class="role" style="color: ${getRoleColor(player.role)};">${player.role}</p>
                            <p class="game">${player.game}</p>
                            ${statsHtml}
                            <div class="social-links">
                                ${socialLinks || '<span class="no-social">Social coming soon...</span>'}
                            </div>
                        </div>
                    `;

                    sectionGrid.appendChild(card);
                });
            }

            sectionDiv.appendChild(sectionGrid);
            rosterContainer.appendChild(sectionDiv);
        });
    }

    // ─── UTILITY ──────────────────────────────────────────────────────────────

    function getSocialIcon(platform) {
        const icons = {
            twitter:   'fab fa-twitter',
            instagram: 'fab fa-instagram',
            twitch:    'fab fa-twitch',
            youtube:   'fab fa-youtube',
            discord:   'fab fa-discord',
            tiktok:    'fab fa-tiktok'
        };
        return icons[platform] || 'fas fa-link';
    }

    function getRoleColor(role) {
        const colors = {
            'Pro Player':      '#FF6B6B',
            'Talent':          '#9B59B6',
            'Academy':         '#2ECC71',
            'Content Creator': '#F39C12'
        };
        return colors[role] || '#00bcd4';
    }

    // ─── AVVIO ────────────────────────────────────────────────────────────────

    loadRoster();

    initStaffFeatures();

    console.log('Clarvs Roster System inizializzato');
});
