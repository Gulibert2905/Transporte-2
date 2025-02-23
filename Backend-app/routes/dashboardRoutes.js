const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/', authenticateToken, authorize('admin', 'contador'), dashboardController.getDashboardData);
// Otras rutas específicas del dashboard...

module.exports = router;