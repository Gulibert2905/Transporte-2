module.exports = (sequelize, DataTypes) => {
  const DetalleFactura = sequelize.define('DetalleFactura', {
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
    // ... otros campos que necesites ...
  });

  DetalleFactura.associate = (models) => {
    DetalleFactura.belongsTo(models.Factura, {
      foreignKey: 'facturaId',
      as: 'factura'
    });
  };

  return DetalleFactura;
};