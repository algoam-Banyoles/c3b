/**
 * Servei per gestionar gràfics amb Chart.js
 */
class ChartService {
    constructor() {
        this.chart = null;
    }

    /**
     * Destruir el gràfic actual si existeix
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    /**
     * Crear gràfic d'evolució de la mitjana
     */
    createEvolutionChart(canvasId, partides, options = {}) {
        const {
            showTrend = true,
            showAccumulated = true,
            maxPartides = 15
        } = options;

        if (!partides || partides.length === 0) {
            console.warn('No hi ha partides per mostrar');
            return null;
        }

        // Preparar dades
        const labels = partides.map(p => `P${p.num}`);
        const mitjanes = partides.map(p => p.mitjana);

        // Calcular mitjana acumulada
        const mitjanaAcumulada = partides.map((p, idx) => {
            const startIdx = Math.max(0, idx - maxPartides + 1);
            const endIdx = idx + 1;
            const partidesCalc = partides.slice(startIdx, endIdx);
            const totalCar = partidesCalc.reduce((sum, part) => sum + part.caramboles, 0);
            const totalEnt = partidesCalc.reduce((sum, part) => sum + part.entrades, 0);
            return totalCar / totalEnt;
        });

        // Calcular línia de tendència
        const tendencia = this._calcularTendencia(mitjanes);

        // Datasets
        const datasets = [
            {
                label: 'Mitjana per Partida',
                data: mitjanes,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ];

        if (showAccumulated) {
            datasets.push({
                label: `Mitjana Acumulada (últimes ${maxPartides})`,
                data: mitjanaAcumulada,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6
            });
        }

        if (showTrend) {
            datasets.push({
                label: 'Línia de Tendència',
                data: tendencia,
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0,
                pointRadius: 0,
                pointHoverRadius: 0
            });
        }

        // Destruir gràfic anterior si existeix
        this.destroy();

        // Crear nou gràfic
        const ctx = document.getElementById(canvasId).getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: this._getChartOptions(partides)
        });

        return this.chart;
    }

    /**
     * Obtenir opcions del gràfic
     */
    _getChartOptions(partides) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            const idx = context[0].dataIndex;
                            const partida = partides[idx];
                            return `vs ${partida.oponent}`;
                        },
                        label: (context) => {
                            const idx = context.dataIndex;
                            const partida = partides[idx];

                            if (context.datasetIndex === 0) {
                                return `Partida: ${partida.caramboles}/${partida.entrades} = ${partida.mitjana.toFixed(3)}`;
                            } else if (context.datasetIndex === 1) {
                                const numPartides = Math.min(idx + 1, 15);
                                const startP = partida.num - numPartides + 1;
                                const endP = partida.num;
                                return `Mitjana últimes ${numPartides} (P${startP}-P${endP}): ${context.parsed.y.toFixed(3)}`;
                            }
                            return `Tendència: ${context.parsed.y.toFixed(3)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: (value) => value.toFixed(2)
                    }
                }
            }
        };
    }

    /**
     * Calcular línia de tendència (regressió lineal)
     */
    _calcularTendencia(values) {
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
     * Redimensionar el gràfic
     */
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
}

// Crear instància global
const chartService = new ChartService();

// Exportar per utilitzar a altres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartService;
}
