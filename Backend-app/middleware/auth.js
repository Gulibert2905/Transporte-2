const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { logger } = require('../services/logger');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No authorization header'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token recibido:', token);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decodificado:', decoded);

            const user = await Usuario.findByPk(decoded.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            req.user = user;
            next();
        } catch (jwtError) {
            console.log('Error en verificación JWT:', jwtError);
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }
    } catch (error) {
        console.error('Error de autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error del servidor durante la autenticación'
        });
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        console.log('Usuario actual:', req.user);
        console.log('Roles permitidos:', allowedRoles);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado - Usuario no encontrado'
            });
        }

        // Corregir la verificación del rol
        if (!allowedRoles.some(role => role === req.user.rol)) {
            console.log(`Usuario ${req.user.rol} no tiene acceso. Roles permitidos:`, allowedRoles);
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