'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('LibroDiarios', 'debe', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: []
    });

    await queryInterface.changeColumn('LibroDiarios', 'haber', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: []
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('LibroDiarios', 'debe', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.changeColumn('LibroDiarios', 'haber', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  }
};