const modalitatService = require('../services/modalitatService');
const { HTTP_STATUS } = require('../config/constants');

class ModalitatController {
    /**
     * GET /api/modalitats - Obtenir totes les modalitats
     */
    async getAll(req, res, next) {
        try {
            const modalitats = await modalitatService.getAll();
            console.log('✅ Modalitats carregades:', modalitats.length);
            res.json(modalitats);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/modalitats - Crear una nova modalitat
     */
    async create(req, res, next) {
        try {
            const novaModalitat = await modalitatService.create(req.body);
            console.log('✅ Modalitat creada:', novaModalitat.nom);
            res.status(HTTP_STATUS.CREATED).json(novaModalitat);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/modalitats/:id - Actualitzar una modalitat
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const modalitat = await modalitatService.update(id, req.body);
            console.log('✅ Modalitat actualitzada:', id);
            res.json(modalitat);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/modalitats/:id - Eliminar una modalitat
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await modalitatService.delete(id);
            console.log('✅ Modalitat eliminada:', id);
            res.json({ success: true, message: 'Modalitat eliminada correctament' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ModalitatController();
