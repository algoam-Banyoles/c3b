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

    const rows = PARTIDES_DATA.slice().reverse().map((p, reverseIdx) => {
        const originalIdx = PARTIDES_DATA.length - 1 - reverseIdx;
        const isBest = p.mitjana === millor;
        const isWorst = p.mitjana === pitjor;
        const className = isBest ? 'best' : isWorst ? 'worst' : '';

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

        return `
            <tr>
                <td><strong>${p.num}</strong></td>
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
                    <button class="btn btn-warning btn-small" onclick="openEditModal(${originalIdx})">✏️</button>
                    <button class="btn btn-danger btn-small" onclick="eliminarPartida(${originalIdx})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows;
}
