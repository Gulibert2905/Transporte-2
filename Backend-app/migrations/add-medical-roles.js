'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Primero eliminamos la restricción ENUM existente
    await queryInterface.sequelize.query('ALTER TABLE usuarios DROP CONSTRAINT usuarios_rol_check;');

    // Luego añadimos la nueva restricción ENUM con los nuevos valores
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check CHECK (
        rol IN ('admin', 'contador', 'administrativo', 'operador', 'auditor', 'Medico', 'Enfermero')
      );
    `);
  },

  async down(queryInterface) {
    // Revertir los cambios
    await queryInterface.sequelize.query('ALTER TABLE usuarios DROP CONSTRAINT usuarios_rol_check;');
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check CHECK (
        rol IN ('admin', 'contador', 'administrativo', 'operador', 'auditor')
      );
    `);
  }
};