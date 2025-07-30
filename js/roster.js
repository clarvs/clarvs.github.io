document.addEventListener('DOMContentLoaded', function() {
    // Dati del roster organizzati per sezioni
    const rosterSections = [
        {
            title: "Pro Players",
            members: [
                {
                    name: "Cryzee",
                    role: "Pro Player",
                    game: "Fortnite",
                    social: {
                        twitter: "https://x.com/Cryzee7x",
                        instagram: "https://www.instagram.com/cryzee7x?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    },
                    image: "../assets/Images/players/cryzee.jpg"
                },
                {
                    name: "Gabbs",
                    role: "Pro Player",
                    game: "Fortnite",
                    social: {
                        twitter: "https://x.com/gabbsfn",
                        instagram: "https://www.instagram.com/gabbsfn?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    },
                    image: "../assets/Images/players/gabbs.jpg"
                },
                {
                    name: "Iceleoh",
                    role: "Pro Player",
                    game: "Fortnite",
                    social: {
                        twitter: "https://x.com/iceLeoh",
                        instagram: "https://www.instagram.com/iceleoh?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    },
                    image: "../assets/Images/players/iceleoh.jpg"
                }
            ]
        },
        {
            title: "Talents",
            members: [
                {
                    name: "Pante",
                    role: "Talent",
                    game: "Talent",
                    social: {
                        twitter: "https://x.com/Pantefn7",
                        instagram: "https://www.instagram.com/pantefn_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
                        youtube: "https://www.youtube.com/@pantefn"
                    },
                    image: "../assets/Images/players/pante.jpg"
                }
            ]
        },
        {
            title: "Academy",
            members: [
                {
                    name: "Reva",
                    role: "Academy",
                    game: "Fortnite",
                    social: {
                        twitter: "https://x.com/RevaXbot",
                        instagram: "https://www.instagram.com/reva_exe?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    },
                    image: "../assets/Images/players/reva.jpg"
                },
                {
                    name: "Haxo",
                    role: "Academy",
                    game: "Fortnite",
                    social: {
                        twitter: "https://x.com/HaxoFN_"
                    },
                    image: "../assets/Images/players/haxo.jpg"
                },
                {
                    name: "Loran",
                    role: "Academy",
                    game: "Fortnite",
                    social: {
                        twitter: "https://x.com/LoranceFN"
                    },
                    image: "../assets/Images/players/loren.jpg"
                }
            ]
        },
        {
            title: "Content Creator",
            members: [
                {
                    name: "BETTAtv",
                    role: "Content Creator",
                    game: "Content Creator",
                    social: {
                        instagram: "https://www.instagram.com/bettatv_/",
                        youtube: "https://www.youtube.com/@BETTAtv13",
                        twitch: "https://www.twitch.tv/bettatv"
                    },
                    image: "../assets/Images/players/bettatv.jpg"
                }
            ]
        }
    ];
    
    const rosterContainer = document.getElementById('roster-grid');
    
    // Funzione per ottenere l'icona social appropriata
    function getSocialIcon(platform) {
        const icons = {
            twitter: 'fab fa-twitter',
            instagram: 'fab fa-instagram',
            twitch: 'fab fa-twitch',
            youtube: 'fab fa-youtube',
            discord: 'fab fa-discord'
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
    rosterSections.forEach((section, sectionIndex) => {
        // Crea contenitore della sezione
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'roster-section';
        
        // Crea titolo della sezione
        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = section.title;
        sectionDiv.appendChild(sectionTitle);
        
        // Crea griglia per i membri della sezione
        const sectionGrid = document.createElement('div');
        sectionGrid.className = 'roster-grid';
        
        // Aggiungi membri alla sezione
        section.members.forEach((member, memberIndex) => {
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
        
        sectionDiv.appendChild(sectionGrid);
        rosterContainer.appendChild(sectionDiv);
    });
    
    // Aggiungi animazioni di entrata
    const cards = document.querySelectorAll('.member-card');
    cards.forEach((card, index) => {
        card.classList.add('animate-scale-in');
    });
});