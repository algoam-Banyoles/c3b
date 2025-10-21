const partidaService = require('../services/partidaService');
const { HTTP_STATUS } = require('../config/constants');

class PartidaController {
    /**
     * GET /api/partides - Obtenir partides amb filtres opcionals
     */
    async getAll(req, res, next) {
        try {
            const { usuari_id, modalitat_id } = req.query;
            const filters = {};

            if (usuari_id) filters.usuari_id = usuari_id;
            if (modalitat_id) filters.modalitat_id = modalitat_id;

            const partides = await partidaService.getAll(filters);
            console.log('✅ Partides carregades:', partides.length);
            res.json(partides);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/partides - Crear una nova partida
     */
    async create(req, res, next) {
        try {
            const novaPartida = await partidaService.create(req.body);
            console.log('✅ Partida creada:', novaPartida.num);
            res.status(HTTP_STATUS.CREATED).json(novaPartida);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/partides/bulk - Crear múltiples partides
     */
    async createBulk(req, res, next) {
        try {
            const partides = req.body;

            if (!Array.isArray(partides)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'S\'esperava un array de partides'
                });
            }

            const result = await partidaService.createBulk(partides);
            console.log('✅ Partides guardades (bulk):', result.length);
            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/partides/:id - Actualitzar una partida
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const partida = await partidaService.update(id, req.body);
            console.log('✅ Partida actualitzada:', id);
            res.json(partida);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/partides/:id - Eliminar una partida
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await partidaService.delete(id);
            console.log('✅ Partida eliminada:', id);
            res.json({ success: true, message: 'Partida eliminada correctament' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PartidaController();
