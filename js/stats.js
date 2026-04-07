// ============================================================================
// Estadístiques globals i quick stats del rang seleccionat
// ============================================================================

function updateGlobalStats() {
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
        <div class="stat-card">
            <div class="label">Mitjana Global</div>
            <div class="value">${mitjanaGlobal.toFixed(3)}</div>
            <div class="subvalue">${totalCaramboles} caramboles</div>
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
        ${mitjanesTemporada.length > 0 ? `
        <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            <div class="label" style="font-size: 11px; margin-bottom: 3px;">📅 Temporada Actual ${mitjanesTemporada[0].temporada}</div>
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${mitjanesTemporada[0].partides} partides</div>
            <div class="value" style="font-size: 20px;">${mitjanesTemporada[0].mitjana.toFixed(3)}</div>
            <div style="font-size: 10px; opacity: 0.85; margin-top: 3px;">${mitjanesTemporada[0].caramboles}/${mitjanesTemporada[0].entrades}</div>
        </div>
        ` : ''}
        ${mitjanesTemporada.length > 1 ? `
        <div class="stat-card" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
            <div class="label" style="font-size: 11px; margin-bottom: 3px;">📅 Temporada Anterior ${mitjanesTemporada[1].temporada}</div>
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${mitjanesTemporada[1].partides} partides</div>
            <div class="value" style="font-size: 20px;">${mitjanesTemporada[1].mitjana.toFixed(3)}</div>
            <div style="font-size: 10px; opacity: 0.85; margin-top: 3px;">${mitjanesTemporada[1].caramboles}/${mitjanesTemporada[1].entrades}</div>
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
