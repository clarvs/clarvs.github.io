document.addEventListener('DOMContentLoaded', function() {
    // Dati dello staff organizzati per sezioni
    const staffSections = [
        {
            title: "Leader",
            members: [
                {
                    name: "Calle",
                    role: "Leader",
                    game: "Fortnite",
                    image: "../assets/Images/players/calle.jpg"
                }
            ]
        },
        {
            title: "Staffer",
            members: [
                {
                    name: "Enxyn",
                    role: "Staff",
                    game: "Management",
                    image: "../assets/Images/players/enxyn.jpg"
                },
                {
                    name: "Zak",
                    role: "Staff",
                    game: "Management",
                    image: "../assets/Images/players/zak.jpg"
                },
                {
                    name: "Pyre",
                    role: "Staff",
                    game: "Management",
                    image: "../assets/Images/players/pyre.jpg"
                },
                {
                    name: "Matto",
                    role: "Staff",
                    game: "Management",
                    image: "../assets/Images/players/matto.jpg"
                },
                {
                    name: "Anass",
                    role: "Staff",
                    game: "Management",
                    image: "../assets/Images/players/anass.jpg"
                },
                {
                    name: "Bamba",
                    role: "Staff",
                    game: "Management",
                    image: "../assets/Images/players/bamba.jpg"
                }
            ]
        }
    ];
    
    const staffContainer = document.getElementById('staff-grid');
    
    // Funzione per ottenere il colore del ruolo
    function getRoleColor(role) {
        const colors = {
            'Leader': '#FFD700',
            'Staff': '#00bcd4'
        };
        return colors[role] || '#00bcd4';
    }
    
    // Crea le sezioni
    staffSections.forEach((section, sectionIndex) => {
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
            
            memberCard.innerHTML = `
                <div class="member-image" style="background-image: url('${member.image}'); background-color: #333;"></div>
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p class="role" style="color: ${getRoleColor(member.role)};">${member.role}</p>
                    <p class="game">${member.game}</p>
                </div>
            `;
            
            sectionGrid.appendChild(memberCard);
        });
        
        sectionDiv.appendChild(sectionGrid);
        staffContainer.appendChild(sectionDiv);
    });
    
    // Aggiungi animazioni di entrata
    const cards = document.querySelectorAll('.member-card');
    cards.forEach((card, index) => {
        card.classList.add('animate-scale-in');
    });
});
