'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tarifa extends Model {
    static associate(models) {
      // define associations here
      Tarifa.belongsTo(models.Prestador, { foreignKey: 'prestador_nit', as: 'Prestador' });
      Tarifa.belongsTo(models.Ruta, { foreignKey: 'ruta_id', as: 'Ruta' });
    }
  }
  
  Tarifa.init({
    prestador_nit: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'prestadores',
        key: 'nit'
      }
    },
    ruta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rutas',
        key: 'id'
      }
    },
    tarifa: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0  // Asegura que la tarifa sea positiva
      }
    }
  }, {
    sequelize,
    modelName: 'Tarifa',
    tableName: 'tarifas',
    timestamps: false  
  });

  return Tarifa;
};