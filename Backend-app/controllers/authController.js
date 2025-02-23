const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { logger } = require('../services/logger');

const authController = {
    // Login existente
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            logger.debug('Intento de login para usuario:', username);

            const user = await Usuario.findOne({ where: { username } });
            if (!user) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
            const isPasswordValid = hashedPassword === user.password;

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, rol: user.rol },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    rol: user.rol
                }
            });
        } catch (error) {
            logger.error('Error en login:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    },

    logout: async (req, res) => {
        try {
            // Aunque no hay mucho que hacer en el servidor para el logout
            // ya que el token es stateless, es buena práctica tener este endpoint
            logger.info(`Usuario ${req.user?.username} cerró sesión`);
            res.json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
        } catch (error) {
            logger.error('Error en logout:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cerrar sesión'
            });
        }
    },

    // Obtener todos los usuarios
    getAllUsers: async (req, res) => {
        try {
            const users = await Usuario.findAll({
                attributes: ['id', 'username', 'rol', 'createdAt', 'updatedAt']
            });
            res.json({ success: true, users });
        } catch (error) {
            logger.error('Error al obtener usuarios:', error);
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    },

    // Crear nuevo usuario
    createUser: async (req, res) => {
        try {
            const { username, password, rol } = req.body;

            // Validar datos
            if (!username || !password || !rol) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }

            // Verificar si el usuario ya existe
            const existingUser = await Usuario.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de usuario ya existe'
                });
            }

            // Crear hash de la contraseña
            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

            // Crear usuario
            const newUser = await Usuario.create({
                username,
                password: hashedPassword,
                rol
            });

            res.status(201).json({
                success: true,
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    rol: newUser.rol
                }
            });
        } catch (error) {
            logger.error('Error al crear usuario:', error);
            res.status(500).json({ message: 'Error al crear usuario' });
        }
    },

    getPersonalMedico: async (req, res) => {
        try {
            const personalMedico = await Usuario.findAll({
                where: {
                    rol: ['medico', 'enfermero'],
                    estado: 'activo'
                },
                attributes: ['id', 'username', 'nombre_completo', 'rol']
            });
    
            res.json({
                success: true,
                data: personalMedico
            });
        } catch (error) {
            logger.error('Error al obtener personal médico:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el personal médico'
            });
        }
    },
    
    // Actualizar usuario
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, rol } = req.body;

            const user = await Usuario.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            await user.update({ username, rol });

            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    rol: user.rol
                }
            });
        } catch (error) {
            logger.error('Error al actualizar usuario:', error);
            res.status(500).json({ message: 'Error al actualizar usuario' });
        }
    },

    // Eliminar usuario
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

            await user.destroy();

            res.json({
                success: true,
                message: 'Usuario eliminado correctamente'
            });
        } catch (error) {
            logger.error('Error al eliminar usuario:', error);
            res.status(500).json({ message: 'Error al eliminar usuario' });
        }
    },

    // Resetear contraseña de usuario
    resetUserPassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            const user = await Usuario.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
            await user.update({ password: hashedPassword });

            res.json({
                success: true,
                message: 'Contraseña actualizada correctamente'
            });
        } catch (error) {
            logger.error('Error al resetear contraseña:', error);
            res.status(500).json({ message: 'Error al resetear contraseña' });
        }
    },

    // Cambiar propia contraseña
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const user = await Usuario.findByPk(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar contraseña actual
            const hashedCurrentPassword = crypto.createHash('sha256').update(currentPassword).digest('hex');
            if (hashedCurrentPassword !== user.password) {
                return res.status(401).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }

            // Actualizar a nueva contraseña
            const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
            await user.update({ password: hashedNewPassword });

            res.json({
                success: true,
                message: 'Contraseña actualizada correctamente'
            });
        } catch (error) {
            logger.error('Error al cambiar contraseña:', error);
            res.status(500).json({ message: 'Error al cambiar contraseña' });
        }
    }
};

exports.validateToken = async (req, res) => {
    try {
        // El token ya fue verificado por el middleware authenticateToken
        const { id } = req.user;
        
        const usuario = await Usuario.findByPk(id, {
            attributes: ['id', 'username', 'rol'] // No incluir password
        });

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: usuario
        });
    } catch (error) {
        console.error('Error validando token:', error);
        res.status(500).json({
            success: false,
            message: 'Error al validar token'
        });
    }
};

module.exports = authController;