'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ruta extends Model {
    static associate(models) {
      Ruta.hasMany(models.Viaje, { foreignKey: 'ruta_id', as: 'Viajes' });
      Ruta.hasMany(models.Tarifa, { foreignKey: 'ruta_id', as: 'Tarifas' });
      Ruta.belongsToMany(models.Prestador, { through: models.Tarifa, foreignKey: 'ruta_id', otherKey: 'prestador_nit' });
    }
  }
  
  Ruta.init({
    origen: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destino: {
      type: DataTypes.STRING,
      allowNull: false
    },
    distancia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Ruta',
    tableName: 'rutas',
    timestamps: false
  });

  return Ruta;
};