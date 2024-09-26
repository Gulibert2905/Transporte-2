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
    tableName: 'Transaccions' // Nota que usamos el nombre exacto de la tabla
  });

  Transaccion.associate = (models) => {
    Transaccion.hasMany(models.MovimientoCuenta, { as: 'movimientos' });
    Transaccion.hasMany(models.MovimientoCuenta, { foreignKey: 'TransaccionId' });
  };

  return Transaccion;
};