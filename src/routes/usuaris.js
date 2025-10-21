const express = require('express');
const router = express.Router();
const usuariController = require('../controllers/usuariController');
const { validateUsuari } = require('../middleware/validator');

// Rutes d'usuaris
router.get('/', usuariController.getAll.bind(usuariController));
router.post('/', validateUsuari, usuariController.create.bind(usuariController));
router.put('/:id', validateUsuari, usuariController.update.bind(usuariController));
router.delete('/:id', usuariController.delete.bind(usuariController));

module.exports = router;
