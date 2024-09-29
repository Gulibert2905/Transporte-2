module.exports = (sequelize, DataTypes) => {
  const Transaccion = sequelize.define('Transaccion', {
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
      as: 'movimientos',
      foreignKey: 'TransaccionId'
    });
  };

  return Transaccion;
};