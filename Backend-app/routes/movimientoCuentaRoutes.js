const express = require('express');
const router = express.Router();
const movimientoCuentaController = require('../controllers/movimientoCuentaController');

router.post('/movimientos', movimientoCuentaController.crearMovimiento);
router.get('/movimientos', movimientoCuentaController.obtenerMovimientos);
module.exports = router;