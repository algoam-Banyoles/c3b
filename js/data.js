// ============================================================================
// Càrrega/desat de dades, import/export, gestió d'emmagatzematge local
// ============================================================================

const STORAGE_KEY = 'billar_partides_data';
const STORAGE_VERSION = '1.0';

async function carregarDades() {
    try {
        PARTIDES_DATA = await BillarConfig.loadPartides();
        console.log('✅ Dades carregades des del servidor:', PARTIDES_DATA.length, 'partides');
        guardarDadesStorage();
    } catch (error) {
        console.error('❌ Error carregant des del servidor:', error);
        console.log('Intentant carregar des de localStorage...');

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                PARTIDES_DATA = data.partides || [];
                console.log('⚠️ Dades carregades des de localStorage (backup):', PARTIDES_DATA.length, 'partides');
            } catch (e) {
                console.error('Error carregant des de localStorage:', e);
                PARTIDES_DATA = [];
            }
        } else {
            PARTIDES_DATA = [];
            console.log('No hi ha dades disponibles');
        }
    }
}

async function guardarDadesStorage() {
    const config = BillarConfig.getConfig();
    if (!config) {
        console.error('No hi ha configuració d\'usuari');
        return;
    }

    const data = {
        version: STORAGE_VERSION,
        lastUpdate: new Date().toISOString(),
        usuari: config.usuariNom,
        modalitat: config.modalitatNom,
        partides: PARTIDES_DATA
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function exportarDades() {
    const data = {
        version: STORAGE_VERSION,
        exportDate: new Date().toISOString(),
        partides: PARTIDES_DATA
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billar_partides_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('✅ Dades exportades correctament!');
}

function importarDades(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.partides && Array.isArray(data.partides)) {
                if (confirm(`Vols importar ${data.partides.length} partides? Això reemplaçarà les dades actuals.`)) {
                    PARTIDES_DATA = data.partides;
                    guardarDadesStorage();
                    refreshAll();
                    alert('✅ Dades importades correctament!');
                }
            } else {
                alert('❌ Format de fitxer no vàlid');
            }
        } catch (e) {
            alert('❌ Error llegint el fitxer: ' + e.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function confirmarEsborrarTot() {
    if (confirm('⚠️ Segur que vols esborrar TOTES les partides? Aquesta acció no es pot desfer.')) {
        if (confirm('⚠️ Última confirmació: S\'esborraran ' + PARTIDES_DATA.length + ' partides. Continuar?')) {
            PARTIDES_DATA = [];
            guardarDadesStorage();
            refreshAll();
            alert('✅ Totes les dades han estat esborrades');
        }
    }
}

function restaurarDadesInicials() {
    if (typeof INITIAL_DATA === 'undefined') {
        alert('No hi ha dades inicials disponibles');
        return;
    }
    if (confirm(`⚠️ Vols restaurar les ${INITIAL_DATA.length} partides inicials? Això reemplaçarà les dades actuals.`)) {
        PARTIDES_DATA = [...INITIAL_DATA];
        guardarDadesStorage();
        refreshAll();
        alert(`✅ Dades restaurades! Ara tens ${PARTIDES_DATA.length} partides.`);
    }
}

function updateManageStats() {
    document.getElementById('totalPartides').textContent = PARTIDES_DATA.length;
    const sizeBytes = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size;
    document.getElementById('espaciUtilitzat').textContent = (sizeBytes / 1024).toFixed(2) + ' KB';
}
