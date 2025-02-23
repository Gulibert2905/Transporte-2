'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ComprobanteEgresos', 'tipoEgreso', {
      type: Sequelize.ENUM('NOMINA', 'FACTURA_COMPRA', 'OTRO'),
      allowNull: false,
      defaultValue: 'OTRO'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ComprobanteEgresos', 'tipoEgreso');
  }
};