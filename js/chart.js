// ============================================================================
// Gràfic d'evolució (Chart.js) i range slider
// ============================================================================

function setupRangeSlider() {
    if (PARTIDES_DATA.length < ROLLING_WINDOW) {
        document.querySelector('.range-selector').style.display = 'none';
        return;
    }

    document.querySelector('.range-selector').style.display = 'block';
    const slider = document.getElementById('rangeSlider');
    const maxRange = PARTIDES_DATA.length - (ROLLING_WINDOW - 1);
    slider.max = maxRange;
    slider.value = currentRange.start + 1;

    slider.oninput = function() {
        const startIdx = parseInt(this.value) - 1;
        const endIdx = startIdx + ROLLING_WINDOW;
        currentRange = { start: startIdx, end: endIdx };

        document.getElementById('rangeStart').textContent = `Partida ${PARTIDES_DATA[startIdx].num}`;
        document.getElementById('rangeEnd').textContent = `Partida ${PARTIDES_DATA[endIdx - 1].num}`;

        updateQuickStats(startIdx, endIdx);
        updateChart();
    };

    document.getElementById('rangeStart').textContent = `Partida ${PARTIDES_DATA[currentRange.start].num}`;
    document.getElementById('rangeEnd').textContent = `Partida ${PARTIDES_DATA[currentRange.end - 1].num}`;
}

function updateChart() {
    if (PARTIDES_DATA.length === 0) {
        if (chart) {
            chart.destroy();
            chart = null;
        }
        return;
    }

    const partidesVisibles = PARTIDES_DATA.slice(currentRange.start, currentRange.end);
    const labels = partidesVisibles.map(p => `P${p.num}`);
    const mitjanes = partidesVisibles.map(p => p.mitjana);

    // Mitjana mòbil de les últimes ROLLING_WINDOW partides (incloent l'actual)
    const mitjanaAcumulada = partidesVisibles.map((p, idx) => {
        const globalIdx = currentRange.start + idx;
        const startIdx = Math.max(0, globalIdx - (ROLLING_WINDOW - 1));
        const endIdx = globalIdx + 1;
        const partidesCalc = PARTIDES_DATA.slice(startIdx, endIdx);

        const totalCar = partidesCalc.reduce((sum, part) => sum + part.caramboles, 0);
        const totalEnt = partidesCalc.reduce((sum, part) => sum + part.entrades, 0);
        return totalCar / totalEnt;
    });

    const tendencia = calcularTendencia(mitjanes);

    const ctx = document.getElementById('evolutionChart').getContext('2d');

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Mitjana per Partida',
                    data: mitjanes,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: `Mitjana Acumulada (últimes ${ROLLING_WINDOW})`,
                    data: mitjanaAcumulada,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Línia de Tendència',
                    data: tendencia,
                    borderColor: '#f59e0b',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        },
        options: {
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
                        title: function(context) {
                            const idx = context[0].dataIndex;
                            const partida = partidesVisibles[idx];
                            return `vs ${partida.oponent}`;
                        },
                        label: function(context) {
                            const idx = context.dataIndex;
                            const partida = partidesVisibles[idx];

                            if (context.datasetIndex === 0) {
                                return `Partida: ${partida.caramboles}/${partida.entrades} = ${partida.mitjana.toFixed(3)}`;
                            } else if (context.datasetIndex === 1) {
                                const globalIdx = currentRange.start + idx;
                                const numPartides = Math.min(globalIdx + 1, ROLLING_WINDOW);
                                const startP = Math.max(1, partida.num - numPartides + 1);
                                const endP = partida.num;
                                return `Mitjana últimes ${numPartides} (P${startP}-P${endP}): ${context.parsed.y.toFixed(3)}`;
                            } else {
                                return `Tendència: ${context.parsed.y.toFixed(3)}`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: { callback: v => v.toFixed(2) }
                }
            }
        }
    });
}
