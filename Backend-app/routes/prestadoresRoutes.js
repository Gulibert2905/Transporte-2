const express = require('express');
const router = express.Router();
const prestadorController = require('../controllers/prestadorController');

router.get('/', prestadorController.getAllPrestadores);
router.post('/', prestadorController.createPrestador);
router.put('/:nit', prestadorController.updatePrestador);
router.delete('/:nit', prestadorController.deletePrestador);

module.exports = router;