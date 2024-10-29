const { validationResult, check } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Validaciones comunes
const validations = {
    viaje: [
        check('origen').notEmpty().trim().withMessage('El origen es requerido'),
        check('destino').notEmpty().trim().withMessage('El destino es requerido'),
        check('fecha').isISO8601().withMessage('Fecha inválida'),
        check('prestadorId').isInt().withMessage('ID de prestador inválido'),
        check('valor').isFloat({ min: 0 }).withMessage('El valor debe ser mayor a 0'),
        handleValidationErrors
    ],
    
    prestador: [
        check('nit').notEmpty().trim().withMessage('NIT es requerido'),
        check('nombre').notEmpty().trim().withMessage('Nombre es requerido'),
        check('telefono').notEmpty().withMessage('Teléfono es requerido'),
        check('email').isEmail().withMessage('Email inválido'),
        handleValidationErrors
    ],

    contabilidad: [
        check('fecha').isISO8601().withMessage('Fecha inválida'),
        check('valor').isFloat().withMessage('Valor inválido'),
        check('tipo').isIn(['ingreso', 'egreso']).withMessage('Tipo inválido'),
        check('descripcion').notEmpty().trim().withMessage('Descripción requerida'),
        handleValidationErrors
    ]
};

module.exports = validations;