module.exports = (sequelize, DataTypes) => {
  const Cuenta = sequelize.define('Cuenta', {
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      get() {
        const value = this.getDataValue('saldo');
        return value === null ? 0.00 : parseFloat(value);
      },
      set(value) {
        this.setDataValue('saldo', parseFloat(value) || 0.00);
      }
    },
    cuentaPadreId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'Cuenta'
  });

  Cuenta.associate = (models) => {
    Cuenta.hasMany(models.Cuenta, {
      as: 'subcuentas',
      foreignKey: 'cuentaPadreId'
    });
    Cuenta.belongsTo(models.Cuenta, {
      as: 'cuentaPadre',
      foreignKey: 'cuentaPadreId'
    });
    Cuenta.hasMany(models.MovimientoCuenta, { foreignKey: 'cuentaId', as: 'movimientos' });
  };

  return Cuenta;
};