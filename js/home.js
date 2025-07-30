// Variabili globali
let currentSlide = 0;
const slideWidth = 300; // 280px card + 2rem (32px) gap
let maxSlides = 0;
let autoSlideInterval;

// --- Inizializzazione e Gestione Eventi Principali ---
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initRosterSlider();
    startAutoSlide();
    loadNews();
    loadEvents();

    // Gestore per chiudere menu e modali
    document.addEventListener('click', function(e) {
        // Chiude il dropdown se si clicca fuori
        if (!e.target.closest('.user-menu')) {
            document.getElementById('userDropdown')?.classList.remove('active');
        }

        /*
        // La gestione della modale non è più necessaria qui,
        // dato che le funzioni di apertura sono solo dei placeholder.
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
        */
    });

    /*
    // La gestione del form di login è stata commentata perché la modale
    // non viene più aperta. Verrà ripristinata con l'implementazione del login.
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Login simulato con successo!');
            closeModal();
        });
    }
    */
});

// --- Funzioni per Login e Dropdown ---
function toggleDropdown() {
    document.getElementById('userDropdown')?.classList.toggle('active');
}

// Le funzioni per Login, Registrazione e Admin sono state aggiornate
// per mostrare un messaggio che indica che sono da implementare.

/**
 * Funzione per il Login dell'utente.
 * @description Attualmente mostra un avviso. Da implementare la logica di login.
 */
function openLogin() {
    alert('Funzione Login - Da implementare');
}

/**
 * Funzione per la Registrazione di un nuovo utente.
 * @description Attualmente mostra un avviso. Da implementare la logica di registrazione.
 */
function openRegister() {
    alert('Funzione Registrazione - Da implementare');
}

/**
 * Funzione per l'accesso al pannello di amministrazione.
 * @description Attualmente mostra un avviso. Da implementare la logica per il pannello admin.
 */
function openAdmin() {
    alert('Funzione Admin Panel - Da implementare');
}

/*
// Funzione per chiudere la modale (non più utilizzata al momento)
function closeModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('registerModal').classList.remove('active');
}
*/


// --- Funzioni Slider e Particelle (INVARIATE) ---

// Effetto particelle 3D
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x00BFFF
    });
    const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleMesh);
    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        particleMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Roster slider
function initRosterSlider() {
    const container = document.getElementById('rosterContainer');
    if(!container) return;
    const cards = container.children;
    const containerWidth = container.offsetWidth;
    const totalWidth = cards.length * (280 + 32); // card width + gap
    maxSlides = Math.max(0, Math.ceil((totalWidth - containerWidth) / slideWidth));
}

function nextSlide() {
    const container = document.getElementById('rosterContainer');
    if (currentSlide < maxSlides) {
        currentSlide++;
    } else {
        currentSlide = 0;
    }
    container.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
}

function previousSlide() {
    const container = document.getElementById('rosterContainer');
    if (currentSlide > 0) {
        currentSlide--;
    } else {
        currentSlide = maxSlides;
    }
    container.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
}

function startAutoSlide() {
    stopAutoSlide(); // Evita intervalli multipli
    autoSlideInterval = setInterval(nextSlide, 4000);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

document.querySelector('.slider-controls')?.addEventListener('mouseenter', stopAutoSlide);
document.querySelector('.slider-controls')?.addEventListener('mouseleave', startAutoSlide);
window.addEventListener('resize', initRosterSlider);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// --- Caricamento Notizie ---
function loadNews() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    const newsData = [
        {
            title: "Nuovo Sito dei Clarvs",
            date: "18 Ottobre 2025",
            content: "È online il nuovo sito web dei Clarvs! Design moderno, funzionalità migliorate e tutta l'esperienza del team.",
            image: "../assets/Images/news/new-site.jpg"
        },
        {
            title: "Arrivato il Capitolo 5 del Team",
            date: "18 Ottobre 2025", 
            content: "Da oggi inizia il quinto capitolo era 2 dei clarvs",
            image: "../assets/Images/news/chapter-5.jpg"
        },
        {
            title: "La CCC è Tornata!",
            date: "18 Ottobre 2025",
            content: "La quarta edizione della ccc torna con in palio 300 euro",
            image: "../assets/Images/news/ccc-tournament.jpg"
        }
    ];

    newsGrid.innerHTML = newsData.map(news => `
        <article class="news-card">
            <div class="news-image" style="background-image: url('${news.image}')"></div>
            <div class="news-content">
                <h3>${news.title}</h3>
                <time class="news-date">${news.date}</time>
                <p class="news-excerpt">${news.content}</p>
            </div>
        </article>
    `).join('');
}

// --- Caricamento Eventi ---
function loadEvents() {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) return;

    const eventsData = [
        {
            title: "Solo Late Game",
            date: "25 Ottobre 2025",
            time: "16:00",
            description: "",
            type: "Torneo"
        },
        {
            title: "Duo Late Game",
            date: "1 Novembre 2025", 
            time: "16:00",
            description: "",
            type: "Torneo"
        },
        {
            title: "Solo Late Game",
            date: "8 Novembre 2025",
            time: "16:00", 
            description: "",
            type: "Torneo"
        }
    ];

    eventsList.innerHTML = eventsData.map(event => `
        <div class="event-card">
            <div class="event-type">${event.type}</div>
            <h3 class="event-title">${event.title}</h3>
            <div class="event-details">
                <div class="event-date">
                    <i class="fas fa-calendar"></i>
                    ${event.date}
                </div>
                <div class="event-time">
                    <i class="fas fa-clock"></i>
                    ${event.time}
                </div>
            </div>
        </div>
    `).join('');
}
