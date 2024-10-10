module.exports = (sequelize, DataTypes) => {
  const Factura = sequelize.define('Factura', {
    numero: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cliente: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    impuestos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'PAGADA', 'ANULADA'),
      defaultValue: 'PENDIENTE'
    }
  });

  Factura.associate = (models) => {
    Factura.belongsToMany(models.Impuesto, {
      through: 'FacturaImpuestos',
      as: 'impuestosAplicados'
    });
  };

  return Factura;
};