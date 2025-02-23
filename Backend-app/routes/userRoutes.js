const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const { Usuario } = require('../models');
const crypto = require('crypto');
const { logger } = require('../services/logger');
const ROLES_VALIDOS = ['admin', 'contador', 'administrativo', 'operador'];
// Middleware de autenticación
router.use(authenticateToken);
router.use(authorize('admin'));

// Ruta de prueba para verificar que el router funciona
router.get('/test', (req, res) => {
    res.json({ message: 'Router de usuarios funcionando' });
});

// GET - Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        logger.info('Solicitando lista de usuarios');

        const users = await Usuario.findAll({
            attributes: ['id', 'username', 'rol', 'createdAt', 'updatedAt']
        });

        logger.info(`Encontrados ${users.length} usuarios`);

        return res.json({
            success: true,
            users: users.map(user => ({
                id: user.id,
                username: user.username,
                rol: user.rol,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }))
        });
    } catch (error) {
        logger.error('Error al obtener usuarios:', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST - Crear usuario
router.post('/', async (req, res) => {
    try {
        const { username, password, rol } = req.body;
        
        // Validaciones
        if (!username || !password || !rol) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Verificar usuario existente
        const existingUser = await Usuario.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya existe'
            });
        }

        // Crear hash de la contraseña
        const hashedPassword = crypto.createHash('sha256')
            .update(password)
            .digest('hex');

        // Crear usuario
        const user = await Usuario.create({
            username,
            password: hashedPassword,
            rol
        });

        logger.info('Usuario creado exitosamente:', username);

        return res.status(201).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                rol: user.rol,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        logger.error('Error al crear usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PUT - Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, rol } = req.body;

        const user = await Usuario.findByPk(id);
        
        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Proteger al usuario admin principal
        if (user.id === 1 && req.user.id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para modificar al administrador principal'
            });
        }

        // Verificar username único si se está cambiando
        if (username && username !== user.username) {
            const existingUser = await Usuario.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: `El usuario "${username}" ya existe`
                });
            }
        }

        // Preparar datos para actualizar
        const updateData = {};
        if (username) updateData.username = username;
        if (rol) updateData.rol = rol;
        if (password) {
            updateData.password = crypto.createHash('sha256')
                .update(password)
                .digest('hex');
        }

        await user.update(updateData);

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                rol: user.rol,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        logger.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// DELETE - Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await Usuario.findByPk(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Proteger usuarios especiales
        if (user.id === 1 || user.id === 2) {
            return res.status(403).json({
                success: false,
                message: 'No se pueden eliminar los usuarios principales del sistema'
            });
        }

        await user.destroy();
        
        res.json({
            success: true,
            message: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        logger.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;