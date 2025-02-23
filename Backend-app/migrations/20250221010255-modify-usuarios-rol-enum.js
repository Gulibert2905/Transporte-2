'use strict';

module.exports = {
  async up(queryInterface) {
    try {
      // 1. Crear tabla temporal
      await queryInterface.sequelize.query(`
        CREATE TABLE usuarios_temp LIKE usuarios;
      `);

      // 2. Copiar datos a la tabla temporal
      await queryInterface.sequelize.query(`
        INSERT INTO usuarios_temp SELECT * FROM usuarios;
      `);

      // 3. Modificar la columna rol en la tabla original
      await queryInterface.sequelize.query(`
        ALTER TABLE usuarios 
        MODIFY COLUMN rol ENUM(
          'admin', 
          'contador', 
          'administrativo', 
          'operador', 
          'auditor', 
          'medico', 
          'enfermero'
        ) NOT NULL;
      `);

      // 4. Eliminar datos de la tabla original
      await queryInterface.sequelize.query(`
        DELETE FROM usuarios;
      `);

      // 5. Copiar los datos de vuelta
      await queryInterface.sequelize.query(`
        INSERT INTO usuarios SELECT * FROM usuarios_temp;
      `);

      // 6. Eliminar tabla temporal
      await queryInterface.sequelize.query(`
        DROP TABLE usuarios_temp;
      `);

      return Promise.resolve();
    } catch (error) {
      // En caso de error, intentar limpiar la tabla temporal
      try {
        await queryInterface.sequelize.query(`
          DROP TABLE IF EXISTS usuarios_temp;
        `);
      } catch (cleanupError) {
        console.error('Error durante la limpieza:', cleanupError);
      }
      return Promise.reject(error);
    }
  },

  async down(queryInterface) {
    try {
      // 1. Crear tabla temporal
      await queryInterface.sequelize.query(`
        CREATE TABLE usuarios_temp LIKE usuarios;
      `);

      // 2. Copiar datos a la tabla temporal
      await queryInterface.sequelize.query(`
        INSERT INTO usuarios_temp SELECT * FROM usuarios;
      `);

      // 3. Revertir la columna rol a su estado original
      await queryInterface.sequelize.query(`
        ALTER TABLE usuarios 
        MODIFY COLUMN rol ENUM(
          'admin', 
          'contador', 
          'administrativo', 
          'operador', 
          'auditor'
        ) NOT NULL;
      `);

      // 4. Eliminar datos de la tabla original
      await queryInterface.sequelize.query(`
        DELETE FROM usuarios;
      `);

      // 5. Copiar los datos de vuelta
      await queryInterface.sequelize.query(`
        INSERT INTO usuarios SELECT * FROM usuarios_temp;
      `);

      // 6. Eliminar tabla temporal
      await queryInterface.sequelize.query(`
        DROP TABLE usuarios_temp;
      `);

      return Promise.resolve();
    } catch (error) {
      // En caso de error, intentar limpiar la tabla temporal
      try {
        await queryInterface.sequelize.query(`
          DROP TABLE IF EXISTS usuarios_temp;
        `);
      } catch (cleanupError) {
        console.error('Error durante la limpieza:', cleanupError);
      }
      return Promise.reject(error);
    }
  }
};