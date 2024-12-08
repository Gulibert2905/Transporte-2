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
    TransaccionId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'MovimientosCuenta'
  });

  MovimientoCuenta.associate = (models) => {
    MovimientoCuenta.belongsTo(models.Cuenta, { foreignKey: 'cuentaId', as: 'cuenta' });
    MovimientoCuenta.belongsTo(models.Transaccion, { 
      foreignKey: 'TransaccionId',
      as: 'transaccion'
    });
  };

  return MovimientoCuenta;
};