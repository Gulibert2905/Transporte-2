const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const reportesFinancierosController = require('../controllers/reportesFinancierosController');

// Proteger todas las rutas
router.use(authenticateToken);
router.use(authorize('contador', 'admin'));

// Rutas de reportes
router.get('/balance-general', reportesFinancierosController.obtenerBalanceGeneral);
router.get('/estado-resultados', reportesFinancierosController.obtenerEstadoResultados);

module.exports = router;