module.exports = (sequelize, DataTypes) => {
    const Transaccion = sequelize.define('Transaccion', {
      fecha: {
        type: DataTypes.DATE,
        allowNull: false
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false
      },
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      tipo: {
        type: DataTypes.ENUM('DEBITO', 'CREDITO'),
        allowNull: false
      }
    });
    return Transaccion;
  };