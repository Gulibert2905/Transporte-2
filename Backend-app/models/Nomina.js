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
    salario_base: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    deducciones: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    bonificaciones: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    total_pagar: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  });

  Nomina.associate = (models) => {
    Nomina.belongsTo(models.Empleado);
    Nomina.hasOne(models.ComprobanteEgreso);
  };

  return Nomina;
};
   