module.exports = (sequelize, DataTypes) => {
    const Empleado = sequelize.define('Empleado', {
      nombre: DataTypes.STRING,
      cargo: DataTypes.STRING,
      salario: DataTypes.DECIMAL(10, 2)
    });
  
    Empleado.associate = (models) => {
      Empleado.hasMany(models.Nomina);
    };
  
    return Empleado;
  };