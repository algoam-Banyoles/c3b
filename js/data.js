// ============================================================================
// Càrrega/desat de dades, import/export, gestió d'emmagatzematge local
// ============================================================================

const STORAGE_KEY = 'billar_partides_data';
const STORAGE_VERSION = '1.0';

async function carregarDades() {
    try {
        PARTIDES_RAW = await BillarConfig.loadPartides();
        guardarDadesStorage();
    } catch (error) {
        console.error('Error carregant des del servidor:', error);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                PARTIDES_RAW = data.partides || [];
            } catch (e) {
                console.error('Error carregant des de localStorage:', e);
                PARTIDES_RAW = [];
            }
        } else {
            PARTIDES_RAW = [];
        }
    }
    aplicarFiltrePeriode();
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
        partides: PARTIDES_RAW
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function exportarDades() {
    const data = {
        version: STORAGE_VERSION,
        exportDate: new Date().toISOString(),
        partides: PARTIDES_RAW
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

    toast.success('Dades exportades correctament');
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
                    PARTIDES_RAW = data.partides;
                    aplicarFiltrePeriode();
                    guardarDadesStorage();
                    refreshAll();
                    toast.success('Dades importades correctament');
                }
            } else {
                toast.error('Format de fitxer no vàlid');
            }
        } catch (e) {
            toast.error('Error llegint el fitxer: ' + e.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function confirmarEsborrarTot() {
    if (confirm('⚠️ Segur que vols esborrar TOTES les partides? Aquesta acció no es pot desfer.')) {
        if (confirm('⚠️ Última confirmació: S\'esborraran ' + PARTIDES_RAW.length + ' partides. Continuar?')) {
            PARTIDES_RAW = [];
            aplicarFiltrePeriode();
            guardarDadesStorage();
            refreshAll();
            toast.success('Totes les dades han estat esborrades');
        }
    }
}

function restaurarDadesInicials() {
    if (typeof INITIAL_DATA === 'undefined') {
        toast.warning('No hi ha dades inicials disponibles');
        return;
    }
    if (confirm(`⚠️ Vols restaurar les ${INITIAL_DATA.length} partides inicials? Això reemplaçarà les dades actuals.`)) {
        PARTIDES_RAW = [...INITIAL_DATA];
        aplicarFiltrePeriode();
        guardarDadesStorage();
        refreshAll();
        toast.success(`Dades restaurades. Ara tens ${PARTIDES_RAW.length} partides`);
    }
}

function updateManageStats() {
    document.getElementById('totalPartides').textContent = PARTIDES_RAW.length;
    const sizeBytes = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size;
    document.getElementById('espaciUtilitzat').textContent = (sizeBytes / 1024).toFixed(2) + ' KB';
}
