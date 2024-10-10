module.exports = (sequelize, DataTypes) => {
    const Impuesto = sequelize.define('Impuesto', {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
      },
      esRetencion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    });
  
    Impuesto.associate = (models) => {
      Impuesto.belongsToMany(models.Factura, {
        through: 'FacturaImpuestos',
        as: 'facturasAplicadas'
      });
    };
  
    return Impuesto;
  };