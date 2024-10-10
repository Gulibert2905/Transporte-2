const express = require('express');
const router = express.Router();
const cuentaController = require('../controllers/cuentaController');

router.post('/', cuentaController.crearCuenta);
router.get('/', cuentaController.obtenerCuentas);
router.get('/:id', cuentaController.obtenerCuentaPorId);
router.put('/:id', cuentaController.actualizarCuenta);
router.delete('/:id', cuentaController.eliminarCuenta);
router.get('/balance-general', cuentaController.obtenerBalanceGeneral);
router.get('/estado-resultados', cuentaController.obtenerEstadoResultados);

module.exports = router;