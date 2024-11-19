const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const pacienteController = require('../controllers/pacienteController');

// Aplicar authenticateToken a todas las rutas
router.use(authenticateToken);

// Rutas de búsqueda
router.get('/buscar/:documento',
    authorize('admin', 'operador', 'auditor'), 
    pacienteController.buscarPorDocumento
);

// Rutas CRUD básicas
router.get('/',
    authorize('admin', 'operador', 'auditor'), 
    pacienteController.getAllPacientes
);

router.post('/',
    authorize('admin', 'operador'), 
    pacienteController.createPaciente
);

router.put('/:id',
    authorize('admin', 'operador'), 
    pacienteController.updatePaciente
);

router.delete('/:id',
    authorize('admin'), // Solo necesita un string para un rol
    pacienteController.deletePaciente
);

// Ruta de importación
router.post('/importar',
    authorize('admin'), // Solo necesita un string para un rol
    pacienteController.importarPacientes
);

module.exports = router;