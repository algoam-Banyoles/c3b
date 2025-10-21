const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * Validador per crear/actualitzar usuaris
 */
const validateUsuari = (req, res, next) => {
    const { nom } = req.body;

    if (!nom || nom.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: ERROR_MESSAGES.MISSING_NAME
        });
    }

    // Validar longitud del nom
    if (nom.trim().length > 100) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: 'El nom no pot superar els 100 caràcters'
        });
    }

    next();
};

/**
 * Validador per crear/actualitzar modalitats
 */
const validateModalitat = (req, res, next) => {
    const { nom } = req.body;

    if (!nom || nom.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: ERROR_MESSAGES.MISSING_NAME
        });
    }

    next();
};

/**
 * Validador per crear/actualitzar partides
 */
const validatePartida = (req, res, next) => {
    const { usuari_id, modalitat_id, caramboles, entrades } = req.body;

    if (!usuari_id || !modalitat_id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS
        });
    }

    if (typeof caramboles !== 'number' || caramboles < 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: 'Les caramboles han de ser un número positiu'
        });
    }

    if (typeof entrades !== 'number' || entrades <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: 'Les entrades han de ser un número major que 0'
        });
    }

    next();
};

module.exports = {
    validateUsuari,
    validateModalitat,
    validatePartida
};
