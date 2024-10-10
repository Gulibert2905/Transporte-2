const express = require('express');
const router = express.Router();
const reportesFinancierosController = require('../controllers/reportesFinancierosController');

router.get('/balance-general', reportesFinancierosController.obtenerBalanceGeneral);
router.get('/estado-resultados', reportesFinancierosController.obtenerEstadoResultados);

module.exports = router;