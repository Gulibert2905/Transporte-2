const express = require('express');
const router = express.Router();
const transaccionesController = require('../controllers/transaccionesController');

router.post('/', transaccionesController.crearTransaccion);
router.get('/', transaccionesController.obtenerTransacciones);

module.exports = router;