const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const notaDebitoCreditoController = require('../controllers/notaDebitoCreditoController');

router.use(authenticateToken);
router.use(authorize('contador', 'admin'));

router.post('/', notaDebitoCreditoController.crearNotaDebitoCredito);
router.get('/', notaDebitoCreditoController.obtenerNotasDebitoCredito);

module.exports = router;