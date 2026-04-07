// ============================================================================
// Modal d'afegir/editar partida i eliminació
// ============================================================================

function openAddModal() {
    editingIndex = -1;
    document.getElementById('modalTitle').textContent = '➕ Afegir Nova Partida';
    document.getElementById('partidaForm').reset();
    document.getElementById('formData').valueAsDate = new Date();
    document.getElementById('partidaModal').classList.add('show');
}

function openEditModal(index) {
    editingIndex = index;
    const partida = PARTIDES_DATA[index];

    document.getElementById('modalTitle').textContent = '✏️ Editar Partida #' + partida.num;
    document.getElementById('formData').value = partida.data;
    document.getElementById('formLloc').value = partida.lloc || '';
    document.getElementById('formOponent').value = partida.oponent || '';
    document.getElementById('formEquip').value = partida.equip || '';
    document.getElementById('formCaramboles').value = partida.caramboles;
    document.getElementById('formEntrades').value = partida.entrades;
    document.getElementById('formCarambolesOponent').value = partida.caramboles_oponent || '';
    document.getElementById('formSerieMajor').value = partida.serie_major || '';
    document.getElementById('formUrlVideo').value = partida.url_video || '';
    document.getElementById('formTipus').value = partida.competicio || '';

    document.getElementById('partidaModal').classList.add('show');
}

function closeModal() {
    document.getElementById('partidaModal').classList.remove('show');
    editingIndex = -1;
}

async function guardarPartida(event) {
    event.preventDefault();

    const caramboles = parseInt(document.getElementById('formCaramboles').value);
    const entrades = parseInt(document.getElementById('formEntrades').value);
    const carambolesOponent = parseInt(document.getElementById('formCarambolesOponent').value) || 0;
    const serieMajor = parseInt(document.getElementById('formSerieMajor').value) || null;
    const urlVideo = document.getElementById('formUrlVideo').value.trim() || null;
    const tipusCompeticio = document.getElementById('formTipus')?.value || null;

    const partida = {
        num: editingIndex >= 0
            ? PARTIDES_DATA[editingIndex].num
            : (PARTIDES_DATA.length > 0 ? Math.max(...PARTIDES_DATA.map(p => p.num)) + 1 : 1),
        data: document.getElementById('formData').value,
        lloc: document.getElementById('formLloc').value || null,
        oponent: document.getElementById('formOponent').value,
        equip: document.getElementById('formEquip').value || null,
        competicio: tipusCompeticio,
        caramboles: caramboles,
        caramboles_oponent: carambolesOponent,
        entrades: entrades,
        mitjana: caramboles / entrades,
        mitjana_oponent: carambolesOponent / entrades,
        serie_major: serieMajor,
        url_video: urlVideo
    };

    try {
        if (editingIndex >= 0) {
            const partidaExistent = PARTIDES_DATA[editingIndex];
            if (partidaExistent.id) {
                await BillarConfig.updatePartida(partidaExistent.id, partida);
            }
            PARTIDES_DATA[editingIndex] = { ...partidaExistent, ...partida };
        } else {
            const novaPartida = await BillarConfig.savePartida(partida);
            PARTIDES_DATA.push(novaPartida);
        }

        PARTIDES_DATA.sort((a, b) => a.num - b.num);

        await guardarDadesStorage();
        refreshAll();
        closeModal();

        alert(editingIndex >= 0 ? '✅ Partida actualitzada!' : '✅ Partida afegida!');
    } catch (error) {
        console.error('Error guardant partida:', error);
        if (error.code === 'duplicate' || error.status === 409) {
            alert('⚠️ Aquesta partida ja existeix (mateix dia, oponent i resultat). Si realment és una partida diferent, modifica caramboles o entrades.');
        } else {
            alert('❌ Error guardant la partida: ' + error.message);
        }
    }
}

async function eliminarPartida(index) {
    const partida = PARTIDES_DATA[index];
    if (confirm(`Segur que vols eliminar la partida #${partida.num} contra ${partida.oponent}?`)) {
        try {
            if (partida.id) {
                await BillarConfig.deletePartida(partida.id);
            }
            PARTIDES_DATA.splice(index, 1);
            await guardarDadesStorage();
            refreshAll();
            alert('✅ Partida eliminada!');
        } catch (error) {
            console.error('Error eliminant partida:', error);
            alert('❌ Error eliminant la partida: ' + error.message);
        }
    }
}
