// models/HistoriaClinica.js
module.exports = (sequelize, DataTypes) => {
    const HistoriaClinica = sequelize.define('HistoriaClinica', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        traslado_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Traslados',
                key: 'id'
            }
        },
        // Datos vitales
        presion_arterial: {
            type: DataTypes.STRING,
            allowNull: true
        },
        frecuencia_cardiaca: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        frecuencia_respiratoria: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        temperatura: {
            type: DataTypes.DECIMAL(4,1),
            allowNull: true
        },
        saturacion_oxigeno: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        glasgow: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        // Información clínica
        motivo_traslado: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        antecedentes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        condicion_actual: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        medicamentos_actuales: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        procedimientos_realizados: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Control de oxígeno y dispositivos
        oxigeno_suplementario: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        tipo_dispositivo_o2: {
            type: DataTypes.ENUM('NINGUNO', 'CANULA_NASAL', 'MASCARA_SIMPLE', 'MASCARA_RESERVORIO', 'VENTILADOR'),
            defaultValue: 'NINGUNO'
        },
        flujo_oxigeno: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Responsables
        medico_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        enfermero_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        // Control y estado
        estado_llegada: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        complicaciones: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        fecha_registro: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    HistoriaClinica.associate = (models) => {
        HistoriaClinica.belongsTo(models.Traslado, {
            foreignKey: 'traslado_id',
            as: 'Traslado' 
        });
        HistoriaClinica.belongsTo(models.Usuario, {
            foreignKey: 'medico_id',
            as: 'Medico'
        });
        HistoriaClinica.belongsTo(models.Usuario, {
            foreignKey: 'enfermero_id',
            as: 'Enfermero'
        });
    };

    return HistoriaClinica;
};