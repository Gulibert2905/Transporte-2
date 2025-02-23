const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // Añadido
const { Usuario } = require('../models');
const authController = require('../controllers/authController');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { logger } = require('../services/logger');

// Login (no necesita autenticación)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        logger.debug('Intento de login:', { username });

        const user = await Usuario.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const hashedPassword = crypto.createHash('sha256')
            .update(password)
            .digest('hex');

        if (hashedPassword !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                rol: user.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        logger.info('Login exitoso:', { username, rol: user.rol });
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                rol: user.rol
            }
        });
    } catch (error) {
        logger.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Validar token
router.get('/validate-token', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            valid: true,
            user: {
                id: req.user.id,
                username: req.user.username,
                rol: req.user.rol
            }
        });
    } catch (error) {
        logger.error('Error validando token:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
});

// Cambiar contraseña (requiere autenticación)
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual y nueva son requeridas'
            });
        }

        const hashedCurrentPassword = crypto.createHash('sha256')
            .update(currentPassword)
            .digest('hex');
            
        if (hashedCurrentPassword !== req.user.password) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        const hashedNewPassword = crypto.createHash('sha256')
            .update(newPassword)
            .digest('hex');

        await req.user.update({ password: hashedNewPassword });
        
        logger.info('Contraseña actualizada exitosamente para usuario:', req.user.username);
        
        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });
    } catch (error) {
        logger.error('Error al cambiar contraseña:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al cambiar contraseña',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.post('/logout', authenticateToken, async (req, res) => {
    try {
        await authController.logout(req, res);
    } catch (error) {
        logger.error('Error en ruta logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar el logout'
        });
    }
});

module.exports = router;