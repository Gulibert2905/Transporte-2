const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
//router.get('/validate-token', authController.validateToken);

module.exports = router;