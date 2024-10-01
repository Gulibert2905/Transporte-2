  module.exports = (sequelize, DataTypes) => {
    const DetalleNotaContabilidad = sequelize.define('DetalleNotaContabilidad', {
      cuenta_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      descripcion: DataTypes.TEXT,
      debito: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      credito: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      }
    });

    DetalleNotaContabilidad.associate = (models) => {
      DetalleNotaContabilidad.belongsTo(models.NotaContabilidad);
      DetalleNotaContabilidad.belongsTo(models.Cuenta, { foreignKey: 'cuenta_id' });
    };

    return DetalleNotaContabilidad;
  };