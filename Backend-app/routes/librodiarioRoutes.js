const express = require('express');
const router = express.Router();
const librodiarioController = require('../controllers/librodiarioController');

router.get('/', librodiarioController.obtenerLibroDiario);

module.exports = router;