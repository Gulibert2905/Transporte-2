const express = require('express');
const router = express.Router();
const reciboCajaController = require('../controllers/reciboCajaController');

router.post('/', reciboCajaController.crearReciboCaja);
router.get('/', reciboCajaController.obtenerRecibosCaja);

module.exports = router;