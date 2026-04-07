// ============================================================================
// Generar una imatge PNG amb el resum d'una partida i compartir-la / descarregar
// ============================================================================

function compartirPartida(index) {
    const partida = PARTIDES_DATA[index];
    if (!partida) return;

    const config = BillarConfig.getConfig();
    const usuariNom = config ? config.usuariNom : '';
    const modalitatNom = config ? config.modalitatNom : '';

    const blob = generarImatgePartida(partida, usuariNom, modalitatNom);
    blob.then(b => {
        const fileName = `partida-${partida.num}-${(partida.oponent || 'oponent').replace(/\s+/g, '-')}.png`;

        // Provar Web Share API amb fitxers (mòbils)
        if (navigator.canShare && navigator.canShare({ files: [new File([b], fileName, { type: 'image/png' })] })) {
            const file = new File([b], fileName, { type: 'image/png' });
            navigator.share({
                files: [file],
                title: `Partida vs ${partida.oponent}`,
                text: `${usuariNom} · ${partida.caramboles}/${partida.entrades} (${partida.mitjana.toFixed(3)})`,
            }).catch(err => {
                if (err.name !== 'AbortError') console.warn('Share failed:', err);
            });
            return;
        }

        // Fallback: descarregar
        const url = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function generarImatgePartida(partida, usuariNom, modalitatNom) {
    return new Promise(resolve => {
        const W = 1080, H = 1080;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Fons degradat
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#1e3a8a');
        grad.addColorStop(1, '#3b82f6');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Targeta blanca central
        const cardX = 80, cardY = 100, cardW = W - 160, cardH = H - 200;
        roundRect(ctx, cardX, cardY, cardW, cardH, 32);
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Header (modalitat)
        ctx.fillStyle = '#6b7280';
        ctx.font = '600 28px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
        ctx.fillText((modalitatNom || '').toUpperCase(), W / 2, cardY + 50);

        // Nom de l'usuari
        ctx.fillStyle = '#1e3a8a';
        ctx.font = '800 56px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
        ctx.fillText(usuariNom || '', W / 2, cardY + 100);

        // VS
        ctx.fillStyle = '#9ca3af';
        ctx.font = '600 32px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
        ctx.fillText('vs', W / 2, cardY + 180);

        // Oponent
        ctx.fillStyle = '#1f2937';
        ctx.font = '700 44px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
        ctx.fillText(partida.oponent || '—', W / 2, cardY + 225);

        // Data + lloc
        const dataFmt = partida.data
            ? new Date(partida.data).toLocaleDateString('ca-ES', { day: '2-digit', month: 'long', year: 'numeric' })
            : '';
        ctx.fillStyle = '#6b7280';
        ctx.font = '500 26px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
        const dataText = partida.lloc ? `${dataFmt} · ${partida.lloc}` : dataFmt;
        ctx.fillText(dataText, W / 2, cardY + 295);

        // Resultat gegant: caramboles X / Y oponent
        ctx.font = '900 180px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
        const car = String(partida.caramboles ?? '—');
        const carOp = String(partida.caramboles_oponent ?? '—');
        const dash = ' - ';
        const carWidth = ctx.measureText(car).width;
        const dashWidth = ctx.measureText(dash).width;
        const opWidth = ctx.measureText(carOp).width;
        const totalWidth = carWidth + dashWidth + opWidth;
        const startX = (W - totalWidth) / 2;
        const scoreY = cardY + 380;

        ctx.textAlign = 'left';
        const wonByMe = (partida.caramboles ?? 0) > (partida.caramboles_oponent ?? 0);
        const tied    = (partida.caramboles ?? 0) === (partida.caramboles_oponent ?? 0);

        ctx.fillStyle = wonByMe ? '#059669' : (tied ? '#6b7280' : '#dc2626');
        ctx.fillText(car, startX, scoreY);

        ctx.fillStyle = '#9ca3af';
        ctx.fillText(dash, startX + carWidth, scoreY);

        ctx.fillStyle = wonByMe ? '#dc2626' : (tied ? '#6b7280' : '#059669');
        ctx.fillText(carOp, startX + carWidth + dashWidth, scoreY);

        // Sub-stats: entrades, mitjana, sèrie major
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1f2937';
        ctx.font = '700 38px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

        const subY = cardY + 620;
        const colW = cardW / 3;

        drawStatBlock(ctx, cardX + colW * 0.5, subY, 'Entrades', String(partida.entrades ?? '—'));
        drawStatBlock(ctx, cardX + colW * 1.5, subY, 'Mitjana', (partida.mitjana ?? 0).toFixed(3));
        drawStatBlock(ctx, cardX + colW * 2.5, subY, 'Sèrie major', String(partida.serie_major ?? '—'));

        // Resultat (badge)
        ctx.textAlign = 'center';
        const badgeY = cardY + cardH - 130;
        const badgeText = wonByMe ? '✅  VICTÒRIA' : (tied ? '🟰  EMPAT' : '❌  DERROTA');
        const badgeColor = wonByMe ? '#059669' : (tied ? '#6b7280' : '#dc2626');
        ctx.fillStyle = badgeColor;
        ctx.font = '800 42px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
        ctx.fillText(badgeText, W / 2, badgeY);

        // Footer
        ctx.fillStyle = '#9ca3af';
        ctx.font = '500 22px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
        ctx.fillText('🎱 c3b · Estadístiques de billar', W / 2, H - 70);

        canvas.toBlob(b => resolve(b), 'image/png');
    });
}

function drawStatBlock(ctx, x, y, label, value) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '600 22px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.fillText(label.toUpperCase(), x, y);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = '800 52px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.fillText(value, x, y + 32);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
