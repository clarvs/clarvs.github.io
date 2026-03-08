// Script per effetti interattivi avanzati
document.addEventListener('DOMContentLoaded', function() {
    console.log('Interactions.js loaded');
    
    // Sistema di particelle 3D migliorato
    let scene, camera, renderer, particles, particleSystem;
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    
    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas || !window.THREE) return;
        
        // Configurazione scene
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 400;
        
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: false, // Disabilita antialiasing per performance
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        
        // Configurazione particelle ottimizzata
        const particleCount = window.innerWidth < 768 ? 800 : 1500; // Meno particelle su mobile
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        // Genera posizioni e velocità casuali
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Posizioni
            positions[i3] = (Math.random() - 0.5) * 2000;
            positions[i3 + 1] = (Math.random() - 0.5) * 1000;
            positions[i3 + 2] = (Math.random() - 0.5) * 1000;
            
            // Velocità
            velocities[i3] = (Math.random() - 0.5) * 0.5;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.5;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
            
            // Colori (palette cyan-blue)
            const colorVariant = Math.random();
            if (colorVariant < 0.6) {
                // Cyan principale
                colors[i3] = 0;     // R
                colors[i3 + 1] = 1; // G
                colors[i3 + 2] = 1; // B
            } else if (colorVariant < 0.8) {
                // Blu
                colors[i3] = 0.2;   // R
                colors[i3 + 1] = 0.6; // G
                colors[i3 + 2] = 1;   // B
            } else {
                // Bianco per accenti
                colors[i3] = 1;     // R
                colors[i3 + 1] = 1; // G
                colors[i3 + 2] = 1; // B
            }
        }
        
        // Geometria delle particelle
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Materiale ottimizzato
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData = { velocities: velocities };
        scene.add(particleSystem);
        
        // Event listeners
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        window.addEventListener('resize', onWindowResize, false);
        
        // Inizia l'animazione
        animate();
        
        console.log('Particle system initialized with', particleCount, 'particles');
    }
    
    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - windowHalfX) * 0.1;
        mouseY = (event.clientY - windowHalfY) * 0.1;
    }
    
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    function animate() {
        requestAnimationFrame(animate);
        
        if (!particleSystem) return;
        
        const positions = particleSystem.geometry.attributes.position.array;
        const velocities = particleSystem.userData.velocities;
        
        // Aggiorna posizione particelle
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            
            // Rimbalzo ai bordi
            if (Math.abs(positions[i]) > 1000) velocities[i] *= -1;
            if (Math.abs(positions[i + 1]) > 500) velocities[i + 1] *= -1;
            if (Math.abs(positions[i + 2]) > 500) velocities[i + 2] *= -1;
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // Movimento camera basato sul mouse
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
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
    
    // Inizializza
    initParticles();
    smoothScroll();
});
