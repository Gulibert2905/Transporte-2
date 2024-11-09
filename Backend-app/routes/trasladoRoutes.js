const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const trasladoController = require('../controllers/trasladoController');

router.use(authenticateToken);

router.get('/', authorize('admin', 'operador', 'auditor'), trasladoController.getAllTraslados);
router.post('/', authorize('admin', 'operador'), trasladoController.createTraslado);
router.put('/:id', authorize('admin', 'operador'), trasladoController.updateTraslado);
router.delete('/:id', authorize('admin'), trasladoController.deleteTraslado);
router.get('/pendientes-verificacion', authorize('auditor'), trasladoController.getPendientesVerificacion);
router.put('/:id/verificar', authorize('auditor'), trasladoController.verificarTraslado);

module.exports = router;