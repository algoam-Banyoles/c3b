const express = require('express');
const cors = require('cors');
const supabase = require('./supabase');
const { validarPartida, dbErrorToResponse } = require('./lib/validation');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ============================================
// ENDPOINTS D'USUARIS
// ============================================

// Obtenir tots els usuaris
app.get('/api/usuaris', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuaris')
            .select('*')
            .order('nom', { ascending: true });

        if (error) throw error;

        console.log('✅ Usuaris carregats:', data.length);
        res.json(data);
    } catch (error) {
        console.error('❌ Error llegint usuaris:', error);
        res.status(500).json({ error: 'Error llegint usuaris', details: error.message });
    }
});

// Crear un nou usuari
app.post('/api/usuaris', async (req, res) => {
    try {
        const { nom, email, avatar_url } = req.body;

        if (!nom) {
            return res.status(400).json({ error: 'El nom és obligatori' });
        }

        const { data, error } = await supabase
            .from('usuaris')
            .insert([{ nom, email, avatar_url }])
            .select();

        if (error) throw error;

        console.log('✅ Usuari creat:', data[0].nom);
        res.json(data[0]);
    } catch (error) {
        console.error('❌ Error creant usuari:', error);
        res.status(500).json({ error: 'Error creant usuari', details: error.message });
    }
});

// Actualitzar un usuari
app.put('/api/usuaris/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, email, avatar_url, preferencies } = req.body;

        const { data, error } = await supabase
            .from('usuaris')
            .update({ nom, email, avatar_url, preferencies })
            .eq('id', id)
            .select();

        if (error) throw error;

        console.log('✅ Usuari actualitzat:', id);
        res.json(data[0]);
    } catch (error) {
        console.error('❌ Error actualitzant usuari:', error);
        res.status(500).json({ error: 'Error actualitzant usuari', details: error.message });
    }
});

// Eliminar un usuari
app.delete('/api/usuaris/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('usuaris')
            .delete()
            .eq('id', id);

        if (error) throw error;

        console.log('✅ Usuari eliminat:', id);
        res.json({ success: true, message: 'Usuari eliminat correctament' });
    } catch (error) {
        console.error('❌ Error eliminant usuari:', error);
        res.status(500).json({ error: 'Error eliminant usuari', details: error.message });
    }
});

// ============================================
// ENDPOINTS DE MODALITATS
// ============================================

// Obtenir totes les modalitats
app.get('/api/modalitats', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('modalitats')
            .select('*')
            .order('nom', { ascending: true });

        if (error) throw error;

        console.log('✅ Modalitats carregades:', data.length);
        res.json(data);
    } catch (error) {
        console.error('❌ Error llegint modalitats:', error);
        res.status(500).json({ error: 'Error llegint modalitats', details: error.message });
    }
});

// Crear una nova modalitat
app.post('/api/modalitats', async (req, res) => {
    try {
        const { nom, descripcio, camps_personalitzats } = req.body;

        if (!nom) {
            return res.status(400).json({ error: 'El nom és obligatori' });
        }

        const { data, error } = await supabase
            .from('modalitats')
            .insert([{ nom, descripcio, camps_personalitzats }])
            .select();

        if (error) throw error;

        console.log('✅ Modalitat creada:', data[0].nom);
        res.json(data[0]);
    } catch (error) {
        console.error('❌ Error creant modalitat:', error);
        res.status(500).json({ error: 'Error creant modalitat', details: error.message });
    }
});

// ============================================
// ENDPOINTS DE PARTIDES (NOU SISTEMA UNIFICAT)
// ============================================

// Obtenir partides (amb filtres opcionals per usuari i modalitat)
app.get('/api/partides', async (req, res) => {
    try {
        const { usuari_id, modalitat_id } = req.query;

        let query = supabase
            .from('partides')
            .select(`
                *,
                usuaris:usuari_id(id, nom),
                modalitats:modalitat_id(id, nom)
            `)
            .order('num', { ascending: true });

        if (usuari_id) {
            query = query.eq('usuari_id', usuari_id);
        }

        if (modalitat_id) {
            query = query.eq('modalitat_id', modalitat_id);
        }

        const { data, error } = await query;

        if (error) throw error;

        console.log('✅ Partides carregades:', data.length);
        res.json(data);
    } catch (error) {
        console.error('❌ Error llegint partides:', error);
        res.status(500).json({ error: 'Error llegint partides', details: error.message });
    }
});

// Crear una nova partida
app.post('/api/partides', async (req, res) => {
    try {
        const partida = req.body;

        const validationError = validarPartida(partida);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        // Eliminar camps auto-generats
        const { id, created_at, updated_at, usuaris, modalitats, ...partidaNetejada } = partida;

        const { data, error } = await supabase
            .from('partides')
            .insert([partidaNetejada])
            .select();

        if (error) {
            const { status, body } = dbErrorToResponse(error);
            console.error(`❌ Error creant partida (${status}):`, body);
            return res.status(status).json(body);
        }

        console.log('✅ Partida creada:', data[0].num);
        res.json(data[0]);
    } catch (error) {
        console.error('❌ Error creant partida:', error);
        res.status(500).json({ error: 'Error creant partida', details: error.message });
    }
});

// Actualitzar una partida
app.put('/api/partides/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const partida = req.body;

        // Eliminar camps auto-generats i claus foranes expandides
        const { id: _, created_at, updated_at, usuaris, modalitats, ...partidaNetejada } = partida;

        const { data, error } = await supabase
            .from('partides')
            .update(partidaNetejada)
            .eq('id', id)
            .select();

        if (error) {
            const { status, body } = dbErrorToResponse(error);
            console.error(`❌ Error actualitzant partida (${status}):`, body);
            return res.status(status).json(body);
        }

        console.log('✅ Partida actualitzada:', id);
        res.json(data[0]);
    } catch (error) {
        console.error('❌ Error actualitzant partida:', error);
        res.status(500).json({ error: 'Error actualitzant partida', details: error.message });
    }
});

// Eliminar una partida
app.delete('/api/partides/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('partides')
            .delete()
            .eq('id', id);

        if (error) throw error;

        console.log('✅ Partida eliminada:', id);
        res.json({ success: true, message: 'Partida eliminada correctament' });
    } catch (error) {
        console.error('❌ Error eliminant partida:', error);
        res.status(500).json({ error: 'Error eliminant partida', details: error.message });
    }
});

// Guardar múltiples partides (bulk save)
app.post('/api/partides/bulk', async (req, res) => {
    try {
        const partides = req.body;

        if (!Array.isArray(partides)) {
            return res.status(400).json({ error: 'S\'esperava un array de partides' });
        }

        // Validar cada partida abans d'enviar res a la BD
        for (let i = 0; i < partides.length; i++) {
            const err = validarPartida(partides[i]);
            if (err) {
                return res.status(400).json({ error: `Partida ${i}: ${err}` });
            }
        }

        // Eliminar camps auto-generats
        const partidesNetejades = partides.map(p => {
            const { id, created_at, updated_at, usuaris, modalitats, ...rest } = p;
            return rest;
        });

        const { data, error } = await supabase
            .from('partides')
            .insert(partidesNetejades)
            .select();

        if (error) {
            const { status, body } = dbErrorToResponse(error);
            console.error(`❌ Error guardant partides bulk (${status}):`, body);
            return res.status(status).json(body);
        }

        console.log('✅ Partides guardades (bulk):', partidesNetejades.length);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        console.error('❌ Error guardant partides (bulk):', error);
        res.status(500).json({ error: 'Error guardant partides', details: error.message });
    }
});

// ============================================
// HEALTH
// ============================================

app.get('/api/health', async (req, res) => {
    const started = Date.now();
    try {
        const { count, error: countErr } = await supabase
            .from('partides')
            .select('id', { count: 'exact', head: true });
        if (countErr) throw countErr;

        const { data: lastRow, error: lastErr } = await supabase
            .from('partides')
            .select('data')
            .order('data', { ascending: false })
            .limit(1);
        if (lastErr) throw lastErr;

        res.json({
            ok: true,
            db: 'ok',
            count_partides: count,
            last_match_date: lastRow && lastRow[0] ? lastRow[0].data : null,
            response_ms: Date.now() - started,
        });
    } catch (error) {
        console.error('❌ Healthcheck failed:', error);
        res.status(503).json({
            ok: false,
            db: 'error',
            error: error.message,
            response_ms: Date.now() - started,
        });
    }
});

// ============================================
// SERVIDOR
// ============================================

// Per a desenvolupament local
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`
🎱 Servidor d'estadístiques de billar iniciat!

📊 Pàgina principal: http://localhost:${PORT}

🆕 NOUS ENDPOINTS:
   GET    /api/usuaris              - Llistar usuaris
   POST   /api/usuaris              - Crear usuari
   PUT    /api/usuaris/:id          - Actualitzar usuari
   DELETE /api/usuaris/:id          - Eliminar usuari

   GET    /api/modalitats           - Llistar modalitats
   POST   /api/modalitats           - Crear modalitat

   GET    /api/partides             - Llistar partides (amb filtres)
   POST   /api/partides             - Crear partida
   PUT    /api/partides/:id         - Actualitzar partida
   DELETE /api/partides/:id         - Eliminar partida
   POST   /api/partides/bulk        - Crear múltiples partides

💾 Base de dades: Supabase (PostgreSQL)
🔄 Sincronització automàtica entre dispositius

Per aturar el servidor: Ctrl+C
        `);
    });
}

// Exportar per a Vercel
module.exports = app;
