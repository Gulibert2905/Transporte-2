'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditoriaTraslado extends Model {
    static associate(models) {
      AuditoriaTraslado.belongsTo(models.Traslado, {
        foreignKey: 'traslado_id',
        as: 'Traslado'
      });

      AuditoriaTraslado.belongsTo(models.Usuario, {
        foreignKey: 'auditor_id',
        as: 'Auditor'
      });
    }
  }

  AuditoriaTraslado.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    traslado_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    auditor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_verificacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    estado_anterior: {
      type: DataTypes.ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO')
    },
    estado_nuevo: {
      type: DataTypes.ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO')
    },
    observaciones: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AuditoriaTraslado',
    tableName: 'auditoria_traslados',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return AuditoriaTraslado;
};