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
      type: DataTypes.TEXT,
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  });

  ComprobanteEgreso.associate = (models) => {
    ComprobanteEgreso.belongsTo(models.Nomina);
    ComprobanteEgreso.belongsTo(models.FacturaCompra);
  };

  return ComprobanteEgreso;
};