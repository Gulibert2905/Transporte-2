    module.exports = (sequelize, DataTypes) => {
        const EstadoResultados = sequelize.define('EstadoResultados', {
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            primaryKey: true
        },
        ingresos: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        gastos: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        utilidad: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
        }, {
        tableName: 'EstadoResultados',
        timestamps: true
        });
    
        return EstadoResultados;
    };