const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const trasladoController = require('../controllers/trasladoController');

// Rutas accesibles para admin, operador y auditor
router.get('/', 
    authenticateToken,
    authorize('admin', 'operador', 'auditor'), 
    trasladoController.getAllTraslados
);

// Rutas específicas para el auditor y admin
router.get('/verificacion/pendientes', 
    authenticateToken,
    authorize('admin', 'auditor'),
    trasladoController.getPendientesVerificacion
);

router.get('/verificacion/estadisticas', 
    authenticateToken,
    authorize('admin', 'auditor'),
    trasladoController.getEstadisticasVerificacion
);

router.patch('/verificacion/:id', 
    authenticateToken,
    authorize('admin', 'auditor'),
    trasladoController.verificarTraslado
);

// Rutas para operadores y admin
router.post('/', 
    authenticateToken,
    authorize('admin','operador'), 
    trasladoController.createTraslado
);


router.put('/:id', 
    authenticateToken,
    authorize('admin', 'operador'), 
    trasladoController.updateTraslado
);

// Solo admin puede eliminar un traslado
router.delete('/:id', 
    authenticateToken,
    authorize('admin'), 
    trasladoController.deleteTraslado
);

// Rutas de reportes para auditor y admin
router.get('/reporte', 
    authenticateToken,
    authorize('admin', 'auditor'),
    trasladoController.getReporteTraslados // Asegúrate de que este nombre coincida con el exportado
);

router.get('/pendientes-municipales',
    authenticateToken,
    authorize('gestor_municipal'),
    trasladoController.getPendientesMunicipales
);

router.get('/pendientes-tickets',
    authenticateToken,
    authorize('gestor_tickets'),
    trasladoController.getPendientesTickets
);

router.get('/pendientes-verificacion',
    authenticateToken,
    authorize('auditor'),
    trasladoController.getPendientesVerificacion
);

router.post('/asignar-prestador',
    authenticateToken,
    authorize(['gestor_municipal', 'gestor_tickets']),
    trasladoController.asignarPrestador
);

router.post('/verificar-traslado',
    authenticateToken,
    authorize('auditor'),
    trasladoController.verificarTraslado
);

router.post('/registrar-viaticos',
    authenticateToken,
    authorize('auditor'),
    trasladoController.registrarViaticos
);

module.exports = router;