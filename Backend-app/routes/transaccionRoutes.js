const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');

router.post('/', transaccionController.crearTransaccion);
router.get('/', transaccionController.obtenerTransacciones);

module.exports = router;