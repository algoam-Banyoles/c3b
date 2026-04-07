// Unit tests per lib/validation.js — sense BD ni Express.
// Es corren amb `node --test tests/`.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validarPartida, dbErrorToResponse } = require('../lib/validation');

// ----------------------------------------------------------------------------
// validarPartida — happy path
// ----------------------------------------------------------------------------

test('validarPartida accepta una partida mínima vàlida', () => {
    const p = { usuari_id: 1, modalitat_id: 1 };
    assert.equal(validarPartida(p), null);
});

test('validarPartida accepta una partida completa', () => {
    const p = {
        usuari_id: 1,
        modalitat_id: 2,
        data: '2024-04-12',
        oponent: 'Test',
        caramboles: 30,
        entrades: 41,
        caramboles_oponent: 12,
        serie_major: 5,
    };
    assert.equal(validarPartida(p), null);
});

// ----------------------------------------------------------------------------
// validarPartida — formes incorrectes
// ----------------------------------------------------------------------------

test('validarPartida rebutja null', () => {
    assert.match(validarPartida(null), /objecte/);
});

test('validarPartida rebutja string', () => {
    assert.match(validarPartida('foo'), /objecte/);
});

test('validarPartida exigeix usuari_id enter positiu', () => {
    assert.match(validarPartida({ modalitat_id: 1 }), /usuari_id/);
    assert.match(validarPartida({ usuari_id: 0, modalitat_id: 1 }), /usuari_id/);
    assert.match(validarPartida({ usuari_id: -3, modalitat_id: 1 }), /usuari_id/);
    assert.match(validarPartida({ usuari_id: 1.5, modalitat_id: 1 }), /usuari_id/);
    assert.match(validarPartida({ usuari_id: '1', modalitat_id: 1 }), /usuari_id/);
});

test('validarPartida exigeix modalitat_id enter positiu', () => {
    assert.match(validarPartida({ usuari_id: 1 }), /modalitat_id/);
    assert.match(validarPartida({ usuari_id: 1, modalitat_id: 0 }), /modalitat_id/);
});

test('validarPartida rebutja data invàlida', () => {
    const err = validarPartida({ usuari_id: 1, modalitat_id: 1, data: 'no-és-una-data' });
    assert.match(err, /data/);
});

test('validarPartida accepta partida sense data', () => {
    assert.equal(validarPartida({ usuari_id: 1, modalitat_id: 1 }), null);
});

test('validarPartida rebutja caramboles negatives', () => {
    const err = validarPartida({ usuari_id: 1, modalitat_id: 1, caramboles: -1, entrades: 10 });
    assert.match(err, /caramboles/);
});

test('validarPartida accepta caramboles = 0', () => {
    assert.equal(validarPartida({ usuari_id: 1, modalitat_id: 1, caramboles: 0, entrades: 10 }), null);
});

test('validarPartida rebutja entrades = 0', () => {
    const err = validarPartida({ usuari_id: 1, modalitat_id: 1, entrades: 0 });
    assert.match(err, /entrades/);
});

test('validarPartida rebutja entrades negatives', () => {
    const err = validarPartida({ usuari_id: 1, modalitat_id: 1, entrades: -5 });
    assert.match(err, /entrades/);
});

test('validarPartida rebutja caramboles_oponent negatives', () => {
    const err = validarPartida({ usuari_id: 1, modalitat_id: 1, caramboles_oponent: -1 });
    assert.match(err, /caramboles_oponent/);
});

test('validarPartida rebutja serie_major negativa', () => {
    const err = validarPartida({ usuari_id: 1, modalitat_id: 1, serie_major: -1 });
    assert.match(err, /serie_major/);
});

test('validarPartida accepta serie_major nul·la', () => {
    assert.equal(validarPartida({ usuari_id: 1, modalitat_id: 1, serie_major: null }), null);
});

// ----------------------------------------------------------------------------
// dbErrorToResponse
// ----------------------------------------------------------------------------

test('dbErrorToResponse: 23505 + partides_no_duplicates → 409 duplicate', () => {
    const r = dbErrorToResponse({
        code: '23505',
        details: 'Key (usuari_id, modalitat_id, data, oponent, caramboles, entrades)=(1, 1, 2024-04-12, X, 30, 41) already exists, partides_no_duplicates',
    });
    assert.equal(r.status, 409);
    assert.equal(r.body.code, 'duplicate');
    assert.match(r.body.error, /ja existeix/);
});

test('dbErrorToResponse: 23505 sense partides_no_duplicates → 409 generic', () => {
    const r = dbErrorToResponse({ code: '23505', details: 'altre constraint' });
    assert.equal(r.status, 409);
    assert.equal(r.body.code, 'duplicate');
});

test('dbErrorToResponse: 23503 → 400 fk_violation', () => {
    const r = dbErrorToResponse({ code: '23503', details: 'foreign key' });
    assert.equal(r.status, 400);
    assert.equal(r.body.code, 'fk_violation');
});

test('dbErrorToResponse: error desconegut → 500', () => {
    const r = dbErrorToResponse({ code: 'whatever', message: 'boom' });
    assert.equal(r.status, 500);
    assert.equal(r.body.details, 'boom');
});

test('dbErrorToResponse: null → 500', () => {
    const r = dbErrorToResponse(null);
    assert.equal(r.status, 500);
});
