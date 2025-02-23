'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Crear una tabla temporal
      await queryInterface.sequelize.query(`
        CREATE TABLE usuarios_temp LIKE usuarios;
        INSERT INTO usuarios_temp SELECT * FROM usuarios;
      `);

      // Modificar la columna rol en la tabla original
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

      // Copiar los datos de vuelta
      await queryInterface.sequelize.query(`
        INSERT INTO usuarios SELECT * FROM usuarios_temp;
        DROP TABLE usuarios_temp;
      `);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Crear una tabla temporal
      await queryInterface.sequelize.query(`
        CREATE TABLE usuarios_temp LIKE usuarios;
        INSERT INTO usuarios_temp SELECT * FROM usuarios;
      `);

      // Revertir la columna rol a su estado original
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

      // Copiar los datos de vuelta
      await queryInterface.sequelize.query(`
        INSERT INTO usuarios SELECT * FROM usuarios_temp;
        DROP TABLE usuarios_temp;
      `);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};