const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { logger } = require('../services/logger');

// Constantes para roles
const ROLES = {
    ADMIN: 'admin',
    OPERADOR: 'operador',
    AUDITOR: 'auditor',
    CONTADOR: 'contador',
    MEDICO: 'medico',
    ENFERMERO: 'enfermero'
};

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith('Bearer ')) {
            logger.warn('No authorization header');
            return res.status(401).json({
                success: false,
                message: 'No authorization header'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Usuario.findOne({
            where: {
                id: decoded.id,
                estado: 'activo'
            },
            attributes: ['id', 'username', 'rol', 'estado', 'ultimo_acceso']
        });

        if (!user) {
            logger.warn('Usuario no encontrado o inactivo');
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        await user.update({ ultimo_acceso: new Date() });
        req.user = user;
        logger.info(`Usuario autenticado: ${user.username} (${user.rol})`);
        next();
    } catch (error) {
        logger.error('Error de autenticación:', error);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

// Función de autorización simplificada
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.rol;
        
        // Admin siempre tiene acceso
        if (userRole === ROLES.ADMIN) {
            return next();
        }

        // Verificar si el rol está permitido
        if (allowedRoles.includes(userRole)) {
            return next();
        }

        logger.warn(`Acceso denegado para ${req.user?.username} (${userRole}) en ruta: ${req.originalUrl}`);
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para esta acción'
        });
    };
};

// Middleware de verificación de permisos específicos
const verificarPermiso = (permiso) => {
    return (req, res, next) => {
        const permisos = getPermisosPorRol(req.user?.rol);
        
        if (req.user?.rol === ROLES.ADMIN || permisos.includes(permiso)) {
            return next();
        }

        logger.warn(`Usuario sin permiso "${permiso}": ${req.user?.username}`);
        return res.status(403).json({
            success: false,
            message: `Se requiere el permiso: ${permiso}`
        });
    };
};

// Función para obtener permisos según el rol
const getPermisosPorRol = (rol) => {
    const permisos = {
        [ROLES.ADMIN]: [
            'ver_todo',
            'crear_todo',
            'editar_todo',
            'eliminar_todo',
            'verificar_traslados'
        ],
        [ROLES.OPERADOR]: [
            'ver_traslados',
            'crear_traslados',
            'editar_traslados'
        ],
        [ROLES.AUDITOR]: [
            'ver_traslados',
            'verificar_traslados',
            'generar_reportes',
            'ver_estadisticas'
        ],
        [ROLES.CONTADOR]: [
            'ver_prestadores',
            'editar_prestadores',
            'ver_rutas',
            'editar_rutas',
            'ver_tarifas',
            'editar_tarifas'
        ],
        [ROLES.MEDICO]: [
            'ver_pacientes',
            'crear_historia_clinica',
            'editar_historia_clinica',
            'ver_historia_clinica',
            'crear_consulta',
            'ver_consultas'
        ],
        [ROLES.ENFERMERO]: [
            'ver_pacientes',
            'registrar_signos_vitales',
            'ver_historia_clinica',
            'crear_notas_enfermeria',
            'ver_notas_enfermeria'
        ]
    };

    return permisos[rol] || [];
};

module.exports = {
    authenticateToken,
    authorize,
    verificarPermiso,
    ROLES,
    getPermisosPorRol
};