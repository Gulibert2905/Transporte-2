const bcrypt = require('bcryptjs');
const { sequelize, Usuario } = require('../src/models');

const usuarios = [
  { username: 'admin', password: 'admin123', rol: 'admin' },
  { username: 'contador', password: 'contador123', rol: 'contador' },
  { username: 'administrativo', password: 'admin123', rol: 'administrativo' },
];

async function seedUsers() {
  try {
    await sequelize.sync({ force: true }); // Esto borrará y recreará la tabla de usuarios

    const usuariosHasheados = await Promise.all(usuarios.map(async (usuario) => {
      const hashedPassword = await bcrypt.hash(usuario.password, 10);
      return { ...usuario, password: hashedPassword };
    }));

    await Usuario.bulkCreate(usuariosHasheados);

    console.log('Usuarios creados exitosamente');
  } catch (error) {
    console.error('Error al crear usuarios:', error);
  } finally {
    await sequelize.close();
  }
}

seedUsers();