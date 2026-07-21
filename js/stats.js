// ============================================================================
// Estadístiques globals i quick stats del rang seleccionat
// ============================================================================

function updateGlobalStats() {
    // Els indicadors del capçal s'han traslladat al panell d'Indicadors (3 seccions:
    // Històric / Temporada actual / Temporada anterior). Vegeu renderEvolutionIndicators().
    if (!document.getElementById('globalStats')) return;

    const totalPartides = PARTIDES_DATA.length;

    if (totalPartides === 0) {
        document.getElementById('globalStats').innerHTML = `
            <div class="stat-card" style="grid-column: 1 / -1;">
                <div class="label">No hi ha partides</div>
                <div class="value" style="font-size: 16px;">Afegeix la primera partida! ➕</div>
            </div>
        `;
        return;
    }

    const totalCaramboles = PARTIDES_DATA.reduce((sum, p) => sum + p.caramboles, 0);
    const totalEntrades = PARTIDES_DATA.reduce((sum, p) => sum + p.entrades, 0);
    const mitjanaGlobal = totalCaramboles / totalEntrades;

    // Mitjana del rànquing OFICIAL: ΣC/ΣE sobre les partides que la federació
    // compta (camp `computa`, marcat per FCBillar). Es calcula sobre totes les
    // partides (PARTIDES_RAW), independentment del filtre de període.
    const baseComputa = Array.isArray(PARTIDES_RAW) && PARTIDES_RAW.length ? PARTIDES_RAW : PARTIDES_DATA;
    const computaGames = baseComputa.filter(p => p.computa);
    let ranquingCardHTML = '';
    if (computaGames.length) {
        const cC = computaGames.reduce((s, p) => s + p.caramboles, 0);
        const cE = computaGames.reduce((s, p) => s + p.entrades, 0);
        const mjRanquing = cE ? cC / cE : 0;
        ranquingCardHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);">
            <div class="label" style="font-size: 11px; margin-bottom: 3px;">🏅 Mitjana Rànquing (oficial)</div>
            <div class="value" style="font-size: 22px;">${mjRanquing.toFixed(3)}</div>
            <div style="font-size: 10px; opacity: 0.85; margin-top: 3px;">${computaGames.length} partides · ${cC}/${cE}</div>
        </div>`;
    }

    const puntsTotal = calcularEstadistiquesPunts(PARTIDES_DATA);
    const millorPartida = PARTIDES_DATA.reduce((max, p) => p.mitjana > max.mitjana ? p : max);
    const pitjorPartida = PARTIDES_DATA.reduce((min, p) => p.mitjana < min.mitjana ? p : min);
    const rivalFrequent = trobarRivalMesFrequent(PARTIDES_DATA);
    const mitjanesTemporada = calcularMitjanesPerTemporada(PARTIDES_DATA);
    const fiabilitatPerTipus = calcularFiabilitatPerTipus(PARTIDES_DATA);

    // Filtrar partides de la temporada actual
    const ara = new Date();
    const mesActual = ara.getMonth() + 1;
    const anyActual = ara.getFullYear();
    const temporadaActual = mesActual >= 8 ? `${anyActual}-${anyActual + 1}` : `${anyActual - 1}-${anyActual}`;

    const partidesTemporadaActual = PARTIDES_DATA.filter(p => {
        if (!p.data) return false;
        const data = new Date(p.data);
        const mes = data.getMonth() + 1;
        const any = data.getFullYear();
        const temporada = mes >= 8 ? `${any}-${any + 1}` : `${any - 1}-${any}`;
        return temporada === temporadaActual;
    });

    const fiabilitatPerTipusTemporadaActual = calcularFiabilitatPerTipus(partidesTemporadaActual);

    const statsHTML = `
        <div class="stat-card">
            <div class="label">Partides Totals</div>
            <div class="value">${totalPartides}</div>
            <div class="subvalue">${puntsTotal.victories}V - ${puntsTotal.empats}E - ${puntsTotal.derrotes}D</div>
        </div>
        <div class="stat-card">
            <div class="label">Punts Totals</div>
            <div class="value">${puntsTotal.puntsGuanyats}/${puntsTotal.puntsDisputats}</div>
            <div class="subvalue">${((puntsTotal.puntsGuanyats / puntsTotal.puntsDisputats) * 100).toFixed(1)}% efectivitat</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <div class="label" style="font-size: 11px; margin-bottom: 3px;">🏆 Millor Partida</div>
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${millorPartida.oponent}</div>
            <div class="value" style="font-size: 20px;">${millorPartida.mitjana.toFixed(3)}</div>
            <div style="font-size: 10px; opacity: 0.85; margin-top: 3px;">${millorPartida.caramboles}/${millorPartida.entrades}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
            <div class="label" style="font-size: 11px; margin-bottom: 3px;">⚠️ Pitjor Partida</div>
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${pitjorPartida.oponent}</div>
            <div class="value" style="font-size: 20px;">${pitjorPartida.mitjana.toFixed(3)}</div>
            <div style="font-size: 10px; opacity: 0.85; margin-top: 3px;">${pitjorPartida.caramboles}/${pitjorPartida.entrades}</div>
        </div>
        ${rivalFrequent ? `
        <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
            <div class="label" style="font-size: 11px; margin-bottom: 3px;">🎯 Rival Habitual</div>
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${rivalFrequent.nom}</div>
            <div class="value" style="font-size: 20px;">${rivalFrequent.total} partides</div>
            <div style="font-size: 10px; opacity: 0.85; margin-top: 3px;">${rivalFrequent.victories}V - ${rivalFrequent.empats}E - ${rivalFrequent.derrotes}D</div>
        </div>
        ` : ''}
        ${fiabilitatPerTipus.length > 0 ? `
        <div class="stat-card" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); grid-column: 1 / -1;">
            <div class="label" style="font-size: 12px; margin-bottom: 8px;">🎯 Efectivitat per Competició</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                ${fiabilitatPerTipus.map(t => `
                    <div style="background: rgba(255,255,255,0.15); padding: 8px; border-radius: 6px;">
                        <div style="font-size: 10px; opacity: 0.9; margin-bottom: 2px;">${t.tipus} (${t.partides})</div>
                        <div style="font-size: 16px; font-weight: bold;">${t.fiabilitat.toFixed(1)}%</div>
                        <div style="font-size: 9px; opacity: 0.85; margin-top: 2px;">${t.puntsGuanyats}/${t.puntsDisputats}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        ${fiabilitatPerTipusTemporadaActual.length > 0 ? `
        <div class="stat-card" style="background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); grid-column: 1 / -1;">
            <div class="label" style="font-size: 12px; margin-bottom: 8px;">🎯 Efectivitat per Competició (${temporadaActual})</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                ${fiabilitatPerTipusTemporadaActual.map(t => `
                    <div style="background: rgba(255,255,255,0.15); padding: 8px; border-radius: 6px;">
                        <div style="font-size: 10px; opacity: 0.9; margin-bottom: 2px;">${t.tipus} (${t.partides})</div>
                        <div style="font-size: 16px; font-weight: bold;">${t.fiabilitat.toFixed(1)}%</div>
                        <div style="font-size: 9px; opacity: 0.85; margin-top: 2px;">${t.puntsGuanyats}/${t.puntsDisputats}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;

    document.getElementById('globalStats').innerHTML = statsHTML;
}

// Estadístiques ràpides per al rang seleccionat
function updateQuickStats(start, end) {
    if (PARTIDES_DATA.length === 0) {
        document.getElementById('quickStats').innerHTML = '';
        return;
    }

    const partides = PARTIDES_DATA.slice(start, end);
    const totalCar = partides.reduce((sum, p) => sum + p.caramboles, 0);
    const totalEnt = partides.reduce((sum, p) => sum + p.entrades, 0);
    const mitjana = totalCar / totalEnt;

    const millor = partides.reduce((max, p) => p.mitjana > max ? p.mitjana : max, 0);
    const pitjor = partides.reduce((min, p) => p.mitjana < min ? p.mitjana : min, 1);

    const primeres5 = partides.slice(0, 5);
    const carPrimeres5 = primeres5.reduce((sum, p) => sum + p.caramboles, 0);
    const entPrimeres5 = primeres5.reduce((sum, p) => sum + p.entrades, 0);
    const mitjanaPrimeres5 = entPrimeres5 > 0 ? carPrimeres5 / entPrimeres5 : 0;

    const darreres5 = partides.slice(-5);
    const carDarreres5 = darreres5.reduce((sum, p) => sum + p.caramboles, 0);
    const entDarreres5 = darreres5.reduce((sum, p) => sum + p.entrades, 0);
    const mitjanaDarreres5 = entDarreres5 > 0 ? carDarreres5 / entDarreres5 : 0;

    const estatsPunts = calcularEstadistiquesPunts(partides);
    const fiabilitat = estatsPunts.puntsDisputats > 0
        ? (estatsPunts.puntsGuanyats / estatsPunts.puntsDisputats) * 100
        : 0;

    const statsHTML = `
        <div class="quick-stat">
            <div class="quick-stat-label">Mitjana</div>
            <div class="quick-stat-value">${mitjana.toFixed(3)}</div>
        </div>
        <div class="quick-stat">
            <div class="quick-stat-label">Caramboles/Entrades</div>
            <div class="quick-stat-value">${totalCar}/${totalEnt}</div>
        </div>
        <div class="quick-stat">
            <div class="quick-stat-label">Fiabilitat</div>
            <div class="quick-stat-value">${fiabilitat.toFixed(1)}% (${estatsPunts.puntsGuanyats}/${estatsPunts.puntsDisputats})</div>
        </div>
        <div class="quick-stat">
            <div class="quick-stat-label">Millor Mitjana</div>
            <div class="quick-stat-value best">${millor.toFixed(3)}</div>
        </div>
        <div class="quick-stat">
            <div class="quick-stat-label">Pitjor Mitjana</div>
            <div class="quick-stat-value worst">${pitjor.toFixed(3)}</div>
        </div>
        <div class="quick-stat">
            <div class="quick-stat-label">Mitjana Primeres 5</div>
            <div class="quick-stat-value">${mitjanaPrimeres5.toFixed(3)}</div>
        </div>
        <div class="quick-stat">
            <div class="quick-stat-label">Mitjana Darreres 5</div>
            <div class="quick-stat-value">${mitjanaDarreres5.toFixed(3)}</div>
        </div>
    `;

    document.getElementById('quickStats').innerHTML = statsHTML;
}

// ============================================================================
// Indicadors d'evolució: 3 seccions (Històric / Temp. actual / Temp. anterior),
// els mateixos indicadors a cadascuna + "Propera mitjana" a Temporada actual.
// Es calcula SEMPRE sobre PARTIDES_RAW (totes), independentment del filtre de
// període: mostra les tres finestres alhora.
// ============================================================================

function _evoTemporadaDe(dateStr) {
    const d = new Date(dateStr);
    const mes = d.getMonth() + 1, any = d.getFullYear();
    return mes >= 8 ? `${any}-${any + 1}` : `${any - 1}-${any}`;
}

// Rivals destacats d'un conjunt de partides. Cada llista mostra TOTS els rivals
// empatats al màxim, amb un mínim de 2:
//   · habituals → rivals amb qui més s'ha jugat (màx de partides, ≥2)
//   · mesVict   → rivals a qui més s'ha guanyat (màx de victòries, ≥2)
//   · mesDerr   → rivals contra qui més s'ha perdut (màx de derrotes, ≥2)
// Vict/derr es calculen entre els NO habituals, perquè un habitual no es repeteixi
// (el seu V-E-D ja es veu a la línia d'habituals).
function _evoRivals(partides) {
    const r = {};
    for (const p of partides) {
        const o = (p.oponent || '').trim();
        if (!o) continue;
        if (!r[o]) r[o] = { nom: o, total: 0, v: 0, e: 0, d: 0 };
        r[o].total++;
        if (p.caramboles > p.caramboles_oponent) r[o].v++;
        else if (p.caramboles === p.caramboles_oponent) r[o].e++;
        else r[o].d++;
    }
    const rivals = Object.values(r);
    const byNom = (a, b) => a.nom.localeCompare(b.nom);
    const topsBy = (list, key) => {
        const max = list.reduce((m, x) => Math.max(m, x[key]), 0);
        return max >= 2 ? list.filter(x => x[key] === max).sort(byNom) : [];
    };
    const habituals = topsBy(rivals, 'total');
    const habNoms = new Set(habituals.map(x => x.nom));
    const others = rivals.filter(x => !habNoms.has(x.nom));
    return { habituals, mesVict: topsBy(others, 'v'), mesDerr: topsBy(others, 'd') };
}

function _evoAgg(partides) {
    if (!partides.length) return null;
    const c = partides.reduce((s, p) => s + p.caramboles, 0);
    const e = partides.reduce((s, p) => s + p.entrades, 0);
    const avg = p => (p.entrades ? p.caramboles / p.entrades : 0);
    let mi = partides[0], pi = partides[0];
    for (const p of partides) { if (avg(p) > avg(mi)) mi = p; if (avg(p) < avg(pi)) pi = p; }
    const pts = calcularEstadistiquesPunts(partides);
    const efect = pts.puntsDisputats ? (pts.puntsGuanyats / pts.puntsDisputats) * 100 : 0;
    const sm = partides.reduce((m, p) => Math.max(m, p.serie_major || 0), 0);
    return {
        n: partides.length, c, e,
        mj: e ? c / e : 0,
        millor: { mj: avg(mi), op: mi.oponent }, pitjor: { mj: avg(pi), op: pi.oponent },
        victories: pts.victories, empats: pts.empats, derrotes: pts.derrotes,
        puntsGuanyats: pts.puntsGuanyats, puntsDisputats: pts.puntsDisputats, efect, sm,
        rivals: _evoRivals(partides),
        comp: calcularFiabilitatPerTipus(partides)
    };
}

function _mjOf(partides) {
    const e = partides.reduce((s, p) => s + p.entrades, 0);
    return e ? partides.reduce((s, p) => s + p.caramboles, 0) / e : null;
}

function _evoSeccio(titol, cls, a, extra = '') {
    let cos;
    if (!a) {
        cos = `<div class="evo-empty">Sense partides</div>`;
    } else {
        const vd = x => `<span class="ved-v">${x.v}</span>-<span class="ved-e">${x.e}</span>-<span class="ved-d">${x.d}</span>`;
        const rl = [];
        const H = a.rivals.habituals;
        if (H.length) {
            const items = H.map(h => `<b>${h.nom}</b> (${h.total} / ${vd(h)})`).join(', ');
            rl.push(`<div class="evo-line">${H.length > 1 ? 'Rivals habituals' : 'Rival habitual'}: ${items}</div>`);
        }
        if (a.rivals.mesVict.length) {
            const items = a.rivals.mesVict.map(x => `<b>${x.nom}</b> (<span class="ved-v">${x.v}V</span>)`).join(', ');
            rl.push(`<div class="evo-line">Més victòries: ${items}</div>`);
        }
        if (a.rivals.mesDerr.length) {
            const items = a.rivals.mesDerr.map(x => `<b>${x.nom}</b> (<span class="ved-d">${x.d}D</span>)`).join(', ');
            rl.push(`<div class="evo-line">Més derrotes: ${items}</div>`);
        }
        const rival = rl.join('');
        const comp = a.comp && a.comp.length
            ? `<div class="evo-sep">Efectivitat per competició</div>
               <div class="evo-chips">${a.comp.map(t =>
                   `<span class="evo-chip">${t.tipus} <b>${Math.round(t.fiabilitat)}%</b> <span class="evo-cved"><span class="ved-v">${t.victories}</span>-<span class="ved-e">${t.empats}</span>-<span class="ved-d">${t.derrotes}</span></span></span>`).join('')}</div>`
            : '';
        cos = `<div class="evo-mjl">Mitjana</div><div class="evo-mj">${a.mj.toFixed(3)}</div>
           <div class="evo-sub">${a.n} partides · ${a.c}/${a.e}</div>
           <div class="evo-row">
               <div class="evo-mini"><div class="l">Millor</div><div class="v best">${a.millor.mj.toFixed(3)}</div><div class="n">${a.millor.op || '—'}</div></div>
               <div class="evo-mini"><div class="l">Pitjor</div><div class="v worst">${a.pitjor.mj.toFixed(3)}</div><div class="n">${a.pitjor.op || '—'}</div></div>
           </div>
           <div class="evo-row">
               <div class="evo-mini"><div class="l">Efectivitat</div><div class="v">${a.efect.toFixed(1)}%</div></div>
               <div class="evo-mini"><div class="l">V-E-D</div><div class="v"><span class="ved-v">${a.victories}</span>-<span class="ved-e">${a.empats}</span>-<span class="ved-d">${a.derrotes}</span></div></div>
           </div>
           <div class="evo-row">
               <div class="evo-mini"><div class="l">Punts</div><div class="v">${a.puntsGuanyats}/${a.puntsDisputats}</div></div>
               <div class="evo-mini"><div class="l">Millor sèrie</div><div class="v">${a.sm || '—'}</div></div>
           </div>
           ${rival}${comp}`;
    }
    return `<div class="evo-sec"><div class="evo-h ${cls}">${titol}</div><div class="evo-b">${cos}${extra}</div></div>`;
}

function renderEvolutionIndicators() {
    const el = document.getElementById('evolutionIndicators');
    if (!el) return;
    const all = (Array.isArray(PARTIDES_RAW) && PARTIDES_RAW.length) ? PARTIDES_RAW : PARTIDES_DATA;
    if (!all.length) { el.innerHTML = ''; return; }

    const ambData = all.filter(p => p.data);
    const now = new Date();
    const mesAra = now.getMonth() + 1, anyAra = now.getFullYear();
    const tempActual = mesAra >= 8 ? `${anyAra}-${anyAra + 1}` : `${anyAra - 1}-${anyAra}`;
    const [ta, tb] = tempActual.split('-').map(Number);
    const tempAnterior = `${ta - 1}-${tb - 1}`;

    const hist = _evoAgg(all);
    const cur = _evoAgg(ambData.filter(p => _evoTemporadaDe(p.data) === tempActual));
    const prev = _evoAgg(ambData.filter(p => _evoTemporadaDe(p.data) === tempAnterior));

    // Propera mitjana (proper rànquing) + rànquing actual, per la delta.
    const compGames = all.filter(p => p.computa);
    const proxGames = all.filter(p => p.computa_prox);
    const mjActual = compGames.length ? _mjOf(compGames) : null;
    const mjProx = proxGames.length ? _mjOf(proxGames) : null;
    let proxBlock = '';
    if (mjProx != null) {
        let dtxt = 'projecció del proper rànquing';
        let dcls = '';
        if (mjActual != null) {
            const delta = mjProx - mjActual;
            const fletxa = delta > 0.0005 ? '▲' : delta < -0.0005 ? '▼' : '▬';
            dcls = delta < -0.0005 ? 'down' : '';
            dtxt = `${fletxa} ${delta >= 0 ? '+' : ''}${delta.toFixed(3)} vs rànquing actual (${mjActual.toFixed(3)})`;
        }
        proxBlock = `<div class="evo-prox">
            <div class="l">🟢 Propera mitjana</div>
            <div class="v">${mjProx.toFixed(3)}</div>
            <div class="d ${dcls}">${dtxt}</div>
        </div>`;
    }

    el.innerHTML = `<h2>📊 Indicadors</h2>
        <div class="evo-grid">
            ${_evoSeccio('Històric', 'evo-hist', hist)}
            ${_evoSeccio(`Temporada actual · ${tempActual}`, 'evo-cur', cur, proxBlock)}
            ${_evoSeccio(`Temporada anterior · ${tempAnterior}`, 'evo-prev', prev)}
        </div>`;
}
