module.exports = (sequelize, DataTypes) => {
  const Transaccion = sequelize.define('Transaccion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
      
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    referencia: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'Transaccions'
  });

  Transaccion.associate = (models) => {
    Transaccion.hasMany(models.MovimientoCuenta, {
      foreignKey: 'TransaccionId',
      as: 'movimientos'
    });
  }
  return Transaccion;
};