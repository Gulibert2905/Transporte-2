const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/csv', reporteController.generarReporteCSV);
router.get('/excel', reporteController.generarReporteExcel);

module.exports = router;