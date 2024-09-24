'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Viaje extends Model {
    static associate(models) {
      Viaje.belongsTo(models.Prestador, {
        foreignKey: 'prestador_nit',
        as: 'Prestador'
      });
      Viaje.belongsTo(models.Ruta, {
        foreignKey: 'ruta_id',
        as: 'Ruta'
      });
    }
  }

  Viaje.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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
    fecha_viaje: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true  // Valida que el campo sea una fecha
      }
    },
    tarifa_aplicada: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0   // Valida que la tarifa sea mayor o igual a 0
      }
    }
  }, {
    sequelize,
    modelName: 'Viaje',
    tableName: 'viajes',
    timestamps: false  // Esto desactiva createdAt y updatedAt
  });

  return Viaje;
};

