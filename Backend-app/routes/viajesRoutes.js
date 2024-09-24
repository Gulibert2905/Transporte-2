const express = require('express');
const router = express.Router();
const viajeController = require('../controllers/viajeController');

router.get('/', viajeController.getAllViajes);
router.post('/', viajeController.createViaje);

// Añada más rutas según sea necesario
router.get('/export/csv', viajeController.exportCSV);
router.get('/export/excel', viajeController.exportExcel);

module.exports = router;