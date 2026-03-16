document.addEventListener('DOMContentLoaded', async function () {
    const staffContainer = document.getElementById('staff-grid');
    if (!staffContainer) return;

    let staffData = [];

    // Carica da API, fallback su struttura vuota
    try {
        const res = await fetch('/api/staff');
        if (res.ok) {
            staffData = await res.json();
        }
    } catch (e) {
        // server offline, nessun dato
    }

    if (!staffData.length) {
        staffContainer.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:2rem;">Nessun membro dello staff al momento.</p>';
        return;
    }

    function getRoleColor(role) {
        const colors = {
            'Leader':  '#FFD700',
            'Staff':   '#2563eb',
            'Manager': '#10b981',
            'Coach':   '#f59e0b'
        };
        return colors[role] || '#2563eb';
    }

    // Raggruppa per section: leader prima, poi staffer
    const sections = {};
    const sectionOrder = [];
    staffData.forEach(member => {
        const key = member.section || 'staffer';
        if (!sections[key]) {
            sections[key] = [];
            sectionOrder.push(key);
        }
        sections[key].push(member);
    });

    const sectionLabels = { leader: 'Leader', staffer: 'Staffer' };

    // Ordine: leader sempre primo
    const orderedKeys = ['leader', ...sectionOrder.filter(k => k !== 'leader')];
    const uniqueKeys = [...new Set(orderedKeys)].filter(k => sections[k]);

    uniqueKeys.forEach((key, sectionIndex) => {
        const members = sections[key];
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'roster-section';

        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = sectionLabels[key] || key;
        sectionDiv.appendChild(sectionTitle);

        const sectionGrid = document.createElement('div');
        sectionGrid.className = 'roster-grid';

        members.forEach((member, memberIndex) => {
            const memberCard = document.createElement('div');
            memberCard.className = 'member-card hover-lift animate-scale-in';
            memberCard.style.animationDelay = `${(sectionIndex * 6 + memberIndex) * 0.1}s`;

            const imgStyle = member.imageUrl
                ? `background-image: url('${member.imageUrl}'); background-color: #333;`
                : 'background-color: #333;';

            memberCard.innerHTML = `
                <div class="member-image" style="${imgStyle}"></div>
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p class="role" style="color: ${getRoleColor(member.role)};">${member.role}</p>
                    <p class="game">${member.game || ''}</p>
                </div>
            `;
            sectionGrid.appendChild(memberCard);
        });

        sectionDiv.appendChild(sectionGrid);
        staffContainer.appendChild(sectionDiv);
    });
});
