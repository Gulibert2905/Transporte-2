const express = require('express');
const router = express.Router();
const tarifaController = require('../controllers/tarifaController');

router.get('/by-prestador-ruta', tarifaController.getTarifaByPrestadorAndRuta);
router.get('/', tarifaController.getAllTarifas);
router.post('/', tarifaController.createTarifa);

// Añada más rutas según sea necesario

module.exports = router;