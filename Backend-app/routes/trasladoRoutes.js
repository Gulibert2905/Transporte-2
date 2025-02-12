const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, verificarPermiso } = require('../middleware/auth');
const trasladoController = require('../controllers/trasladoController');

// Rutas accesibles para admin, operador y auditor
router.get('/', 
    authenticateToken,
    authorize('admin', 'operador', 'auditor'),
    verificarPermiso('ver_traslados'),
    trasladoController.getAllTraslados
);

// Rutas específicas para el auditor y admin
router.get('/verificacion/pendientes', 
    authenticateToken,
    authorize('admin', 'auditor'),
    verificarPermiso('verificar_traslados'),
    trasladoController.getPendientesVerificacion
);

router.get('/verificacion/estadisticas', 
    authenticateToken,
    authorize('admin', 'auditor'),
    verificarPermiso('ver_estadisticas'),
    trasladoController.getEstadisticasVerificacion
);

router.patch('/verificacion/:id', 
    authenticateToken,
    authorize('admin', 'auditor'),
    verificarPermiso('verificar_traslados'),
    trasladoController.verificarTraslado
);

// Rutas para operadores y admin
router.post('/', 
    authenticateToken,
    authorize('admin', 'operador'),
    verificarPermiso('crear_traslados'),
    trasladoController.createTraslado
);

router.put('/:id', 
    authenticateToken,
    authorize('admin', 'operador'),
    verificarPermiso('editar_traslados'),
    trasladoController.updateTraslado
);

// Solo admin puede eliminar un traslado
router.delete('/:id', 
    authenticateToken,
    authorize('admin'),
    verificarPermiso('eliminar_todo'),
    trasladoController.deleteTraslado
);

// Rutas de reportes para auditor y admin
router.get('/reporte', 
    authenticateToken,
    authorize('admin', 'auditor'),
    verificarPermiso('generar_reportes'),
    trasladoController.getReporteTraslados
);

// Rutas específicas por rol
router.get('/pendientes-municipales',
    authenticateToken,
    authorize('gestor_municipal'),
    verificarPermiso('ver_traslados'),
    trasladoController.getPendientesMunicipales
);

router.get('/pendientes-tickets',
    authenticateToken,
    authorize('gestor_tickets'),
    verificarPermiso('ver_traslados'),
    trasladoController.getPendientesTickets
);

router.get('/pendientes-verificacion',
    authenticateToken,
    authorize('auditor'),
    verificarPermiso('verificar_traslados'),
    trasladoController.getPendientesVerificacion
);

router.post('/asignar-prestador',
    authenticateToken,
    authorize(['gestor_municipal', 'gestor_tickets']),
    verificarPermiso('editar_traslados'),
    trasladoController.asignarPrestador
);

router.post('/verificar-traslado',
    authenticateToken,
    authorize('auditor'),
    verificarPermiso('verificar_traslados'),
    trasladoController.verificarTraslado
);

router.post('/registrar-viaticos',
    authenticateToken,
    authorize('auditor'),
    verificarPermiso('verificar_traslados'),
    trasladoController.registrarViaticos
);

module.exports = router;