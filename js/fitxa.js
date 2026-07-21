// ============================================================================
// Fitxa federativa (FCBillar): rànquing, opens, rendiment per nivell d'oponent
// i palmarès. Les dades les publica FCBillar a public.estadistiques_fitxa
// (consistents amb la fitxa de jugador de FCBillar); aquí només es pinten.
// Només aplica a 3 Bandes (modalitat_id 1 a Estadístiques).
// ============================================================================

async function renderFitxaFederativa() {
    const el = document.getElementById('fitxaFederativa');
    if (!el) return;
    const cfg = (typeof BillarConfig !== 'undefined') ? BillarConfig.getConfig() : null;
    // La fitxa publicada és de 3 Bandes (modalitat_id 1). Per a la resta, s'amaga.
    if (!cfg || cfg.usuariId == null || cfg.modalitatId !== 1) { el.innerHTML = ''; return; }

    let f = null;
    try {
        const base = (typeof BillarConfig !== 'undefined' && BillarConfig.API_BASE) || '';
        const r = await fetch(`${base}/api/fitxa?usuari_id=${cfg.usuariId}`);
        if (r.ok) f = await r.json();
    } catch (_) { /* sense connexió: amaga */ }
    if (!f) { el.innerHTML = ''; return; }

    const blocks = [];

    // --- Rànquing oficial + proper (provisional) ---
    if (f.ranking && f.ranking.posicio_oficial != null) {
        const rk = f.ranking;
        let prox = '';
        if (rk.posicio_provisional != null && rk.partides_post > 0) {
            const dPos = rk.posicio_oficial - rk.posicio_provisional; // >0 = puja
            const fletxa = dPos > 0 ? '▲' : dPos < 0 ? '▼' : '▬';
            const cls = dPos > 0 ? 'up' : dPos < 0 ? 'down' : '';
            const dTxt = dPos !== 0 ? `${fletxa} ${Math.abs(dPos)} ${dPos > 0 ? 'amunt' : 'avall'}` : '';
            prox = `<div class="fitxa-prox ${cls}">→ proper rànquing: <b>#${rk.posicio_provisional}</b>
                (${(rk.mitjana_provisional ?? 0).toFixed(3)}) ${dTxt}</div>`;
        }
        const mp = (rk.millor_posicio != null)
            ? `millor posició <b>#${rk.millor_posicio}</b>${rk.millor_posicio_mitjana != null ? ` (${rk.millor_posicio_mitjana.toFixed(3)})` : ''}`
            : '';
        const mm = (rk.millor_mitjana != null)
            ? `millor mitjana <b>${rk.millor_mitjana.toFixed(3)}</b>${rk.millor_mitjana_posicio != null ? ` (#${rk.millor_mitjana_posicio})` : ''}`
            : '';
        const millor = (mp || mm)
            ? `<div class="fitxa-mini">${[mp, mm].filter(Boolean).join(' · ')}</div>`
            : '';
        blocks.push(`<div class="fitxa-block">
            <div class="fitxa-l">Rànquing 3 Bandes</div>
            <div class="fitxa-big">#${rk.posicio_oficial}</div>
            <div class="fitxa-sub">posició actual · mitjana ${(rk.mitjana_oficial ?? 0).toFixed(3)}</div>
            ${millor}${prox}
        </div>`);
    }

    // --- Rànquing d'Opens 3B ---
    if (f.opens && f.opens.posicio != null) {
        const o = f.opens;
        const extra = [];
        if (o.millor_posicio != null) extra.push(`millor posició #${o.millor_posicio}`);
        if (o.millor_en_open != null) extra.push(`millor en un open #${o.millor_en_open}`);
        blocks.push(`<div class="fitxa-block">
            <div class="fitxa-l">Rànquing d'Opens 3B</div>
            <div class="fitxa-big">#${o.posicio}</div>
            <div class="fitxa-sub">${o.punts ?? 0} punts</div>
            ${extra.length ? `<div class="fitxa-mini">${extra.join(' · ')}</div>` : ''}
        </div>`);
    }

    // --- Rendiment per nivell d'oponent (barres de % victòries per tram) ---
    if (f.radar && Array.isArray(f.radar.buckets) && f.radar.buckets.length) {
        const bars = f.radar.buckets.map(b => {
            const tot = (b.wins || 0) + (b.losses || 0) + (b.draws || 0);
            const pct = tot ? Math.round((b.wins / tot) * 100) : 0;
            const cls = pct >= 50 ? 'ok' : pct >= 30 ? 'mid' : 'low';
            return `<div class="rb-row">
                <div class="rb-label">${b.label || ''}</div>
                <div class="rb-track"><div class="rb-fill ${cls}" style="width:${pct}%"></div></div>
                <div class="rb-pct">${pct}%</div>
                <div class="rb-ved"><span class="ved-v">${b.wins || 0}</span>-<span class="ved-e">${b.draws || 0}</span>-<span class="ved-d">${b.losses || 0}</span></div>
            </div>`;
        }).join('');
        const idx = f.radar.index;
        const idxTip = 'Índex de rendiment = % de victòries ponderat pel nivell del rival: '
            + '100 × (suma de mitjanes dels rivals VENÇUTS) / (suma de mitjanes de TOTS els '
            + 'rivals en partides decisives, sense empats). Guanyar rivals forts compta més. '
            + 'Crossover = nivell de rival on la teva taxa de victòries creua el 50%.';
        const idxLine = idx
            ? `<div class="fitxa-mini" title="${idxTip}">Índex de rendiment <b>${(idx.weighted_index ?? 0).toFixed(1)}</b>${idx.crossover != null ? ` · competitiu fins a mitjana <b>${idx.crossover.toFixed(3)}</b>` : ''} <span class="fitxa-info">ⓘ</span></div>`
            : '';
        blocks.push(`<div class="fitxa-block fitxa-radar">
            <div class="fitxa-l">Rendiment per nivell d'oponent</div>
            <div class="rb-list">${bars}</div>
            ${idxLine}
            <div class="fitxa-note">% de victòries segons la mitjana del rival (trams de menys a més nivell).</div>
        </div>`);
    }

    let html = `<h2><span class="icon">🏅</span> Fitxa federativa · 3 Bandes</h2>
        <div class="fitxa-grid">${blocks.join('')}</div>`;

    // --- Palmarès ---
    if (Array.isArray(f.palmares) && f.palmares.length) {
        const medalla = p => p === 1 ? '🥇' : p === 2 ? '🥈' : '🥉';
        const items = f.palmares.map(p => `<li class="pal-item">
            <span class="pal-medal">${medalla(p.posicio)}</span>
            <span class="pal-nom">${p.nom}${p.temporada ? ` <span class="pal-temp">${p.temporada}</span>` : ''}</span>
            <span class="pal-tag pal-${p.tipus}">${p.tipus === 'campionat' ? 'Camp. Catalunya' : p.tipus === 'open' ? 'Open' : 'Torneig'}</span>
        </li>`).join('');
        html += `<div class="fitxa-pal"><div class="fitxa-l">Palmarès</div><ul class="pal-list">${items}</ul></div>`;
    } else {
        html += `<div class="fitxa-note" style="margin-top:8px;">Palmarès: encara sense podis a opens o campionats.</div>`;
    }

    el.innerHTML = `<div class="card">${html}</div>`;
}
