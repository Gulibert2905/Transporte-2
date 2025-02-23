module.exports = (sequelize, DataTypes) => {
    const Medicacion = sequelize.define('Medicacion', {
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
        medicamento: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dosis: {
            type: DataTypes.STRING,
            allowNull: false
        },
        via_administracion: {
            type: DataTypes.ENUM('oral', 'intravenosa', 'intramuscular', 'subcutanea', 'otra'),
            allowNull: false
        },
        hora_administracion: {
            type: DataTypes.DATE,
            allowNull: false
        },
        estado: {
            type: DataTypes.ENUM('pendiente', 'administrado', 'cancelado'),
            defaultValue: 'pendiente'
        },
        observaciones: {
            type: DataTypes.TEXT
        }
    });

    Medicacion.associate = (models) => {
        Medicacion.belongsTo(models.Usuario, { foreignKey: 'enfermeroId' });
        Medicacion.belongsTo(models.Paciente, { foreignKey: 'pacienteId' });
    };

    return Medicacion;
};