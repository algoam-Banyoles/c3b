const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * Middleware per gestionar errors de forma centralitzada
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || ERROR_MESSAGES.SERVER_ERROR;

    res.status(statusCode).json({
        error: message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

/**
 * Middleware per gestionar rutes no trobades
 */
const notFoundHandler = (req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.NOT_FOUND,
        path: req.originalUrl
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
