const express = require('express');
const router = express.Router();
const modalitatController = require('../controllers/modalitatController');
const { validateModalitat } = require('../middleware/validator');

// Rutes de modalitats
router.get('/', modalitatController.getAll.bind(modalitatController));
router.post('/', validateModalitat, modalitatController.create.bind(modalitatController));
router.put('/:id', validateModalitat, modalitatController.update.bind(modalitatController));
router.delete('/:id', modalitatController.delete.bind(modalitatController));

module.exports = router;
