const express = require('express');
const router = express.Router();
const impuestoController = require('../controllers/impuestoController');

router.post('/', impuestoController.crearImpuesto);
router.get('/', impuestoController.obtenerImpuestos);
router.get('/:id', impuestoController.obtenerImpuestoPorId);
router.put('/:id', impuestoController.actualizarImpuesto);
router.delete('/:id', impuestoController.eliminarImpuesto);

module.exports = router;