const supabase = require('./supabase');
const fs = require('fs').promises;
const path = require('path');

async function migrateData() {
    console.log('🚀 Iniciant migració de dades a Supabase...\n');

    try {
        // 1. Crear les taules
        console.log('📋 Creant taules...');
        const sqlContent = await fs.readFile(path.join(__dirname, 'supabase_setup.sql'), 'utf8');
        console.log('⚠️  Executa aquest SQL manualment al SQL Editor de Supabase:');
        console.log('    https://supabase.com/dashboard/project/unocmdvjuncqnzscrypg/sql\n');
        console.log('Prem Enter quan hagis executat el SQL...');
        
        // Esperar que l'usuari premi Enter
        await new Promise(resolve => {
            process.stdin.once('data', () => resolve());
        });

        // 2. Migrar dades de Gómez
        console.log('\n📊 Migrant dades de Gómez...');
        const gomezData = JSON.parse(
            await fs.readFile(path.join(__dirname, 'partides_gomez_updated.json'), 'utf8')
        );

        // Netejar dades buides o invàlides
        const gomezFiltered = gomezData.filter(p => p.oponent && p.oponent.trim() !== '');

        // Inserir a Supabase
        const { data: gomezInserted, error: gomezError } = await supabase
            .from('partides_gomez')
            .upsert(gomezFiltered, { onConflict: 'num' });

        if (gomezError) {
            console.error('❌ Error migrant Gómez:', gomezError);
        } else {
            console.log(`✅ ${gomezFiltered.length} partides de Gómez migrades correctament`);
        }

        // 3. Migrar dades de Chuecos
        console.log('📊 Migrant dades de Chuecos...');
        const chuecosData = JSON.parse(
            await fs.readFile(path.join(__dirname, 'partides_chuecos_updated.json'), 'utf8')
        );

        // Netejar dades buides o invàlides
        const chuecosFiltered = chuecosData.filter(p => p.oponent && p.oponent.trim() !== '');

        // Inserir a Supabase
        const { data: chuecosInserted, error: chuecosError } = await supabase
            .from('partides_chuecos')
            .upsert(chuecosFiltered, { onConflict: 'num' });

        if (chuecosError) {
            console.error('❌ Error migrant Chuecos:', chuecosError);
        } else {
            console.log(`✅ ${chuecosFiltered.length} partides de Chuecos migrades correctament`);
        }

        // 4. Verificar
        console.log('\n🔍 Verificant dades...');
        const { count: gomezCount } = await supabase
            .from('partides_gomez')
            .select('*', { count: 'exact', head: true });

        const { count: chuecosCount } = await supabase
            .from('partides_chuecos')
            .select('*', { count: 'exact', head: true });

        console.log(`\n📊 Resum:`);
        console.log(`   - Partides de Gómez a Supabase: ${gomezCount}`);
        console.log(`   - Partides de Chuecos a Supabase: ${chuecosCount}`);
        console.log('\n✅ Migració completada amb èxit!\n');

    } catch (error) {
        console.error('❌ Error durant la migració:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Executar migració
migrateData();
