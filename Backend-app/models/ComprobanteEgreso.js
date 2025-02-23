module.exports = (sequelize, DataTypes) => {
  const ComprobanteEgreso = sequelize.define('ComprobanteEgreso', {
    numero: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    beneficiario: {
      type: DataTypes.STRING,
      allowNull: false
    },
    concepto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    tipoEgreso: {
      type: DataTypes.ENUM('NOMINA', 'FACTURA_COMPRA', 'OTRO'),
      allowNull: false
    },
    NominaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Nominas',
        key: 'id'
      }
    },
    FacturaCompraId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'FacturaCompras',
        key: 'id'
      }
    }
  }, {
    tableName: 'ComprobanteEgresos'
  });

  ComprobanteEgreso.associate = (models) => {
    ComprobanteEgreso.belongsTo(models.Nomina, { foreignKey: 'NominaId' });
    ComprobanteEgreso.belongsTo(models.FacturaCompra, { foreignKey: 'FacturaCompraId' });
  };

  return ComprobanteEgreso;
};