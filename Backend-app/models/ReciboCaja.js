module.exports = (sequelize, DataTypes) => {
  const ReciboCaja = sequelize.define('ReciboCaja', {
    numero: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cliente: {
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

  return ReciboCaja;
};