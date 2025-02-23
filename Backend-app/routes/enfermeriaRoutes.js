// routes/enfermeriaRoutes.js
const express = require('express');
const router = express.Router();
const enfermeriaController = require('../controllers/enfermeriaController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Asegurar que todas las rutas requieran autenticación y rol de enfermero
router.use(authenticateToken);
router.use(authorize(['enfermero']));

// Dashboard
router.get('/dashboard', enfermeriaController.getDashboardEnfermeria);

// Pacientes
router.get('/pacientes', enfermeriaController.getPacientesAsignados);

// Signos vitales
router.get('/signos-vitales/:pacienteId', enfermeriaController.getSignosVitales);
router.post('/signos-vitales/:pacienteId', enfermeriaController.registrarSignosVitales);

// Notas de enfermería
router.get('/notas/:pacienteId', enfermeriaController.getNotasEnfermeria);
router.post('/notas/:pacienteId', enfermeriaController.crearNotaEnfermeria);

// Medicación
router.get('/medicaciones/:pacienteId', enfermeriaController.getMedicaciones);
router.post('/medicaciones/:pacienteId', enfermeriaController.registrarMedicacion);

module.exports = router;