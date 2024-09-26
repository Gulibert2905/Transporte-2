module.exports = (sequelize, DataTypes) => {
    const NotaContabilidad = sequelize.define('NotaContabilidad', {
      numero: {
        type: DataTypes.STRING,
        unique: true
      },
      fecha: DataTypes.DATE,
      concepto: DataTypes.TEXT,
      total_debito: DataTypes.DECIMAL(10, 2),
      total_credito: DataTypes.DECIMAL(10, 2)
    });
  
    NotaContabilidad.associate = (models) => {
      NotaContabilidad.hasMany(models.DetalleNotaContabilidad);
    };
  
    return NotaContabilidad;
  };