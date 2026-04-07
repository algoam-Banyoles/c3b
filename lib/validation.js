// ============================================================================
// Validacions i mapping d'errors de BD per a partides
// Extret de server.js perquè es pugui testar sense aixecar Express ni Supabase.
// ============================================================================

function validarPartida(p) {
    if (p == null || typeof p !== 'object') return 'partida ha de ser un objecte';
    if (!Number.isInteger(p.usuari_id) || p.usuari_id <= 0) return 'usuari_id obligatori i positiu';
    if (!Number.isInteger(p.modalitat_id) || p.modalitat_id <= 0) return 'modalitat_id obligatori i positiu';
    if (p.data && isNaN(Date.parse(p.data))) return 'data no és una data vàlida';
    const car = p.caramboles, ent = p.entrades, carOp = p.caramboles_oponent;
    if (car != null && (!Number.isFinite(car) || car < 0)) return 'caramboles ha de ser >= 0';
    if (ent != null && (!Number.isFinite(ent) || ent <= 0)) return 'entrades ha de ser > 0';
    if (carOp != null && (!Number.isFinite(carOp) || carOp < 0)) return 'caramboles_oponent ha de ser >= 0';
    if (p.serie_major != null && (!Number.isFinite(p.serie_major) || p.serie_major < 0)) return 'serie_major ha de ser >= 0';
    return null;
}

function dbErrorToResponse(error) {
    if (error && error.code === '23505') {
        if (String(error.details || '').includes('partides_no_duplicates')) {
            return { status: 409, body: { error: 'Aquesta partida ja existeix', code: 'duplicate', details: error.details } };
        }
        return { status: 409, body: { error: 'Conflicte d\'unicitat', code: 'duplicate', details: error.details } };
    }
    if (error && error.code === '23503') {
        return { status: 400, body: { error: 'Referència no vàlida (usuari o modalitat inexistent)', code: 'fk_violation', details: error.details } };
    }
    return { status: 500, body: { error: 'Error de base de dades', details: error && error.message } };
}

module.exports = { validarPartida, dbErrorToResponse };
