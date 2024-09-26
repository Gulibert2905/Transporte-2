// routes/cuentaRoutes.js
const express = require('express');
const router = express.Router();
const cuentaController = require('../controllers/cuentaController');

router.post('/', cuentaController.crearCuenta);
router.get('/', cuentaController.obtenerCuentas);
// Añade aquí las rutas para actualizar y eliminar cuentas

module.exports = router;