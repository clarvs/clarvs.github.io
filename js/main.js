// Gestione generale del sito
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main.js caricato correttamente');
    
    // Inizializza le animazioni scroll-based
    initScrollAnimations();
    
    // Inizializza gli effetti parallax
    initParallaxEffects();
    
    // Gestione del menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
        
        // Chiudi il menu mobile quando si clicca su un link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
        
        // Chiudi il menu mobile quando si clicca fuori
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.main-nav')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
    
    // Gestione dello spinner di caricamento
    const loadingElement = document.getElementById('loading');
    
    if (loadingElement) {
        // Mostra lo spinner durante il caricamento delle pagine
        window.addEventListener('beforeunload', function() {
            loadingElement.style.display = 'flex';
        });
        
        // Nascondi lo spinner quando la pagina è completamente caricata
        window.addEventListener('load', function() {
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 500); // Piccolo delay per un effetto più fluido
        });
        
        // Nascondi lo spinner anche al caricamento del DOM (fallback)
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 2000);
    }
    
    // Gestione dello scroll smooth per i link anchor
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Evidenzia il link di navigazione attivo in base alla pagina corrente
    highlightActiveNavLink();
    
    // Gestione degli errori di caricamento immagini
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.warn('Immagine non trovata:', this.src);
        });
    });
});

// Funzione per evidenziare il link di navigazione attivo
function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'home.html') ||
            (currentPage === 'index.html' && linkPage === 'home.html')) {
            link.classList.add('active');
        }
    });
}

// Funzione per animazioni scroll-based
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animazioni staggered per elementi figli
                const children = entry.target.querySelectorAll('.news-card, .social-post, .event-card, .member-card');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate-slide-up');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Osserva tutti gli elementi con classe 'reveal'
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// Funzione per effetti parallax
function initParallaxEffects() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Gestione ripple effect per i button
function addRippleEffect() {
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Inizializza ripple effect quando il DOM è caricato
document.addEventListener('DOMContentLoaded', addRippleEffect);

// Gestione degli eventi di resize per ottimizzazioni mobile
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Chiudi il menu mobile durante il resize
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (navLinks && mobileMenuBtn) {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        }
    }, 250);
});