module.exports = (sequelize, DataTypes) => {
    const LibroDiario = sequelize.define('LibroDiario', {
      fecha: {
        type: DataTypes.DATE,
        allowNull: false
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false
      },
      debe: {
        type: DataTypes.JSON,
        allowNull: false
      },
      haber: {
        type: DataTypes.JSON,
        allowNull: false
      }
    });
  
    LibroDiario.associate = (models) => {
      LibroDiario.belongsTo(models.Factura, {
        foreignKey: 'facturaId',
        as: 'factura'
      });
    };
  
    return LibroDiario;
  };