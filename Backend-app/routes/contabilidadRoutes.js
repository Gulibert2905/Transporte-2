const express = require('express');
const router = express.Router();
const contabilidadController = require('../controllers/contabilidadController');

router.get('/balance-general', contabilidadController.getBalanceGeneral);
router.get('/estado-resultados', contabilidadController.getEstadoResultados);

router.get('/balance-general/pdf', contabilidadController.exportBalancePDF);
router.get('/balance-general/excel', contabilidadController.exportBalanceExcel);
router.get('/estado-resultados/pdf', contabilidadController.exportEstadoResultadosPDF);
router.get('/estado-resultados/excel', contabilidadController.exportEstadoResultadosExcel);


module.exports = router;