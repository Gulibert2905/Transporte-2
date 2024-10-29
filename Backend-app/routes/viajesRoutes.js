const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const viajeController = require('../controllers/viajeController');

// Proteger todas las rutas
router.use(authenticateToken);

// Rutas de lectura - acceso general autenticado
router.get('/', viajeController.getAllViajes);

// Creación - solo operador y admin
router.post('/', authorize('operador', 'admin'), viajeController.createViaje);

// Exportación - solo contador y admin
router.get('/export/csv', authorize('contador', 'admin'), viajeController.exportCSV);
router.get('/export/excel', authorize('contador', 'admin'), viajeController.exportExcel);

module.exports = router;