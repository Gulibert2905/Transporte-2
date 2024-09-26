const express = require('express');
const router = express.Router();
const facturaCompraController = require('../controllers/facturaCompraController');

router.post('/', facturaCompraController.crearFacturaCompra);
router.get('/', facturaCompraController.obtenerFacturasCompra);

module.exports = router;