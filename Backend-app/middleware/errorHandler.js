const { logger } = require('../services/logger');

// Tipos de errores personalizados
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    // Log del error
    logger.error({
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        user: req.user ? req.user.username : 'no-auth',
        timestamp: new Date().toISOString()
    });

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Respuesta en producción
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        } else {
            // Error de programación o no operacional
            res.status(500).json({
                success: false,
                message: 'Algo salió mal'
            });
        }
    }
};

module.exports = {
    AppError,
    errorHandler
};