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
        type: DataTypes.ENUM('admin', 'contador', 'administrativo', 'operador'),
        allowNull: false,
        validate: {
            isIn: [['admin', 'contador', 'administrativo', 'operador']]
        }
    },
    }, {
      tableName: 'usuarios', // Esto es crucial
      timestamps: true // Asegúrate de que esto coincida con tu estructura de tabla
    },{
      
      indexes: [
        {
          unique: true,
          fields: ['username']
        }
      ]
    });
  
    return Usuario;
  };