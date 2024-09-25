module.exports = (sequelize, DataTypes) => {
  const Cuenta = sequelize.define('Cuenta', {
    codigo: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'GASTO'),
      allowNull: false
    },
    saldo: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    }
  });
  return Cuenta;
};