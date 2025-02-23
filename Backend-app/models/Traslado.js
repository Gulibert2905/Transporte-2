module.exports = (sequelize, DataTypes) => {
    const Traslado = sequelize.define('Traslado', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        fecha_solicitud: {
            type: DataTypes.DATE,
            allowNull: true
        },
        fecha_cita: {
            type: DataTypes.DATE,
            allowNull: true
        },
        hora_cita: {
            type: DataTypes.TIME,
            allowNull: true
        },
        requiere_acompanante: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        acompanante_tipo_doc: DataTypes.STRING,
        acompanante_documento: DataTypes.STRING,
        acompanante_nombres: DataTypes.STRING,
        direccion_origen: DataTypes.STRING,
        municipio_origen: DataTypes.STRING,
        direccion_destino: DataTypes.STRING,
        municipio_destino: DataTypes.STRING,
        num_pasajeros: DataTypes.INTEGER,
        num_traslados: DataTypes.INTEGER,
        valor_traslado: DataTypes.DECIMAL(10,2),
        valor_total: DataTypes.DECIMAL(10,2),
        tipo_transporte: {
            type: DataTypes.ENUM('URBANO','RURAL','OTRO')
        },
        prioridad: DataTypes.STRING,
        transporte_urbano: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        num_transporte_urbano: DataTypes.INTEGER,
        valor_urbano: DataTypes.DECIMAL(10,2),
        valor_total_urbano: DataTypes.DECIMAL(10,2),
        observaciones: DataTypes.TEXT,
        estado: {
            type: DataTypes.ENUM('PENDIENTE','EN_PROCESO','COMPLETADO','CANCELADO'),
            defaultValue: 'PENDIENTE'
        },
        efectivo: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verificado_auditor: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        mes: DataTypes.STRING,
        fecha_verificacion: DataTypes.DATE,
        observaciones_auditoria: DataTypes.TEXT,
        auditor_id: DataTypes.INTEGER,
        operador_id: DataTypes.INTEGER,
        tipo_traslado: {
            type: DataTypes.ENUM('MUNICIPAL','TICKET'),
            defaultValue: 'MUNICIPAL'
        },
        requiere_urbano: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        traslado_efectivo: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        prestador_id: DataTypes.STRING(20),
        viaticos_monto: {
            type: DataTypes.DECIMAL(10,2),
            defaultValue: 0.00
        }
    });

    Traslado.associate = (models) => {
        Traslado.belongsTo(models.Paciente, {
            foreignKey: 'paciente_id',
            as: 'Paciente'
        });
        Traslado.belongsTo(models.Prestador, {
            foreignKey: 'prestador_id',
            as: 'Prestador'
        });
        Traslado.belongsTo(models.Usuario, {
            foreignKey: 'operador_id',
            as: 'Operador'
        });
        Traslado.belongsTo(models.Usuario, {
            foreignKey: 'auditor_id',
            as: 'Auditor'
        });
    };

    return Traslado;
};