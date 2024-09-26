const express = require('express');
const router = express.Router();
const notaContabilidadController = require('../controllers/notaContabilidadController');

router.post('/', notaContabilidadController.crearNotaContabilidad);
router.get('/', notaContabilidadController.obtenerNotasContabilidad);

module.exports = router;