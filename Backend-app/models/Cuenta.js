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
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    cuentaPadreId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'Cuenta',
    indexes: [
      {
        unique: true,
        fields: ['codigo']
      },
      {
        fields: ['cuentaPadreId']
      }
    ]
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
    Cuenta.hasMany(models.MovimientoCuenta, { 
      foreignKey: 'cuentaId',
      as: 'movimientos'
    });
  };

  return Cuenta;
};