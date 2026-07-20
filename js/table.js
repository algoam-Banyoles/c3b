// ============================================================================
// Renderització de la taula de partides
// ============================================================================

function renderPartidesTable() {
    const tbody = document.getElementById('partidesTableBody');

    if (PARTIDES_DATA.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 30px; color: #999;">No hi ha partides. Afegeix la primera! ➕</td></tr>';
        return;
    }

    const millor = Math.max(...PARTIDES_DATA.map(p => p.mitjana));
    const pitjor = Math.min(...PARTIDES_DATA.map(p => p.mitjana));

    const windowSize = Math.min(ROLLING_WINDOW, PARTIDES_DATA.length);
    // Si FCBillar ha marcat quines partides computen al rànquing oficial (camp
    // `computa`), respectem-ho exactament; si no, caiem a les N darreres posicionals.
    // `computa_prox` marca les 15 que computaran al PROPER rànquing (projecció).
    const hasComputa = PARTIDES_DATA.some(p => p.computa);
    const hasProx = PARTIDES_DATA.some(p => p.computa_prox);
    // La llegenda del ressaltat només té sentit quan FCBillar ha marcat les finestres.
    const legend = document.getElementById('partidesLegend');
    if (legend) legend.style.display = (hasComputa || hasProx) ? 'flex' : 'none';

    const rows = PARTIDES_DATA.slice().reverse().map((p, reverseIdx) => {
        const originalIdx = PARTIDES_DATA.length - 1 - reverseIdx;
        const isBest = p.mitjana === millor;
        const isWorst = p.mitjana === pitjor;
        const className = isBest ? 'best' : isWorst ? 'worst' : '';

        const inWindow = hasComputa ? !!p.computa : (reverseIdx < windowSize);
        const inProx = !!p.computa_prox; // només quan FCBillar ho ha marcat
        const cls = [];
        if (inWindow) cls.push('ranquing-window');
        if (inProx) cls.push('ranquing-prox');
        const trAttr = cls.length ? ` class="${cls.join(' ')}"` : '';
        const titleParts = [];
        if (inWindow) titleParts.push(hasComputa
            ? 'Computa al rànquing oficial vigent'
            : `Dins el càlcul de la mitjana del rànquing (${windowSize} partides)`);
        if (inProx) titleParts.push('Computarà al proper rànquing (projecció FCBillar)');
        const trTitle = titleParts.length ? ` title="${titleParts.join(' · ')}"` : '';

        let resultat = '';
        let resultatClass = '';
        if (p.caramboles > p.caramboles_oponent) {
            resultat = '✅';
            resultatClass = 'best';
        } else if (p.caramboles === p.caramboles_oponent) {
            resultat = '🟰';
        } else {
            resultat = '❌';
            resultatClass = 'worst';
        }

        let tipusComp = '-';
        if (p.competicio) {
            const comp = p.competicio.toLowerCase();
            if (comp.includes('liga') || comp.includes('lliga')) tipusComp = 'L';
            else if (comp.includes('open')) tipusComp = 'O';
            else if (comp.includes('individual') || comp.includes('catalunya')) tipusComp = 'I';
            else if (comp.includes('copa')) tipusComp = 'C';
        }

        const posCronologica = originalIdx + 1;
        return `
            <tr${trAttr}${trTitle}>
                <td><strong>${posCronologica}</strong></td>
                <td>${p.data ? new Date(p.data).toLocaleDateString('ca-ES', {day: '2-digit', month: '2-digit', year: '2-digit'}) : '-'}</td>
                <td style="font-size: 12px;">${p.oponent || '-'}</td>
                <td style="text-align: center; font-weight: bold; color: #2563eb;">${tipusComp}</td>
                <td><strong>${p.caramboles}</strong></td>
                <td style="color: #999;">${p.caramboles_oponent || '-'}</td>
                <td>${p.entrades}</td>
                <td style="color: #666; font-size: 13px;">${p.serie_major || '-'}</td>
                <td class="${className}"><strong>${p.mitjana.toFixed(3)}</strong></td>
                <td class="${resultatClass}" style="text-align: center; font-size: 18px;">${resultat}</td>
                <td style="text-align: center; font-size: 16px;">
                    ${p.url_video ? `<a href="${p.url_video}" target="_blank" rel="noopener noreferrer" title="Veure vídeo">🎥</a>` : '-'}
                </td>
                <td>
                    <button class="btn btn-warning btn-small" onclick="openEditModal(${originalIdx})" title="Editar">✏️</button>
                    <button class="btn btn-small" style="background:#10b981;color:white;" onclick="compartirPartida(${originalIdx})" title="Compartir">📤</button>
                    <button class="btn btn-danger btn-small" onclick="eliminarPartida(${originalIdx})" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows;
}
