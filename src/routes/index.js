const express = require('express');
const router = express.Router();
const usuarisRoutes = require('./usuaris');
const modalitatsRoutes = require('./modalitats');
const partidesRoutes = require('./partides');

// Combinar totes les rutes
router.use('/usuaris', usuarisRoutes);
router.use('/modalitats', modalitatsRoutes);
router.use('/partides', partidesRoutes);

module.exports = router;
