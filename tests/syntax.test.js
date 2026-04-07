// Smoke test: tots els fitxers JS del projecte han de parsejar.
// Si es trenca alguna sintaxi (a server.js, a js/, a navbar.js, ...), aquest
// test cau immediatament. No requereix BD ni xarxa.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function* walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            yield* walk(full);
        } else if (entry.name.endsWith('.js')) {
            yield full;
        }
    }
}

const files = [...walk(ROOT)];

test('hi ha fitxers JS al projecte', () => {
    assert.ok(files.length > 5, `només s'han trobat ${files.length} fitxers JS`);
});

for (const file of files) {
    const rel = path.relative(ROOT, file);
    test(`parseja: ${rel}`, () => {
        const src = fs.readFileSync(file, 'utf8');
        // vm.Script només compila, no executa res. Captura errors de sintaxi.
        assert.doesNotThrow(() => new vm.Script(src, { filename: rel }), SyntaxError);
    });
}
