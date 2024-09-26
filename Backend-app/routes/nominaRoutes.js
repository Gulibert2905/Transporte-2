const express = require('express');
const router = express.Router();
const nominaController = require('../controllers/nominaController');

router.post('/', nominaController.crearNomina);
router.get('/', nominaController.obtenerNominas);
// Agregar más rutas según sea necesario

module.exports = router;