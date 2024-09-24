const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Intento de login para usuario:', username);
    
    const user = await Usuario.findOne({ where: { username } });
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log('Comparando contraseñas');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const isPasswordValid = hashedPassword === user.password;

    if (!isPasswordValid) {
      console.log('Contraseña inválida');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

        console.log('Login exitoso');
        const token = jwt.sign(
            { id: user.id, username: user.username, rol: user.rol },
            
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id,
                username: user.username, 
                rol: user.rol 
            } 
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};