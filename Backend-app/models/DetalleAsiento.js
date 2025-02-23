module.exports = (sequelize, DataTypes) => {
    const DetalleAsiento = sequelize.define('DetalleAsiento', {
      cuentaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      debe: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      haber: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      }
    });
  
    DetalleAsiento.associate = (models) => {
      DetalleAsiento.belongsTo(models.LibroDiario, {
        as: 'asiento',
        foreignKey: 'asientoId'
      });
      DetalleAsiento.belongsTo(models.Cuenta, {
        as: 'cuenta',
        foreignKey: 'cuentaId'
      });
    };
  
    return DetalleAsiento;
  };