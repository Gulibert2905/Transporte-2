const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const pacienteController = require('../controllers/pacienteController');

// Rutas públicas dentro del módulo de pacientes
router.get('/buscar/:documento', authenticateToken, pacienteController.buscarPorDocumento);

// Rutas que requieren autorización
router.get('/', authenticateToken, authorize('admin', 'operador', 'auditor'), pacienteController.getAllPacientes);
router.post('/', authenticateToken, authorize('admin', 'operador'), pacienteController.createPaciente);
router.put('/:id', authenticateToken, authorize('admin', 'operador'), pacienteController.updatePaciente);
router.delete('/:id', authenticateToken, authorize('admin'), pacienteController.deletePaciente);

module.exports = router;