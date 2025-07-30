// Script per effetti interattivi avanzati
document.addEventListener('DOMContentLoaded', function() {
    
    // Aggiungi effetto mouse hover per le card
    addMouseTrackingEffect();
    
    // Aggiungi effetto typing per il testo hero
    addTypingEffect();
    
    // Cursor personalizzato rimosso per migliorare l'UX
    
});

// Effetto mouse tracking per le card
function addMouseTrackingEffect() {
    const cards = document.querySelectorAll('.news-card, .social-post, .event-card, .member-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// Effetto typing per il testo hero
function addTypingEffect() {
    const heroText = document.querySelector('.hero-text');
    if (!heroText) return;
    
    const text = heroText.textContent;
    heroText.textContent = '';
    heroText.style.borderRight = '2px solid #00bcd4';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            heroText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            // Effetto blinking cursor
            setTimeout(() => {
                heroText.style.borderRight = 'none';
            }, 1000);
        }
    };
    
    // Inizia l'effetto dopo 1 secondo
    setTimeout(typeWriter, 1000);
}

// Cursor personalizzato rimosso
// Funzione rimossa per migliorare l'esperienza utente

// Effetto particelle che seguono il mouse
function createParticleTrail() {
    let particles = [];
    
    document.addEventListener('mousemove', (e) => {
        // Crea una nuova particella
        const particle = {
            x: e.clientX,
            y: e.clientY,
            size: Math.random() * 3 + 1,
            life: 1,
            decay: Math.random() * 0.02 + 0.01
        };
        
        particles.push(particle);
        
        // Limita il numero di particelle
        if (particles.length > 50) {
            particles.shift();
        }
    });
    
    function animateParticles() {
        particles.forEach((particle, index) => {
            particle.life -= particle.decay;
            particle.y -= 1;
            
            if (particle.life <= 0) {
                particles.splice(index, 1);
            }
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// Attiva effetto particelle solo su desktop
if (window.innerWidth > 768) {
    createParticleTrail();
}

// Smooth scroll personalizzato
function smoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

smoothScroll();
