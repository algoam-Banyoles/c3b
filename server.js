const express = require('express');
const cors = require('cors');
const supabase = require('./supabase');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// API per obtenir partides de Gómez
app.get('/api/partides/gomez', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('partides_gomez')
            .select('*')
            .order('num', { ascending: true });

        if (error) throw error;

        console.log('✅ Partides de Gómez carregades:', data.length);
        res.json(data);
    } catch (error) {
        console.error('❌ Error llegint partides de Gómez:', error);
        res.status(500).json({ error: 'Error llegint les dades', details: error.message });
    }
});

// API per guardar partides de Gómez (reemplaça totes)
app.post('/api/partides/gomez', async (req, res) => {
    try {
        const partides = req.body;

        // Eliminar totes les partides existents
        await supabase.from('partides_gomez').delete().neq('id', 0);

        // Inserir les noves partides
        const { data, error } = await supabase
            .from('partides_gomez')
            .insert(partides);

        if (error) throw error;

        console.log('✅ Partides de Gómez guardades correctament:', partides.length);
        res.json({ success: true, message: 'Partides guardades correctament' });
    } catch (error) {
        console.error('❌ Error guardant partides de Gómez:', error);
        res.status(500).json({ error: 'Error guardant les dades', details: error.message });
    }
});

// API per obtenir partides de Chuecos
app.get('/api/partides/chuecos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('partides_chuecos')
            .select('*')
            .order('num', { ascending: true });

        if (error) throw error;

        console.log('✅ Partides de Chuecos carregades:', data.length);
        res.json(data);
    } catch (error) {
        console.error('❌ Error llegint partides de Chuecos:', error);
        res.status(500).json({ error: 'Error llegint les dades', details: error.message });
    }
});

// API per guardar partides de Chuecos (reemplaça totes)
app.post('/api/partides/chuecos', async (req, res) => {
    try {
        const partides = req.body;

        // Eliminar totes les partides existents
        await supabase.from('partides_chuecos').delete().neq('id', 0);

        // Inserir les noves partides
        const { data, error } = await supabase
            .from('partides_chuecos')
            .insert(partides);

        if (error) throw error;

        console.log('✅ Partides de Chuecos guardades correctament:', partides.length);
        res.json({ success: true, message: 'Partides guardades correctament' });
    } catch (error) {
        console.error('❌ Error guardant partides de Chuecos:', error);
        res.status(500).json({ error: 'Error guardant les dades', details: error.message });
    }
});

// Per a desenvolupament local
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`
🎱 Servidor d'estadístiques de billar iniciat!
    
📊 Pàgina principal (Gómez): http://localhost:${PORT}
📊 Pàgina Chuecos: http://localhost:${PORT}/chuecos.html

💾 Les dades es guarden automàticament als fitxers JSON
🔄 Sincronització automàtica entre dispositius

Per aturar el servidor: Ctrl+C
        `);
    });
}

// Exportar per a Vercel
module.exports = app;
