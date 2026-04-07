// ============================================================================
// Autocompletar oponent / equip / lloc i mini-h2h al modal de partida.
// Es nodreix de TOTES les partides del jugador (totes les modalitats), no
// només de la modalitat activa, perquè un mateix rival reapareix en
// modalitats diferents.
// ============================================================================

let SUGG_PARTIDES_TOTES = [];

async function carregarSuggeriments() {
    const config = BillarConfig.getConfig();
    if (!config) return;

    try {
        const resp = await fetch(`/api/partides?usuari_id=${config.usuariId}`);
        if (!resp.ok) throw new Error(resp.status);
        SUGG_PARTIDES_TOTES = await resp.json();
    } catch (e) {
        console.warn('No s\'han pogut carregar els suggeriments:', e);
        SUGG_PARTIDES_TOTES = (typeof PARTIDES_RAW !== 'undefined' && PARTIDES_RAW.length > 0)
            ? PARTIDES_RAW
            : (PARTIDES_DATA || []);
    }

    omplirDatalists();
}

function omplirDatalists() {
    const oponents = uniqueSorted(SUGG_PARTIDES_TOTES.map(p => p.oponent));
    const equips   = uniqueSorted(SUGG_PARTIDES_TOTES.map(p => p.equip));
    const llocs    = uniqueSorted(SUGG_PARTIDES_TOTES.map(p => p.lloc));

    setOptions('suggOponents', oponents);
    setOptions('suggEquips', equips);
    setOptions('suggLlocs', llocs);
}

function uniqueSorted(arr) {
    const set = new Set();
    for (const v of arr) {
        if (v && typeof v === 'string' && v.trim() !== '') set.add(v.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ca'));
}

function setOptions(datalistId, values) {
    const dl = document.getElementById(datalistId);
    if (!dl) return;
    dl.innerHTML = values.map(v => `<option value="${escapeAttr(v)}"></option>`).join('');
}

function escapeAttr(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ----------------------------------------------------------------------------
// Mini-h2h: quan l'usuari escriu un nom d'oponent que ja existeix, mostra
// resum (partides, V/E/D, mitjana) sota el camp.
// ----------------------------------------------------------------------------
function actualitzarH2H() {
    const input = document.getElementById('formOponent');
    const hint = document.getElementById('h2hHint');
    if (!input || !hint) return;

    const nom = (input.value || '').trim();
    if (!nom || SUGG_PARTIDES_TOTES.length === 0) {
        hint.style.display = 'none';
        return;
    }

    const matches = SUGG_PARTIDES_TOTES.filter(p =>
        p.oponent && p.oponent.trim().toLowerCase() === nom.toLowerCase()
    );

    if (matches.length === 0) {
        hint.style.display = 'none';
        return;
    }

    let v = 0, e = 0, d = 0, totalCar = 0, totalEnt = 0;
    for (const p of matches) {
        totalCar += p.caramboles || 0;
        totalEnt += p.entrades || 0;
        if (p.caramboles > p.caramboles_oponent) v++;
        else if (p.caramboles === p.caramboles_oponent) e++;
        else d++;
    }
    const mitjana = totalEnt > 0 ? (totalCar / totalEnt).toFixed(3) : '—';

    hint.innerHTML = `🎯 <strong>${matches.length} partid${matches.length === 1 ? 'a' : 'es'}</strong> contra <strong>${escapeAttr(nom)}</strong> · ${v}V · ${e}E · ${d}D · mitjana <strong>${mitjana}</strong>`;
    hint.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('formOponent');
    if (inp) {
        inp.addEventListener('input', actualitzarH2H);
        inp.addEventListener('change', actualitzarH2H);
    }
});
