// routes/medicoRoutes.js
const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/medicoController');

// Dashboard
router.get('/dashboard', medicoController.getDashboard);

// Pacientes
router.get('/pacientes', medicoController.getMisPacientes);

// Consultas
router.get('/consultas', medicoController.getConsultas);
router.post('/consultas', medicoController.createConsulta);

// Historia Clínica
router.get('/historia-clinica/:pacienteId', medicoController.getHistoriaClinica);
router.post('/historia-clinica/:pacienteId', medicoController.createHistoriaClinica);

module.exports = router;