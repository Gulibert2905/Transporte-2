module.exports = (sequelize, DataTypes) => {
  const Factura = sequelize.define('Factura', {
    numero: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cliente: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'PAGADA', 'ANULADA'),
      defaultValue: 'PENDIENTE'
    }
  });
  return Factura;
};