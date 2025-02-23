const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Definir los roles y usarlos en la validación
const ROLES = ['admin', 'contador', 'administrativo', 'operador', 'medico', 'enfermero', 'auditor'];

// Middleware de autenticación
router.use(authenticateToken);

// Rutas que requieren ser admin
router.get('/', authorize(['admin']), userController.getAllUsers);
router.post('/', authorize(['admin']), userController.createUser);
router.put('/:id', authorize(['admin']), userController.updateUser);
router.delete('/:id', authorize(['admin']), userController.deleteUser);

// Ruta para obtener personal médico - accesible para más roles
router.get('/personal-medico', 
    authorize(['admin', 'medico', 'enfermero']), 
    userController.getPersonalMedico
);

// Middleware para validar roles en la creación/actualización de usuarios
router.use((req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT') && req.body.rol) {
        if (!ROLES.includes(req.body.rol)) {
            return res.status(400).json({
                success: false,
                message: `Rol inválido. Roles permitidos: ${ROLES.join(', ')}`
            });
        }
    }
    next();
});

module.exports = router;