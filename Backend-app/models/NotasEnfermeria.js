module.exports = (sequelize, DataTypes) => {
    const NotasEnfermeria = sequelize.define('NotasEnfermeria', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pacienteId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        enfermeroId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false
        },
        nota: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        tipo_nota: {
            type: DataTypes.ENUM('evolucion', 'procedimiento', 'observacion'),
            allowNull: false
        }
    });

    NotasEnfermeria.associate = (models) => {
        NotasEnfermeria.belongsTo(models.Usuario, { foreignKey: 'enfermeroId' });
        NotasEnfermeria.belongsTo(models.Paciente, { foreignKey: 'pacienteId' });
    };

    return NotasEnfermeria;
};