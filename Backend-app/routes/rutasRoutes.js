const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');

router.get('/', rutaController.getAllRutas);
router.post('/', rutaController.createRuta);

// Añada más rutas según sea necesario

module.exports = router;