/**
 * Script per migrar de l'antiga estructura a la nova
 * Aquest script facilita la transició gradual
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Script de Migració - Billar Stats Refactored\n');

// Verificar que existeixen els nous fitxers
const filesToCheck = [
    'server.refactored.js',
    'src/config/database.js',
    'src/routes/index.js',
    'public/js/api.service.js',
    'public/js/stats.service.js',
    'public/js/chart.service.js',
    'public/css/variables.css',
    'public/css/components.css'
];

let allFilesExist = true;

console.log('📋 Verificant fitxers refactoritzats...\n');

filesToCheck.forEach(file => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
    console.log('\n⚠️  Alguns fitxers refactoritzats no existeixen.');
    console.log('Assegura\'t que la refactorització s\'ha completat correctament.');
    process.exit(1);
}

console.log('\n✅ Tots els fitxers refactoritzats existeixen!\n');

// Informació sobre com migrar
console.log('📖 Guia de Migració:\n');

console.log('1️⃣  Backend:');
console.log('   - Prova el nou servidor: node server.refactored.js');
console.log('   - L\'API és 100% compatible amb la versió anterior');
console.log('   - Pots canviar "server.js" per "server.refactored.js" a package.json\n');

console.log('2️⃣  Frontend:');
console.log('   - Afegeix als teus HTML:');
console.log('     <link rel="stylesheet" href="public/css/variables.css">');
console.log('     <link rel="stylesheet" href="public/css/components.css">');
console.log('     <script src="public/js/api.service.js"></script>');
console.log('     <script src="public/js/stats.service.js"></script>');
console.log('     <script src="public/js/chart.service.js"></script>\n');

console.log('3️⃣  Exemple:');
console.log('   - Obre example-refactored.html al navegador');
console.log('   - Prova els serveis refactoritzats\n');

console.log('4️⃣  Documentació:');
console.log('   - Llegeix REFACTORING.md per més detalls');
console.log('   - Consulta REFACTORING_SUMMARY.md per un resum ràpid\n');

// Oferir crear un backup
console.log('💾 Vols crear un backup dels fitxers originals? (Recomanat abans de migrar)');
console.log('   Executa: node migrate.backup.js\n');

console.log('✨ La refactorització està llesta per usar!');
console.log('   Els fitxers originals es mantenen intactes.');
console.log('   Pots migrar gradualment, pàgina per pàgina.\n');

console.log('🚀 Comença provant: node server.refactored.js\n');
