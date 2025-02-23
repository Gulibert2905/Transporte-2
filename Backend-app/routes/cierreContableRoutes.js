const express = require('express');
const router = express.Router();
const cierreContableController = require('../controllers/cierreContableController');

router.post('/cierre-anual/:año', cierreContableController.realizarCierreAnual);

module.exports = router;