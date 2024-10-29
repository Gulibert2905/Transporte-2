const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Ruta de login (pública)
router.post('/login', authController.login);

// Ruta de prueba para verificar autenticación
router.get('/test', authenticateToken, (req, res) => {
    res.json({
        message: 'Ruta protegida funcionando',
        user: req.user
    });
});

// Gestión de usuarios (solo admin)
router.get('/users', 
    authenticateToken, 
    authorize('admin'), 
    async (req, res) => {
        try {
            const users = await Usuario.findAll({
                attributes: ['id', 'username', 'rol', 'createdAt']
            });
            res.json({ success: true, users });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener usuarios' 
            });
        }
    }
);

// Crear nuevo usuario (solo admin)
router.post('/users', 
    authenticateToken, 
    authorize('admin'), 
    async (req, res) => {
        try {
            const { username, password, rol } = req.body;
            
            if (!username || !password || !rol) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
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
            res.status(500).json({ 
                success: false, 
                message: 'Error al crear usuario' 
            });
        }
    }
);

// Actualizar usuario
router.put('/users/:id', 
    authenticateToken, 
    authorize('admin'), 
    async (req, res) => {
        try {
            const { username, rol } = req.body;
            const user = await Usuario.findByPk(req.params.id);
            
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
            res.status(500).json({ 
                success: false, 
                message: 'Error al actualizar usuario' 
            });
        }
    }
);

// Eliminar usuario
router.delete('/users/:id', 
    authenticateToken, 
    authorize('admin'), 
    async (req, res) => {
        try {
            const user = await Usuario.findByPk(req.params.id);
            
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
            res.status(500).json({ 
                success: false, 
                message: 'Error al eliminar usuario' 
            });
        }
    }
);

// Cambiar contraseña (cualquier usuario autenticado)
router.post('/change-password', 
    authenticateToken, 
    async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            
            const hashedCurrentPassword = crypto.createHash('sha256')
                .update(currentPassword)
                .digest('hex');
                
            if (hashedCurrentPassword !== req.user.password) {
                return res.status(401).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }

            const hashedNewPassword = crypto.createHash('sha256')
                .update(newPassword)
                .digest('hex');

            await req.user.update({ password: hashedNewPassword });
            
            res.json({
                success: true,
                message: 'Contraseña actualizada correctamente'
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error al cambiar contraseña' 
            });
        }
    }
);

module.exports = router;