document.addEventListener('DOMContentLoaded', function() {
    // Dati del roster organizzati per sezioni
    const rosterData = {
        proPlayers: [
            {
                name: 'Gabbs',
                role: 'Pro Player',
                game: 'Fortnite',
                image: '../assets/Images/players/gabbs.jpg',
                social: {
                    twitter: 'https://x.com/gabbsfn',
                    instagram: 'https://www.instagram.com/gabbsfn?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=='
                }
            },
            {
                name: 'Iceleoh',
                role: 'Pro Player',
                game: 'Fortnite',
                image: '../assets/Images/players/iceleoh.jpg',
                social: {
                    twitter: 'https://x.com/iceLeoh',
                    instagram: 'https://www.instagram.com/iceleoh?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=='
                }
            },
            {
                name: 'Pante',
                role: 'Pro Player',
                game: 'Fortnite',
                image: '../assets/Images/players/pante.jpg',
                social: {
                    twitter: 'https://x.com/Pantefn7',
                    instagram: 'https://www.instagram.com/pantefn_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
                    youtube: 'https://www.youtube.com/@pantefn'
                }
            }
        ],
        talents: [],
        academy: [
            {
                name: 'Loran',
                role: 'Academy',
                game: 'Fortnite',
                image: '../assets/Images/players/loren.jpg',
                social: {
                    twitter: 'https://x.com/LoranceFN'
                }
            }
        ],
        contentCreator: [
            {
                name: 'BETTAtv',
                role: 'Content Creator',
                game: 'Content Creator',
                image: '../assets/Images/players/bettatv.jpg',
                social: {
                    instagram: 'https://www.instagram.com/bettatv_/',
                    youtube: 'https://www.youtube.com/@BETTAtv13',
                    twitch: 'https://www.twitch.tv/bettatv'
                }
            },
            {
                name: 'Mafix',
                role: 'Content Creator',
                game: 'Content Creator',
                image: '../assets/Images/players/mafix.jpg',
                social: {
                    tiktok: 'https://www.tiktok.com/@mafixfnrr?_r=1&_t=ZN-919L650SA5u',
                    instagram: 'https://www.instagram.com/mafix_w/'
                }
            }
        ]
    };

    const rosterContainer = document.getElementById('roster-grid');
    
    // Funzione per ottenere l'icona social appropriata
    function getSocialIcon(platform) {
        const icons = {
            twitter: 'fab fa-twitter',
            instagram: 'fab fa-instagram',
            twitch: 'fab fa-twitch',
            youtube: 'fab fa-youtube',
            discord: 'fab fa-discord',
            tiktok: 'fab fa-tiktok'
        };
        return icons[platform] || 'fas fa-link';
    }
    
    // Funzione per ottenere il colore del ruolo
    function getRoleColor(role) {
        const colors = {
            'Pro Player': '#FF6B6B',
            'Talent': '#9B59B6',
            'Academy': '#2ECC71',
            'Content Creator': '#F39C12'
        };
        return colors[role] || '#00bcd4';
    }
    
    // Crea le sezioni
    Object.entries(rosterData).forEach(([sectionKey, members], sectionIndex) => {
        // Crea contenitore della sezione
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'roster-section';
        
        // Crea titolo della sezione
        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace(/([A-Z])/g, ' $1');
        sectionDiv.appendChild(sectionTitle);
        
        // Crea griglia per i membri della sezione
        const sectionGrid = document.createElement('div');
        sectionGrid.className = 'roster-grid';
        
        // Se la sezione è vuota, mostra un messaggio
        if (members.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-section-message';
            emptyMessage.textContent = 'Coming soon...';
            emptyMessage.style.cssText = 'text-align: center; color: #888; font-style: italic; padding: 2rem;';
            sectionGrid.appendChild(emptyMessage);
        } else {
            // Aggiungi membri alla sezione
            members.forEach((member, memberIndex) => {
                const memberCard = document.createElement('div');
                memberCard.className = 'member-card hover-lift';
                memberCard.style.animationDelay = `${(sectionIndex * 3 + memberIndex) * 0.1}s`;
                
                // Genera i link social dinamicamente
                let socialLinks = '';
                Object.entries(member.social).forEach(([platform, url]) => {
                    if (url && url !== '#') {
                        socialLinks += `<a href="${url}" target="_blank" title="${platform}"><i class="${getSocialIcon(platform)}"></i></a>`;
                    }
                });
                
                memberCard.innerHTML = `
                    <div class="member-image" style="background-image: url('${member.image}'); background-color: #333;"></div>
                    <div class="member-info">
                        <h3>${member.name}</h3>
                        <p class="role" style="color: ${getRoleColor(member.role)};">${member.role}</p>
                        <p class="game">${member.game}</p>
                        <div class="social-links">
                            ${socialLinks || '<span class="no-social">Social coming soon...</span>'}
                        </div>
                    </div>
                `;
                
                sectionGrid.appendChild(memberCard);
            });
        }
        
        sectionDiv.appendChild(sectionGrid);
        rosterContainer.appendChild(sectionDiv);
    });
    
    // Aggiungi animazioni di entrata
    const cards = document.querySelectorAll('.member-card');
    cards.forEach((card, index) => {
        card.classList.add('animate-scale-in');
    });
});