'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Prestador extends Model {
    static associate(models) {
      Prestador.hasMany(models.Tarifa, { foreignKey: 'prestador_nit', as: 'Tarifas' });
      Prestador.hasMany(models.Viaje, { foreignKey: 'prestador_nit', as: 'Viajes' });
    }
  }
  
  Prestador.init({
    nit: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contacto: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Prestador',
    tableName: 'prestadores',
    timestamps: false
  });
  return Prestador;
};