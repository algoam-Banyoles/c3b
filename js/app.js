// ============================================================================
// Estat global, init, refreshAll, switching de pestanyes, esdeveniments
// ============================================================================

let PARTIDES_DATA = [];
let chart = null;
// Finestra de la mitjana mòbil: 15 per 3 Bandes, 10 per la resta. S'estableix a init().
let ROLLING_WINDOW = 15;
let currentRange = { start: 0, end: 15 };
let editingIndex = -1;

async function init() {
    const userConfig = BillarConfig.requireUser();
    if (!userConfig) return;

    document.getElementById('mainTitle').innerHTML = `<img src="icons/billar-stats-icon-48.png" alt="Billar" style="width: 32px; height: 32px; vertical-align: middle; margin-right: 10px;">${userConfig.usuariNom}`;
    document.getElementById('userSubtitle').textContent = userConfig.modalitatNom;

    // Determinar finestra de mitjana mòbil segons modalitat (3 Bandes: 15, resta: 10).
    // Acceptem també el nom antic "Tres Bandes" per a sessions amb localStorage anterior al rename.
    ROLLING_WINDOW = (userConfig.modalitatNom === '3 Bandes' || userConfig.modalitatNom === 'Tres Bandes') ? 15 : 10;
    currentRange.end = ROLLING_WINDOW;

    // Actualitzar textos estàtics que esmenten el nombre de partides
    const lblSelector = document.querySelector('.range-selector label');
    if (lblSelector) lblSelector.textContent = `Selecciona el grup de ${ROLLING_WINDOW} partides:`;
    const lblRangeEnd = document.getElementById('rangeEnd');
    if (lblRangeEnd) lblRangeEnd.textContent = `Partida ${ROLLING_WINDOW}`;
    const simDesc = document.querySelector('#simulator p');
    if (simDesc) simDesc.textContent = `Introdueix les caramboles i entrades de la propera partida per veure com canviarà la teva mitjana de les últimes ${ROLLING_WINDOW} partides.`;

    await carregarDades();

    if (PARTIDES_DATA.length >= ROLLING_WINDOW) {
        currentRange.start = PARTIDES_DATA.length - ROLLING_WINDOW;
        currentRange.end = PARTIDES_DATA.length;
    }

    updateGlobalStats();
    updateQuickStats(currentRange.start, currentRange.end);
    renderPartidesTable();
    setupRangeSlider();
    updateChart();
    updateManageStats();

    // Service Worker per PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrat correctament');
                setInterval(() => registration.update(), 60000);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Nova versió de l\'aplicació disponible!');
                            if (confirm('Hi ha una nova versió disponible. Vols actualitzar ara?')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(error => console.log('Error registrant Service Worker:', error));

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }
}

function refreshAll() {
    updateGlobalStats();

    if (PARTIDES_DATA.length >= ROLLING_WINDOW) {
        currentRange.start = PARTIDES_DATA.length - ROLLING_WINDOW;
        currentRange.end = PARTIDES_DATA.length;
    } else if (PARTIDES_DATA.length > 0) {
        currentRange.start = 0;
        currentRange.end = PARTIDES_DATA.length;
    }

    updateQuickStats(currentRange.start, currentRange.end);
    updateChart();
    renderPartidesTable();
    setupRangeSlider();
    updateManageStats();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'evolution' && chart) {
        chart.resize();
    }
}

// Tancar modal amb ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

window.addEventListener('load', init);
