module.exports = (sequelize, DataTypes) => {
    const ReciboCaja = sequelize.define('ReciboCaja', {
      numero: {
        type: DataTypes.STRING,
        unique: true
      },
      fecha: DataTypes.DATE,
      cliente: DataTypes.STRING,
      concepto: DataTypes.TEXT,
      monto: DataTypes.DECIMAL(10, 2)
    });
  
    return ReciboCaja;
  };