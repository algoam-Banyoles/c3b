const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');
const { validatePartida } = require('../middleware/validator');

// Rutes de partides
router.get('/', partidaController.getAll.bind(partidaController));
router.post('/', validatePartida, partidaController.create.bind(partidaController));
router.post('/bulk', partidaController.createBulk.bind(partidaController));
router.put('/:id', validatePartida, partidaController.update.bind(partidaController));
router.delete('/:id', partidaController.delete.bind(partidaController));

module.exports = router;
