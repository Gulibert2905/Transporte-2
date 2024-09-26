module.exports = (sequelize, DataTypes) => {
  const MovimientoCuenta = sequelize.define('MovimientoCuenta', {
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cuentaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('DEBITO', 'CREDITO'),
      allowNull: false
    },
    TransaccionId: {  // Nota la 'T' mayúscula aquí
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'MovimientosCuenta'
  });

  MovimientoCuenta.associate = (models) => {
    MovimientoCuenta.belongsTo(models.Cuenta, { foreignKey: 'cuentaId' });
    MovimientoCuenta.belongsTo(models.Transaccion, { foreignKey: 'TransaccionId' });  // Nota la 'T' mayúscula aquí
  };

  return MovimientoCuenta;
};