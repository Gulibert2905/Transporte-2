const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { logger } = require('../services/logger');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Log para debugging
        logger.debug('Token decodificado:', decoded);

        // Verificar que el usuario existe
        const user = await Usuario.findByPk(decoded.id);
        
        // Log para debugging
        logger.debug('Usuario encontrado:', user ? 'Sí' : 'No');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Error en autenticación:', {
            error: error.message,
            stack: error.stack
        });
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        logger.debug('Verificando autorización:', {
            userRole: req.user?.rol,
            requiredRoles: roles
        });

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        if (!roles.includes(req.user.rol)) {
            logger.warn('Intento de acceso no autorizado:', {
                userId: req.user.id,
                userRole: req.user.rol,
                requiredRoles: roles,
                path: req.path
            });
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para acceder a este recurso'
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorize
};