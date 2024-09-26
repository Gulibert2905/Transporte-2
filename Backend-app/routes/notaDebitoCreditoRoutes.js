const express = require('express');
const router = express.Router();
const notaDebitoCreditoController = require('../controllers/notaDebitoCreditoController');

router.post('/', notaDebitoCreditoController.crearNotaDebitoCredito);
router.get('/', notaDebitoCreditoController.obtenerNotasDebitoCredito);

module.exports = router;