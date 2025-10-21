const usuariService = require('../services/usuariService');
const { HTTP_STATUS } = require('../config/constants');

class UsuariController {
    /**
     * GET /api/usuaris - Obtenir tots els usuaris
     */
    async getAll(req, res, next) {
        try {
            const usuaris = await usuariService.getAll();
            console.log('✅ Usuaris carregats:', usuaris.length);
            res.json(usuaris);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/usuaris - Crear un nou usuari
     */
    async create(req, res, next) {
        try {
            const nouUsuari = await usuariService.create(req.body);
            console.log('✅ Usuari creat:', nouUsuari.nom);
            res.status(HTTP_STATUS.CREATED).json(nouUsuari);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/usuaris/:id - Actualitzar un usuari
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const usuari = await usuariService.update(id, req.body);
            console.log('✅ Usuari actualitzat:', id);
            res.json(usuari);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/usuaris/:id - Eliminar un usuari
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await usuariService.delete(id);
            console.log('✅ Usuari eliminat:', id);
            res.json({ success: true, message: 'Usuari eliminat correctament' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UsuariController();
