// ============================================================================
// Simulador de mitjana
// ============================================================================

function calcularSimulacio() {
    const caramboles = parseInt(document.getElementById('simCaramboles').value);
    const entrades = parseInt(document.getElementById('simEntrades').value);

    if (!caramboles || !entrades || entrades === 0) {
        toast.warning('Introdueix caramboles i entrades vàlides');
        return;
    }

    mostrarResultatSimulacio(caramboles, entrades);
}

function simularMillor() {
    if (PARTIDES_DATA.length === 0) {
        toast.warning('No hi ha partides per simular');
        return;
    }

    const millor = PARTIDES_DATA.reduce((max, p) => p.mitjana > max.mitjana ? p : max);
    document.getElementById('simCaramboles').value = millor.caramboles;
    document.getElementById('simEntrades').value = millor.entrades;
    mostrarResultatSimulacio(millor.caramboles, millor.entrades, 'millor');
}

function simularPitjor() {
    if (PARTIDES_DATA.length === 0) {
        toast.warning('No hi ha partides per simular');
        return;
    }

    const pitjor = PARTIDES_DATA.reduce((min, p) => p.mitjana < min.mitjana ? p : min);
    document.getElementById('simCaramboles').value = pitjor.caramboles;
    document.getElementById('simEntrades').value = pitjor.entrades;
    mostrarResultatSimulacio(pitjor.caramboles, pitjor.entrades, 'pitjor');
}

function mostrarResultatSimulacio(caramboles, entrades, tipus = 'custom') {
    if (PARTIDES_DATA.length < ROLLING_WINDOW) {
        toast.warning(`Necessites almenys ${ROLLING_WINDOW} partides per usar el simulador`);
        return;
    }

    const ultimesN = seleccionarPartidesRanquing(PARTIDES_DATA, ROLLING_WINDOW);
    const carAct = ultimesN.reduce((sum, p) => sum + p.caramboles, 0);
    const entAct = ultimesN.reduce((sum, p) => sum + p.entrades, 0);
    const mitjanaActual = carAct / entAct;

    // Per al "després", afegim virtualment la nova partida (data: avui) i tornem
    // a aplicar la regla. Així, si avui ja hi havia partides, només entra al
    // càlcul si la seva mitjana és prou bona per desplaçar-ne alguna.
    const avui = new Date().toISOString().slice(0, 10);
    const nouMaxNum = (PARTIDES_DATA.reduce((m, p) => Math.max(m, p.num || 0), 0)) + 1;
    const partidaVirtual = {
        num: nouMaxNum,
        data: avui,
        caramboles,
        entrades,
        mitjana: caramboles / entrades
    };
    const partidesAmbNova = [...PARTIDES_DATA, partidaVirtual];
    const ultimesNNoves = seleccionarPartidesRanquing(partidesAmbNova, ROLLING_WINDOW);
    const carNou = ultimesNNoves.reduce((sum, p) => sum + p.caramboles, 0);
    const entNou = ultimesNNoves.reduce((sum, p) => sum + p.entrades, 0);
    const mitjanaNova = carNou / entNou;

    const diferencia = mitjanaNova - mitjanaActual;
    const tipusText = tipus === 'millor' ? 'millor partida' : tipus === 'pitjor' ? 'pitjor partida' : 'partida personalitzada';

    const resultHTML = `
        <div style="text-align: center; margin-bottom: 10px; color: #2563eb; font-weight: bold;">
            Simulació: ${tipusText}
        </div>
        <div class="sim-result-item">
            <span class="sim-result-label">Mitjana actual (últimes ${ROLLING_WINDOW}):</span>
            <span class="sim-result-value">${mitjanaActual.toFixed(3)}</span>
        </div>
        <div class="sim-result-item">
            <span class="sim-result-label">Nova partida:</span>
            <span class="sim-result-value">${caramboles} / ${entrades} = ${(caramboles/entrades).toFixed(3)}</span>
        </div>
        <div class="sim-result-item">
            <span class="sim-result-label">Nova mitjana (últimes ${ROLLING_WINDOW}):</span>
            <span class="sim-result-value">${mitjanaNova.toFixed(3)}</span>
        </div>
        <div class="sim-result-item">
            <span class="sim-result-label">Diferència:</span>
            <span class="sim-result-value ${diferencia > 0 ? 'positive' : 'negative'}">
                ${diferencia > 0 ? '+' : ''}${diferencia.toFixed(3)}
                ${diferencia > 0 ? '📈' : '📉'}
            </span>
        </div>
    `;

    const resultDiv = document.getElementById('simResult');
    resultDiv.innerHTML = resultHTML;
    resultDiv.classList.add('show');
}
