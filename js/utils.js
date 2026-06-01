// ============================================================================
// Utilitats de càlcul (punts, estadístiques, temporades, tendències)
// ============================================================================

// Calcular punts d'una partida (sistema 2-1-0, copa 3-1-0)
function calcularPuntsPartida(partida) {
    const esCopa = partida.lloc && (
        partida.lloc.toLowerCase().includes('copa') ||
        partida.equip?.toLowerCase().includes('copa')
    );
    const puntsVictoria = esCopa ? 3 : 2;

    if (partida.caramboles > partida.caramboles_oponent) {
        return puntsVictoria;
    } else if (partida.caramboles === partida.caramboles_oponent) {
        return 1;
    } else {
        return 0;
    }
}

// Calcular estadístiques de punts (V/E/D, punts guanyats, punts disputats)
function calcularEstadistiquesPunts(partides) {
    let puntsGuanyats = 0;
    let victories = 0;
    let empats = 0;
    let derrotes = 0;

    partides.forEach(p => {
        if (p.oponent && p.oponent.trim() !== '') {
            puntsGuanyats += calcularPuntsPartida(p);

            if (p.caramboles > p.caramboles_oponent) victories++;
            else if (p.caramboles === p.caramboles_oponent) empats++;
            else derrotes++;
        }
    });

    const puntsDisputats = partides.filter(p => p.oponent && p.oponent.trim() !== '').length * 2;

    return { puntsGuanyats, puntsDisputats, victories, empats, derrotes };
}

// Trobar rival més freqüent amb estadístiques agregades
function trobarRivalMesFrequent(partides) {
    const rivals = {};

    partides.forEach(p => {
        if (p.oponent && p.oponent.trim() !== '') {
            if (!rivals[p.oponent]) {
                rivals[p.oponent] = { victories: 0, empats: 0, derrotes: 0, total: 0 };
            }
            rivals[p.oponent].total++;

            if (p.caramboles > p.caramboles_oponent) rivals[p.oponent].victories++;
            else if (p.caramboles === p.caramboles_oponent) rivals[p.oponent].empats++;
            else rivals[p.oponent].derrotes++;
        }
    });

    let rivalMesFrequent = null;
    let maxPartides = 0;
    for (const [nom, stats] of Object.entries(rivals)) {
        if (stats.total > maxPartides) {
            maxPartides = stats.total;
            rivalMesFrequent = { nom, ...stats };
        }
    }

    return rivalMesFrequent;
}

// Calcular mitjanes per temporada (agost-juliol)
function calcularMitjanesPerTemporada(partides) {
    const temporades = {};

    partides.forEach(p => {
        if (!p.data) return;

        const data = new Date(p.data);
        const mes = data.getMonth() + 1;
        const any = data.getFullYear();
        const temporada = mes >= 8 ? `${any}-${any + 1}` : `${any - 1}-${any}`;

        if (!temporades[temporada]) {
            temporades[temporada] = { caramboles: 0, entrades: 0, partides: 0 };
        }
        temporades[temporada].caramboles += p.caramboles;
        temporades[temporada].entrades += p.entrades;
        temporades[temporada].partides++;
    });

    return Object.entries(temporades).map(([nom, stats]) => ({
        temporada: nom,
        mitjana: stats.entrades > 0 ? stats.caramboles / stats.entrades : 0,
        partides: stats.partides,
        caramboles: stats.caramboles,
        entrades: stats.entrades
    })).sort((a, b) => b.temporada.localeCompare(a.temporada));
}

// Calcular fiabilitat per tipus de competició
function calcularFiabilitatPerTipus(partides) {
    const tipus = {
        'Lliga':      { partides: [], puntsGuanyats: 0, puntsDisputats: 0 },
        'Open':       { partides: [], puntsGuanyats: 0, puntsDisputats: 0 },
        'Individual': { partides: [], puntsGuanyats: 0, puntsDisputats: 0 },
        'Copa':       { partides: [], puntsGuanyats: 0, puntsDisputats: 0 }
    };

    partides.forEach(p => {
        if (!p.competicio || !p.oponent || p.oponent.trim() === '') return;

        const comp = p.competicio.toLowerCase();
        let tipusDetectat = null;
        if (comp.includes('liga') || comp.includes('lliga')) tipusDetectat = 'Lliga';
        else if (comp.includes('open')) tipusDetectat = 'Open';
        else if (comp.includes('individual') || comp.includes('catalunya')) tipusDetectat = 'Individual';
        else if (comp.includes('copa')) tipusDetectat = 'Copa';

        if (tipusDetectat && tipus[tipusDetectat]) {
            tipus[tipusDetectat].partides.push(p);
            const puntsVictoria = (tipusDetectat === 'Copa') ? 3 : 2;
            tipus[tipusDetectat].puntsDisputats += puntsVictoria;

            if (p.caramboles > p.caramboles_oponent) {
                tipus[tipusDetectat].puntsGuanyats += puntsVictoria;
            } else if (p.caramboles === p.caramboles_oponent) {
                tipus[tipusDetectat].puntsGuanyats += 1;
            }
        }
    });

    return Object.entries(tipus)
        .filter(([_, stats]) => stats.puntsDisputats > 0)
        .map(([nom, stats]) => ({
            tipus: nom,
            fiabilitat: (stats.puntsGuanyats / stats.puntsDisputats) * 100,
            puntsGuanyats: stats.puntsGuanyats,
            puntsDisputats: stats.puntsDisputats,
            partides: stats.partides.length
        }))
        .sort((a, b) => b.fiabilitat - a.fiabilitat);
}

// Línia de tendència (regressió lineal simple)
function calcularTendencia(values) {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return values.map((_, i) => slope * i + intercept);
}
