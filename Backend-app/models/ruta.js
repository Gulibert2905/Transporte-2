'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ruta extends Model {
    static associate(models) {
      // define associations here
      Ruta.hasMany(models.Viaje, {
        foreignKey: 'ruta_id',
        as: 'Viajes'
      });
      Ruta.hasMany(models.Tarifa, {
        foreignKey: 'ruta_id',
        as: 'Tarifas'
      });
    }
  }

  Ruta.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    origen: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true // Asegura que no esté vacío
      }
    },
    destino: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true // Asegura que no esté vacío
      }
    },
    distancia: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        isDecimal: true,  // Asegura que sea un valor decimal
        min: 0  // Asegura que la distancia sea positiva
      }
    }
  }, {
    sequelize,
    modelName: 'Ruta',
    tableName: 'rutas',
    timestamps: false  // Desactiva createdAt y updatedAt
  });

  return Ruta;
};