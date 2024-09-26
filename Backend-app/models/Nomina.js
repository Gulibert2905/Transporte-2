// models/Nomina.js
module.exports = (sequelize, DataTypes) => {
    const Nomina = sequelize.define('Nomina', {
      empleado_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      periodo: {
        type: DataTypes.DATE,
        allowNull: false
      },
      salario_base: DataTypes.DECIMAL(10, 2),
      deducciones: DataTypes.DECIMAL(10, 2),
      bonificaciones: DataTypes.DECIMAL(10, 2),
      total_pagar: DataTypes.DECIMAL(10, 2)
    });
  
    Nomina.associate = (models) => {
      Nomina.belongsTo(models.Empleado);
      Nomina.hasOne(models.ComprobanteEgreso);
    };
  
    return Nomina;
  };
  
   