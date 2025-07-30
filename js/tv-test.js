// Versione di test semplificata per TV (senza API live)
document.addEventListener('DOMContentLoaded', function() {
    console.log('[TV Test] Inizializzazione versione test...');
    
    const tvScreen = document.getElementById('tv-screen');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    if (!tvScreen) {
        console.error('[TV Test] Elemento tv-screen non trovato!');
        return;
    }
    
    // Test con un video specifico della playlist
    function loadTestVideo() {
        const testVideoId = 'Tl5Z8aqEcMU'; // Primo video della playlist
        
        console.log('[TV Test] Caricamento video test:', testVideoId);
        
        tvScreen.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${testVideoId}?autoplay=1&controls=1&rel=0"
                frameborder="0" 
                allow="autoplay; fullscreen" 
                allowfullscreen
                width="100%"
                height="100%"
                title="Clarvs TV Test">
            </iframe>
        `;
        
        console.log('[TV Test] Video caricato');
    }
    
    // Gestione fullscreen
    function setupFullscreen() {
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                const tvContainer = document.querySelector('.tv-container');
                
                if (!document.fullscreenElement) {
                    if (tvContainer.requestFullscreen) {
                        tvContainer.requestFullscreen();
                    } else if (tvContainer.webkitRequestFullscreen) {
                        tvContainer.webkitRequestFullscreen();
                    } else if (tvContainer.mozRequestFullScreen) {
                        tvContainer.mozRequestFullScreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    }
                }
            });
        }
        
        // Gestione cambio stato fullscreen
        document.addEventListener('fullscreenchange', function() {
            const isFullscreen = !!document.fullscreenElement;
            if (fullscreenBtn) {
                fullscreenBtn.textContent = isFullscreen ? 'Esci da Schermo Intero' : 'Schermo Intero';
            }
        });
    }
    
    // Carica il video test
    loadTestVideo();
    
    // Setup fullscreen
    setupFullscreen();
    
    // Aggiungi pulsante di test
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test Video';
    testBtn.style.cssText = 'background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin: 10px;';
    testBtn.addEventListener('click', loadTestVideo);
    
    const tvControls = document.querySelector('.tv-controls');
    if (tvControls) {
        tvControls.appendChild(testBtn);
    }
    
    console.log('[TV Test] Inizializzazione completata');
});
