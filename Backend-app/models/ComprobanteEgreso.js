module.exports = (sequelize, DataTypes) => {
    const ComprobanteEgreso = sequelize.define('ComprobanteEgreso', {
      numero: {
        type: DataTypes.STRING,
        unique: true
      },
      fecha: DataTypes.DATE,
      beneficiario: DataTypes.STRING,
      concepto: DataTypes.TEXT,
      monto: DataTypes.DECIMAL(10, 2)
    });
  
    ComprobanteEgreso.associate = (models) => {
      ComprobanteEgreso.belongsTo(models.Nomina);
      ComprobanteEgreso.belongsTo(models.FacturaCompra);
    };
  
    return ComprobanteEgreso;
  };