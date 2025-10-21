const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { MAX_REQUEST_SIZE, DEFAULT_PORT, CORS_OPTIONS } = require('./src/config/constants');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors(CORS_OPTIONS));
app.use(express.json({ limit: MAX_REQUEST_SIZE }));
app.use(express.static(path.join(__dirname)));

// ============================================
// RUTES DE L'API
// ============================================
app.use('/api', routes);

// ============================================
// GESTIÓ D'ERRORS
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// SERVIDOR
// ============================================
if (require.main === module) {
    const PORT = process.env.PORT || DEFAULT_PORT;
    app.listen(PORT, () => {
        console.log(`
🎱 Servidor d'estadístiques de billar iniciat!

📊 Pàgina principal: http://localhost:${PORT}

🔗 API ENDPOINTS:
   
   Usuaris:
   GET    /api/usuaris              - Llistar usuaris
   POST   /api/usuaris              - Crear usuari
   PUT    /api/usuaris/:id          - Actualitzar usuari
   DELETE /api/usuaris/:id          - Eliminar usuari

   Modalitats:
   GET    /api/modalitats           - Llistar modalitats
   POST   /api/modalitats           - Crear modalitat
   PUT    /api/modalitats/:id       - Actualitzar modalitat
   DELETE /api/modalitats/:id       - Eliminar modalitat

   Partides:
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
