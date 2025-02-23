'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Traslados', 'tipo_traslado', {
      type: Sequelize.ENUM('MUNICIPAL', 'TICKET'),
      allowNull: false,
      defaultValue: 'MUNICIPAL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Traslados', 'tipo_traslado');
  }
};