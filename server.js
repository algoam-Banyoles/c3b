const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Ruta per al fitxer JSON de Gómez i Chuecos
const GOMEZ_FILE = path.join(__dirname, 'partides_gomez_updated.json');
const CHUECOS_FILE = path.join(__dirname, 'partides_chuecos_updated.json');

// API per obtenir partides de Gómez
app.get('/api/partides/gomez', async (req, res) => {
    try {
        const data = await fs.readFile(GOMEZ_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error llegint partides_gomez_updated.json:', error);
        res.status(500).json({ error: 'Error llegint les dades' });
    }
});

// API per guardar partides de Gómez
app.post('/api/partides/gomez', async (req, res) => {
    try {
        const partides = req.body;
        await fs.writeFile(
            GOMEZ_FILE,
            JSON.stringify(partides, null, 4),
            'utf8'
        );
        console.log('✅ Partides de Gómez guardades correctament');
        res.json({ success: true, message: 'Partides guardades correctament' });
    } catch (error) {
        console.error('Error guardant partides_gomez_updated.json:', error);
        res.status(500).json({ error: 'Error guardant les dades' });
    }
});

// API per obtenir partides de Chuecos
app.get('/api/partides/chuecos', async (req, res) => {
    try {
        const data = await fs.readFile(CHUECOS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error llegint partides_chuecos_updated.json:', error);
        res.status(500).json({ error: 'Error llegint les dades' });
    }
});

// API per guardar partides de Chuecos
app.post('/api/partides/chuecos', async (req, res) => {
    try {
        const partides = req.body;
        await fs.writeFile(
            CHUECOS_FILE,
            JSON.stringify(partides, null, 4),
            'utf8'
        );
        console.log('✅ Partides de Chuecos guardades correctament');
        res.json({ success: true, message: 'Partides guardades correctament' });
    } catch (error) {
        console.error('Error guardant partides_chuecos_updated.json:', error);
        res.status(500).json({ error: 'Error guardant les dades' });
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
