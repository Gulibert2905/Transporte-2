const crypto = require('crypto');
const { Usuario } = require('../models');
const { logger } = require('../services/logger');

// Definir los roles válidos
const ROLES_VALIDOS = [
    'admin',
    'contador',
    'administrativo',
    'operador',
    'medico',
    'enfermero',
    'auditor'
];

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await Usuario.findAll({
                attributes: ['id', 'username', 'rol', 'estado', 'nombre_completo', 'createdAt']
            });
            res.json({ success: true, users });
        } catch (error) {
            logger.error('Error getting users:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios'
            });
        }
    },

    createUser: async (req, res) => {
        try {
            const { username, password, rol, nombre_completo, email } = req.body;

            // Validaciones
            if (!username || !password || !rol) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }

            // Convertir rol a minúsculas y validar
            const rolLowerCase = rol.toLowerCase();
            if (!ROLES_VALIDOS.includes(rolLowerCase)) {
                return res.status(400).json({
                    success: false,
                    message: `Rol inválido. Roles permitidos: ${ROLES_VALIDOS.join(', ')}`
                });
            }

            const existingUser = await Usuario.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de usuario ya existe'
                });
            }

            const hashedPassword = crypto.createHash('sha256')
                .update(password)
                .digest('hex');

            const user = await Usuario.create({
                username,
                password: hashedPassword,
                rol: rolLowerCase,
                nombre_completo,
                email,
                estado: 'activo',
                requiere_cambio_password: true,
                fecha_ultimo_password: new Date()
            });

            logger.info(`Usuario creado: ${username} con rol ${rolLowerCase}`);

            res.status(201).json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    rol: user.rol,
                    nombre_completo: user.nombre_completo,
                    estado: user.estado
                }
            });
        } catch (error) {
            logger.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear usuario',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, rol, nombre_completo, email, estado } = req.body;

            const user = await Usuario.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Si se está actualizando el rol, validarlo
            if (rol) {
                const rolLowerCase = rol.toLowerCase();
                if (!ROLES_VALIDOS.includes(rolLowerCase)) {
                    return res.status(400).json({
                        success: false,
                        message: `Rol inválido. Roles permitidos: ${ROLES_VALIDOS.join(', ')}`
                    });
                }
                req.body.rol = rolLowerCase;
            }

            await user.update({
                username,
                rol: req.body.rol,
                nombre_completo,
                email,
                estado
            });

            logger.info(`Usuario actualizado: ${username}`);

            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    rol: user.rol,
                    nombre_completo: user.nombre_completo,
                    estado: user.estado
                }
            });
        } catch (error) {
            logger.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            
            const user = await Usuario.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // En lugar de eliminar, marcar como inactivo
            await user.update({ estado: 'inactivo' });

            logger.info(`Usuario desactivado: ${user.username}`);

            res.json({
                success: true,
                message: 'Usuario desactivado correctamente'
            });
        } catch (error) {
            logger.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Error al desactivar usuario'
            });
        }
    },
    
    getPersonalMedico: async (req, res) => {
        try {
            const personalMedico = await Usuario.findAll({
                where: {
                    rol: ['medico', 'enfermero'], // Roles en minúsculas
                    estado: 'activo'
                },
                attributes: ['id', 'username', 'nombre_completo', 'rol', 'email', 'estado']
            });

            res.json({
                success: true,
                data: personalMedico
            });
        } catch (error) {
            logger.error('Error al obtener personal médico:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el personal médico',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = userController;