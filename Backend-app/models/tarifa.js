'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tarifa extends Model {
    static associate(models) {
      Tarifa.belongsTo(models.Prestador, { 
        foreignKey: 'prestador_nit', 
        as: 'Prestador' 
      });
      Tarifa.belongsTo(models.Ruta, { 
        foreignKey: 'ruta_id', 
        as: 'Ruta' 
      });
    }
  }

  Tarifa.init({
    prestador_nit: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,  // Añadido primaryKey
      references: {
        model: 'prestadores',
        key: 'nit'
      }
    },
    ruta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,  // Añadido primaryKey
      references: {
        model: 'rutas',
        key: 'id'
      }
    },
    tarifa: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
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