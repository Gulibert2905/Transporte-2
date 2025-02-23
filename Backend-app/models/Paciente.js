module.exports = (sequelize, DataTypes) => {
    const Paciente = sequelize.define('Paciente', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tipo_documento: {
        type: DataTypes.ENUM('CC', 'TI', 'CE', 'PA'),
        allowNull: false
      },
      documento: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      nombres: DataTypes.STRING,
      apellidos: DataTypes.STRING,
      telefono: DataTypes.STRING,
      regimen: DataTypes.STRING,
      categoria: {
        type: DataTypes.ENUM('FIJO', 'TICKET', 'URBANO'),
        allowNull: false
      },
      operador_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      medico_id: {  // Agregar este campo
        type: DataTypes.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
    });
  
    Paciente.associate = (models) => {
      Paciente.belongsTo(models.Usuario, {
        foreignKey: 'operador_id',
        as: 'Operador'
      });
      Paciente.hasMany(models.Traslado, {
        foreignKey: 'paciente_id',
        as: 'Traslados'
      });
      Paciente.belongsTo(models.Usuario, {
        foreignKey: 'medico_id',
        as: 'Medico'
    });
    };
  
    return Paciente;
  };