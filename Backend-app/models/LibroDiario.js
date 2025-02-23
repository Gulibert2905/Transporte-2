module.exports = (sequelize, DataTypes) => {
  const LibroDiario = sequelize.define('LibroDiario', {
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    debe: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    haber: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    }
  }, {
    tableName: 'LibroDiarios'
  });

  LibroDiario.associate = (models) => {
    LibroDiario.belongsTo(models.Factura, {
      foreignKey: 'facturaId',
      as: 'factura'
    });
  };

  return LibroDiario;
};