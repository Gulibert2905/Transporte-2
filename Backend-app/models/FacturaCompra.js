module.exports = (sequelize, DataTypes) => {
    const FacturaCompra = sequelize.define('FacturaCompra', {
      numero: {
        type: DataTypes.STRING,
        unique: true
      },
      fecha: DataTypes.DATE,
      proveedor: DataTypes.STRING,
      total: DataTypes.DECIMAL(10, 2),
      estado: DataTypes.ENUM('PENDIENTE', 'PAGADA', 'ANULADA')
    });
  
    FacturaCompra.associate = (models) => {
      FacturaCompra.hasOne(models.ComprobanteEgreso);
      FacturaCompra.hasMany(models.NotaDebitoCredito);
    };
  
    return FacturaCompra;
  };