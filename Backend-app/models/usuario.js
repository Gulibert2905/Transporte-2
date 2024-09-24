module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rol: {
        type: DataTypes.ENUM('admin', 'contador', 'administrativo'),
        allowNull: false
      }
    }, {
      tableName: 'usuarios', // Esto es crucial
      timestamps: true // Asegúrate de que esto coincida con tu estructura de tabla
    });
  
    return Usuario;
  };