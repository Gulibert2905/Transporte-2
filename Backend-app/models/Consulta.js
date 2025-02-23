module.exports = (sequelize, DataTypes) => {
    const Consulta = sequelize.define('Consulta', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pacienteId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        medicoId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false
        },
        motivo: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        diagnostico: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        tratamiento: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });

    Consulta.associate = (models) => {
        Consulta.belongsTo(models.Usuario, { foreignKey: 'medicoId' });
        Consulta.belongsTo(models.Paciente, { foreignKey: 'pacienteId' });
    };

    return Consulta;
};