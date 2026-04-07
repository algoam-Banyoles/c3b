// ============================================================================
// Estat global, init, refreshAll, switching de pestanyes, esdeveniments
// ============================================================================

let PARTIDES_DATA = [];   // vista filtrada pel període seleccionat
let PARTIDES_RAW = [];    // totes les partides carregades del servidor
let chart = null;
// Finestra de la mitjana mòbil: 15 per 3 Bandes, 10 per la resta. S'estableix a init().
let ROLLING_WINDOW = 15;
let currentRange = { start: 0, end: 15 };
let editingIndex = -1;

const PERIOD_FILTER_KEY = 'billar_period_filter';
let currentPeriod = 'all';

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

    restaurarPeriode();
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
    restaurarTabActiva();
    if (typeof comprovarRecordatori === 'function') comprovarRecordatori();

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

// ----------------------------------------------------------------------------
// Filtre per període
// ----------------------------------------------------------------------------
function temporadaDe(dateIso) {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return null;
    const mes = d.getMonth() + 1;
    const any = d.getFullYear();
    return mes >= 8 ? `${any}-${any + 1}` : `${any - 1}-${any}`;
}

function temporadaActualLabel() {
    const ara = new Date();
    return temporadaDe(ara.toISOString());
}

function temporadaAnteriorLabel() {
    const [a, b] = temporadaActualLabel().split('-').map(Number);
    return `${a - 1}-${b - 1}`;
}

function aplicarFiltrePeriode() {
    if (!Array.isArray(PARTIDES_RAW)) {
        PARTIDES_DATA = [];
        return;
    }
    if (currentPeriod === 'all') {
        PARTIDES_DATA = [...PARTIDES_RAW];
        return;
    }
    if (currentPeriod === '90d') {
        const cutoff = Date.now() - 90 * 86400000;
        PARTIDES_DATA = PARTIDES_RAW.filter(p => {
            if (!p.data) return false;
            const t = new Date(p.data).getTime();
            return !isNaN(t) && t >= cutoff;
        });
        return;
    }
    const target = currentPeriod === 'current'
        ? temporadaActualLabel()
        : temporadaAnteriorLabel();
    PARTIDES_DATA = PARTIDES_RAW.filter(p => p.data && temporadaDe(p.data) === target);
}

function canviarPeriode(value) {
    currentPeriod = value;
    try { localStorage.setItem(PERIOD_FILTER_KEY, value); } catch (_) {}
    aplicarFiltrePeriode();
    refreshAll();
}

function restaurarPeriode() {
    const saved = localStorage.getItem(PERIOD_FILTER_KEY);
    if (saved && ['all', 'current', 'previous', '90d'].includes(saved)) {
        currentPeriod = saved;
        const sel = document.getElementById('periodFilter');
        if (sel) sel.value = saved;
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

const ACTIVE_TAB_KEY = 'billar_active_tab';
const VALID_TABS = ['evolution', 'simulator', 'table', 'manage'];

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    if (typeof event !== 'undefined' && event && event.target) {
        event.target.classList.add('active');
    } else {
        // Activació programàtica: troba el botó pel onclick
        const btn = Array.from(document.querySelectorAll('.tab'))
            .find(b => (b.getAttribute('onclick') || '').includes(`'${tabName}'`));
        if (btn) btn.classList.add('active');
    }

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    try { localStorage.setItem(ACTIVE_TAB_KEY, tabName); } catch (_) {}

    if (tabName === 'evolution' && chart) {
        chart.resize();
    }
}

function restaurarTabActiva() {
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    if (saved && VALID_TABS.includes(saved) && saved !== 'evolution') {
        switchTab(saved);
    }
}

// Tancar modal amb ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

window.addEventListener('load', init);
