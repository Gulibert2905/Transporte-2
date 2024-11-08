const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { logger } = require('../services/logger');

const authenticateToken = async (req, res, next) => {
    try {
        console.log('Request Headers:', req.headers);
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.log('No authorization header found');
            return res.status(401).json({
                success: false,
                message: 'No authorization header'
            });
        }

        const [bearer, token] = authHeader.split(' ');

        if (bearer !== 'Bearer' || !token) {
            console.log('Invalid authorization format');
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization format'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            const user = await Usuario.findByPk(decoded.id);
            if (!user) {
                console.log('User not found:', decoded.id);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            req.user = user;
            next();
        } catch (jwtError) {
            console.log('JWT verification failed:', jwtError.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication'
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