const express = require('express');
const router = express.Router();
const contabilidadController = require('../controllers/contabilidadController');

router.get('/balance-general', contabilidadController.getBalanceGeneral);
router.get('/estado-resultados', contabilidadController.getEstadoResultados);

router.get('/balance-general/pdf', contabilidadController.exportBalancePDF);
router.get('/balance-general/excel', contabilidadController.exportBalanceExcel);
router.get('/estado-resultados/pdf', contabilidadController.exportEstadoResultadosPDF);
router.get('/estado-resultados/excel', contabilidadController.exportEstadoResultadosExcel);
router.get('/libro-diario', contabilidadController.getLibroDiario);
router.get('/balance-de-prueba', contabilidadController.getBalanceDePrueba);
router.post('/cierre-anual/:año', contabilidadController.realizarCierreAnual);

module.exports = router;