const express = require('express');
const router = express.Router();
const tarifaController = require('../controllers/tarifaController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Removed /tarifas from path since it's already prefixed in app.js
router.get('/',
    authenticateToken,
    authorize('admin', 'contador'),
    tarifaController.getAllTarifas
);

router.get('/by-prestador-ruta',
    authenticateToken,
    authorize('admin', 'contador', 'operador'),
    tarifaController.getTarifaByPrestadorAndRuta
);

router.post('/',
    authenticateToken,
    authorize('admin', 'contador'),
    tarifaController.createTarifa
);

module.exports = router;