/**
 * Constants globals de l'aplicació
 */

module.exports = {
    // Constants de la base de dades
    DB_TABLES: {
        USUARIS: 'usuaris',
        MODALITATS: 'modalitats',
        PARTIDES: 'partides'
    },

    // Limits i configuració
    MAX_REQUEST_SIZE: '10mb',
    DEFAULT_PORT: 3000,
    
    // Configuració de CORS
    CORS_OPTIONS: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
        credentials: true
    },

    // Missatges d'error
    ERROR_MESSAGES: {
        MISSING_USER_ID: 'usuari_id és obligatori',
        MISSING_MODALITAT_ID: 'modalitat_id és obligatori',
        MISSING_REQUIRED_FIELDS: 'usuari_id i modalitat_id són obligatoris',
        MISSING_NAME: 'El nom és obligatori',
        INVALID_REQUEST: 'Sol·licitud invàlida',
        SERVER_ERROR: 'Error intern del servidor',
        NOT_FOUND: 'Recurs no trobat'
    },

    // Configuració per defecte
    DEFAULT_MODALITAT: 'Tres Bandes',
    
    // Status codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500
    }
};
