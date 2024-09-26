module.exports = (sequelize, DataTypes) => {
    const NotaDebitoCredito = sequelize.define('NotaDebitoCredito', {
      numero: {
        type: DataTypes.STRING,
        unique: true
      },
      fecha: DataTypes.DATE,
      tipo: DataTypes.ENUM('DEBITO', 'CREDITO'),
      concepto: DataTypes.TEXT,
      monto: DataTypes.DECIMAL(10, 2)
    });
  
    NotaDebitoCredito.associate = (models) => {
      NotaDebitoCredito.belongsTo(models.FacturaCompra);
    };
  
    return NotaDebitoCredito;
  };