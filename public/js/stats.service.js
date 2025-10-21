/**
 * Servei per calcular estadístiques de billar
 */
class StatsService {
    /**
     * Calcular la mitjana d'un conjunt de partides
     */
    static calcularMitjana(partides) {
        if (!partides || partides.length === 0) return 0;

        const totalCaramboles = partides.reduce((sum, p) => sum + p.caramboles, 0);
        const totalEntrades = partides.reduce((sum, p) => sum + p.entrades, 0);

        return totalEntrades > 0 ? totalCaramboles / totalEntrades : 0;
    }

    /**
     * Calcular punts d'una partida
     */
    static calcularPuntsPartida(partida) {
        // Comprovar si és copa (3 punts per victòria)
        const esCopa = partida.lloc && (
            partida.lloc.toLowerCase().includes('copa') ||
            partida.equip?.toLowerCase().includes('copa')
        );
        const puntsVictoria = esCopa ? 3 : 2;

        if (partida.caramboles > partida.caramboles_oponent) {
            return puntsVictoria; // Victòria
        } else if (partida.caramboles === partida.caramboles_oponent) {
            return 1; // Empat
        } else {
            return 0; // Derrota
        }
    }

    /**
     * Calcular estadístiques de punts d'un conjunt de partides
     */
    static calcularEstadistiquesPunts(partides) {
        let puntsGuanyats = 0;
        let victories = 0;
        let empats = 0;
        let derrotes = 0;

        partides.forEach(p => {
            if (p.oponent && p.oponent.trim() !== '') {
                const punts = this.calcularPuntsPartida(p);
                puntsGuanyats += punts;

                if (p.caramboles > p.caramboles_oponent) victories++;
                else if (p.caramboles === p.caramboles_oponent) empats++;
                else derrotes++;
            }
        });

        const puntsDisputats = partides.filter(p => p.oponent && p.oponent.trim() !== '').length * 2;

        return {
            puntsGuanyats,
            puntsDisputats,
            victories,
            empats,
            derrotes,
            percentatgeEfectivitat: puntsDisputats > 0 ? (puntsGuanyats / puntsDisputats) * 100 : 0
        };
    }

    /**
     * Obtenir la millor i pitjor partida
     */
    static getMillorIPitjorPartida(partides) {
        if (!partides || partides.length === 0) {
            return { millor: null, pitjor: null };
        }

        const millor = partides.reduce((max, p) => p.mitjana > max.mitjana ? p : max);
        const pitjor = partides.reduce((min, p) => p.mitjana < min.mitjana ? p : min);

        return { millor, pitjor };
    }

    /**
     * Calcular mitjana acumulada progressiva
     */
    static calcularMitjanaAcumulada(partides, maxPartides = 15) {
        return partides.map((p, idx) => {
            const startIdx = Math.max(0, idx - maxPartides + 1);
            const endIdx = idx + 1;
            const partidesCalc = partides.slice(startIdx, endIdx);
            return this.calcularMitjana(partidesCalc);
        });
    }

    /**
     * Calcular línia de tendència (regressió lineal)
     */
    static calcularTendencia(values) {
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

    /**
     * Simular una nova partida i veure l'impacte en la mitjana
     */
    static simularNovaPartida(partidesActuals, novaCaramboles, novesEntrades, maxPartides = 15) {
        if (partidesActuals.length < maxPartides) {
            return {
                error: `Necessites almenys ${maxPartides} partides per usar el simulador`
            };
        }

        // Últimes maxPartides partides
        const ultimes = partidesActuals.slice(-maxPartides);
        const mitjanaActual = this.calcularMitjana(ultimes);

        // Noves últimes maxPartides (treient la primera i afegint la nova)
        const ultimesSensePrimera = partidesActuals.slice(-(maxPartides - 1));
        const partidesNoves = [
            ...ultimesSensePrimera,
            { caramboles: novaCaramboles, entrades: novesEntrades }
        ];
        const mitjanaNova = this.calcularMitjana(partidesNoves);

        const diferencia = mitjanaNova - mitjanaActual;

        return {
            mitjanaActual,
            mitjanaNova,
            diferencia,
            novaPartidaMitjana: novaCaramboles / novesEntrades
        };
    }

    /**
     * Obtenir estadístiques globals
     */
    static getEstadistiquesGlobals(partides) {
        if (!partides || partides.length === 0) {
            return null;
        }

        const mitjanaGlobal = this.calcularMitjana(partides);
        const punts = this.calcularEstadistiquesPunts(partides);
        const { millor, pitjor } = this.getMillorIPitjorPartida(partides);

        // Últimes 15 partides
        const ultimes15 = partides.slice(-15);
        const mitjana15 = this.calcularMitjana(ultimes15);
        const punts15 = this.calcularEstadistiquesPunts(ultimes15);

        return {
            totalPartides: partides.length,
            mitjanaGlobal,
            puntsTotal: punts,
            millor,
            pitjor,
            ultimes15: {
                count: ultimes15.length,
                mitjana: mitjana15,
                punts: punts15
            }
        };
    }

    /**
     * Obtenir estadístiques d'un rang de partides
     */
    static getEstadistiquesRang(partides, start, end) {
        const partidesRang = partides.slice(start, end);
        const mitjana = this.calcularMitjana(partidesRang);

        const millor = partidesRang.reduce((max, p) => p.mitjana > max ? p.mitjana : max, 0);
        const pitjor = partidesRang.reduce((min, p) => p.mitjana < min ? p.mitjana : min, 1);

        // Primeres 5 i darreres 5
        const primeres5 = partidesRang.slice(0, 5);
        const darreres5 = partidesRang.slice(-5);

        return {
            count: partidesRang.length,
            mitjana,
            millor,
            pitjor,
            mitjanaPrimeres5: this.calcularMitjana(primeres5),
            mitjanaDarreres5: this.calcularMitjana(darreres5)
        };
    }
}

// Exportar per utilitzar a altres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatsService;
}
