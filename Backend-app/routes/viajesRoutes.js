const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const viajeController = require('../controllers/viajeController');

// Remover el router.use(authenticateToken) y /viajes del path
router.get('/',
    authenticateToken,
    authorize('admin', 'contador'),
    viajeController.getAllViajes
);

router.post('/', 
    authenticateToken,
    authorize('operador', 'admin'), 
    viajeController.createViaje
);

router.get('/export/csv', 
    authenticateToken,
    authorize('contador', 'admin'), 
    viajeController.exportCSV
);

router.get('/export/excel', 
    authenticateToken,
    authorize('contador', 'admin'), 
    viajeController.exportExcel
);

module.exports = router;