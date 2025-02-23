module.exports = (sequelize, DataTypes) => {
  const FacturaCompra = sequelize.define('FacturaCompra', {
    numero: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: true
    },
    proveedor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'PAGADA', 'ANULADA'),
      allowNull: true
    }
  }, {
    tableName: 'FacturaCompras'
  });
  
  FacturaCompra.associate = (models) => {
    // Asegúrate de que estos modelos existan y estén correctamente definidos
    FacturaCompra.hasOne(models.ComprobanteEgreso, {
      foreignKey: 'FacturaCompraId',
      as: 'comprobanteEgreso'
    });
    FacturaCompra.hasMany(models.NotaDebitoCredito, {
      foreignKey: 'FacturaCompraId',
      as: 'notasDebitoCredito'
    });
  };
  
    return FacturaCompra;
  };