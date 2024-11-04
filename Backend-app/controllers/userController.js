const crypto = require('crypto');
const { Usuario } = require('../models');
const { logger } = require('../services/logger');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await Usuario.findAll({
                attributes: ['id', 'username', 'rol', 'createdAt']
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
            const { username, password, rol } = req.body;

            if (!username || !password || !rol) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
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
                rol
            });

            res.status(201).json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    rol: user.rol
                }
            });
        } catch (error) {
            logger.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear usuario'
            });
        }
    },

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
            logger.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario'
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

            await user.destroy();

            res.json({
                success: true,
                message: 'Usuario eliminado correctamente'
            });
        } catch (error) {
            logger.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario'
            });
        }
    }
};

module.exports = userController;