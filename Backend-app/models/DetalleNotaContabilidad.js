module.exports = (sequelize, DataTypes) => {
    const DetalleNotaContabilidad = sequelize.define('DetalleNotaContabilidad', {
      cuenta_id: DataTypes.INTEGER,
      descripcion: DataTypes.TEXT,
      debito: DataTypes.DECIMAL(10, 2),
      credito: DataTypes.DECIMAL(10, 2)
    });
  
    DetalleNotaContabilidad.associate = (models) => {
      DetalleNotaContabilidad.belongsTo(models.NotaContabilidad);
      DetalleNotaContabilidad.belongsTo(models.Cuenta);
    };
  
    return DetalleNotaContabilidad;
  };