const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const contabilidadController = require('../controllers/contabilidadController');

// Proteger todas las rutas de contabilidad
router.use(authenticateToken);
router.use(authorize('contador', 'admin'));

// Reportes básicos
router.get('/balance-general', contabilidadController.getBalanceGeneral);
router.get('/estado-resultados', contabilidadController.getEstadoResultados);
router.get('/libro-diario', contabilidadController.getLibroDiario);
router.get('/balance-de-prueba', contabilidadController.getBalanceDePrueba);

// Generación de reportes
router.get('/balance-general/generar', contabilidadController.getBalanceGeneralGenerado);
router.get('/estado-resultados/generar', contabilidadController.getEstadoResultadosGenerado);

// Exportación de reportes
router.get('/balance-general/pdf', contabilidadController.exportBalancePDF);
router.get('/balance-general/excel', contabilidadController.exportBalanceExcel);
router.get('/estado-resultados/pdf', contabilidadController.exportEstadoResultadosPDF);
router.get('/estado-resultados/excel', contabilidadController.exportEstadoResultadosExcel);

// Operaciones críticas - solo admin
router.post('/cierre-anual/:año', authorize('admin'), contabilidadController.realizarCierreAnual);
router.post('/cierre-mensual/:año/:mes', authorize('admin'), contabilidadController.realizarCierreMensual);

module.exports = router;