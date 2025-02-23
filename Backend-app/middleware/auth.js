const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { logger } = require('../services/logger');

// Constantes para roles
const ROLES = {
    ADMIN: 'admin',
    OPERADOR: 'operador',
    AUDITOR: 'auditor',
    CONTADOR: 'contador'
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
        logger.info('Token recibido para autenticación');

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

// Función mejorada de autorización
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const path = req.path;
        const userRole = req.user?.rol;
        const username = req.user?.username;

        logger.info(`Verificando autorización para ${username} (${userRole}) en ruta: ${path}`);
        logger.info(`Roles permitidos: ${allowedRoles.join(',')}`);

        if (!req.user) {
            logger.warn('No hay usuario autenticado');
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // El admin siempre tiene acceso
        if (userRole === ROLES.ADMIN) {
            logger.info(`Acceso concedido para admin en ruta: ${path}`);
            return next();
        }

        // Verificar si el rol del usuario está en los roles permitidos
        if (allowedRoles.includes(userRole)) {
            // Si es auditor y la ruta es de verificación, verificar permisos específicos
            if (userRole === ROLES.AUDITOR && path.includes('verificacion')) {
                const tienePermiso = verificarPermisoAuditor(req);
                if (tienePermiso) {
                    logger.info(`Acceso concedido para auditor en ruta: ${path}`);
                    return next();
                }
                logger.warn(`Acceso denegado para auditor en ruta: ${path}`);
                return res.status(403).json({
                    success: false,
                    message: 'El auditor no tiene permiso para acceder a este recurso'
                });
            }

            // Para otros roles permitidos
            logger.info(`Acceso concedido para ${userRole} en ruta: ${path}`);
            return next();
        }

        logger.warn(`Acceso denegado para ${username} (${userRole}) en ruta: ${path}`);
        return res.status(403).json({
            success: false,
            message: 'No tiene permisos para esta acción'
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
        ]
    };

    return permisos[rol] || [];
};

// Función para verificar permisos específicos del auditor
const verificarPermisoAuditor = (req) => {
    const rutasPermitidas = [
        '/verificacion/pendientes',
        '/verificacion/estadisticas',
        '/verificacion/reportes',
        '/verificacion',
        '/traslados/verificacion',
        '/reporte'
    ];
    
    const path = req.path.toLowerCase();
    
    // Verificar si la ruta es de verificación de un traslado específico
    const esVerificacionTraslado = /^\/verificacion\/\d+$/.test(path);
    if (esVerificacionTraslado) {
        return true;
    }

    // Verificar si es una ruta de reporte
    if (path.startsWith('/reporte')) {
        return true;
    }

    return rutasPermitidas.some(ruta => path.includes(ruta.toLowerCase()));
};

// Middleware para verificar permisos específicos
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

module.exports = {
    authenticateToken,
    authorize,
    verificarPermiso,
    ROLES,
    getPermisosPorRol
};