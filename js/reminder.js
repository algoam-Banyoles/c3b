// ============================================================================
// Recordatori discret a index.html quan fa molts dies que no es registra
// cap partida. Sense backend, sense permisos: només un banner dins l'app.
// ============================================================================

const REMINDER_THRESHOLD_DAYS = 14;     // si fa més de N dies, mostrar
const REMINDER_SNOOZE_HOURS = 24;       // si l'usuari l'ha dismissat, no tornar a mostrar fins...
const REMINDER_KEY_PREFIX = 'billar_reminder_dismissed_';

function reminderStorageKey() {
    const cfg = BillarConfig.getConfig && BillarConfig.getConfig();
    const id = cfg ? cfg.usuariId : 'anon';
    return REMINDER_KEY_PREFIX + id;
}

function reminderShouldShow(lastMatchIso) {
    if (!lastMatchIso) return false;
    const last = new Date(lastMatchIso);
    if (isNaN(last.getTime())) return false;

    const days = Math.floor((Date.now() - last.getTime()) / 86400000);
    if (days < REMINDER_THRESHOLD_DAYS) return false;

    const snoozedAt = parseInt(localStorage.getItem(reminderStorageKey()) || '0', 10);
    if (snoozedAt && Date.now() - snoozedAt < REMINDER_SNOOZE_HOURS * 3600000) {
        return false;
    }
    return days;
}

function comprovarRecordatori() {
    if (!Array.isArray(PARTIDES_DATA) || PARTIDES_DATA.length === 0) return;

    // Trobem la partida més recent (data més gran)
    let lastDate = null;
    for (const p of PARTIDES_DATA) {
        if (p.data && (!lastDate || p.data > lastDate)) lastDate = p.data;
    }
    if (!lastDate) return;

    const days = reminderShouldShow(lastDate);
    if (!days) return;

    const banner = document.getElementById('reminderBanner');
    const text = document.getElementById('reminderText');
    if (!banner || !text) return;

    text.textContent = `📅 Fa ${days} dies que no registres cap partida. Si has jugat alguna competició, recorda apuntar-la.`;
    banner.style.display = 'flex';
}

function reminderDismiss() {
    localStorage.setItem(reminderStorageKey(), String(Date.now()));
    const banner = document.getElementById('reminderBanner');
    if (banner) banner.style.display = 'none';
}

function reminderAddNow() {
    reminderDismiss();
    if (typeof openAddModal === 'function') openAddModal();
}
