const express = require('express');
const router = express.Router();
const comprobanteEgresoController = require('../controllers/comprobanteEgresoController');

router.post('/', comprobanteEgresoController.crearComprobanteEgreso);
router.get('/', comprobanteEgresoController.obtenerComprobantesEgreso);

module.exports = router;