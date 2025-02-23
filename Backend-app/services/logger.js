const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Asegurar que existan los directorios de logs
const logDirs = ['logs/error', 'logs/info', 'logs/debug'].map(dir => 
    path.join(__dirname, '..', dir)
);

logDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Formato personalizado para los logs
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Crear el logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    info: (message) => console.log(message),
    warn: (message) => console.warn(message),
    error: (message, error) => console.error(message, error),
    format: logFormat,
    defaultMeta: { 
        service: 'cemedic-api',
        environment: process.env.NODE_ENV 
    },
    transports: [
        // Logs de error
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        
        // Logs de información
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/info/combined.log'),
            level: 'info',
            maxsize: 5242880,
            maxFiles: 5,
            tailable: true
        }),

        // Logs de debug (solo en desarrollo)
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/debug/debug.log'),
            level: 'debug',
            maxsize: 5242880,
            maxFiles: 3,
            tailable: true
        })
    ]
});

// Agregar logging a consola en desarrollo
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Middleware para logging de requests
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Log de entrada
    logger.debug('Incoming Request', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        path: req.path,
        params: req.params,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined,
        headers: {
            'user-agent': req.get('user-agent'),
            'content-type': req.get('content-type'),
            'authorization': req.get('authorization') ? '[PRESENT]' : '[NOT PRESENT]'
        },
        ip: req.ip,
        user: req.user ? {
            id: req.user.id,
            username: req.user.username,
            rol: req.user.rol
        } : null
    });

    // Interceptar la finalización de la respuesta
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        logger.debug('Request Completed', {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            user: req.user ? {
                id: req.user.id,
                username: req.user.username
            } : null
        });
    });

    next();
};

// Función auxiliar para limpiar logs antiguos
const cleanOldLogs = (days = 30) => {
    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000;

    logDirs.forEach(dir => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                logger.error('Error reading log directory:', err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join(dir, file);
                fs.stat(filePath, (err, stat) => {
                    if (err) {
                        logger.error('Error stating file:', err);
                        return;
                    }

                    if (now - stat.mtime.getTime() > maxAge) {
                        fs.unlink(filePath, err => {
                            if (err) {
                                logger.error('Error deleting old log file:', err);
                            }
                        });
                    }
                });
            });
        });
    });
};

// Programar limpieza de logs antiguos
setInterval(() => cleanOldLogs(30), 24 * 60 * 60 * 1000); // Cada 24 horas

module.exports = {
    logger,
    requestLogger,
    cleanOldLogs
};