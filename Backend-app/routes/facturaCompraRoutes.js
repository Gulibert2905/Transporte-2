const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const facturaCompraController = require('../controllers/facturaCompraController');

router.use(authenticateToken);
router.use(authorize('contador', 'admin'));

router.post('/', facturaCompraController.crearFacturaCompra);
router.get('/', facturaCompraController.obtenerFacturasCompra);

module.exports = router;