module.exports = (sequelize, DataTypes) => {
    const SignosVitales = sequelize.define('SignosVitales', {
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
        presion_arterial: {
            type: DataTypes.STRING,
            allowNull: false
        },
        frecuencia_cardiaca: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        frecuencia_respiratoria: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        temperatura: {
            type: DataTypes.DECIMAL(3,1),
            allowNull: false
        },
        saturacion_oxigeno: {
            type: DataTypes.INTEGER
        },
        glucemia: {
            type: DataTypes.INTEGER
        },
        observaciones: {
            type: DataTypes.TEXT
        }
    });

    SignosVitales.associate = (models) => {
        SignosVitales.belongsTo(models.Usuario, { foreignKey: 'enfermeroId' });
        SignosVitales.belongsTo(models.Paciente, { foreignKey: 'pacienteId' });
    };

    return SignosVitales;
};