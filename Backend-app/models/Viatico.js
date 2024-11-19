// models/Viatico.js
module.exports = (sequelize, DataTypes) => {
    const Viatico = sequelize.define('Viatico', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      paciente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Pacientes',
          key: 'id'
        }
      },
      fecha_solicitud: {
        type: DataTypes.DATE,
        allowNull: false
      },
      fecha_cita: {
        type: DataTypes.DATE,
        allowNull: false
      },
      hora_cita: {
        type: DataTypes.TIME,
        allowNull: false
      },
      tipo_atencion: {
        type: DataTypes.STRING
      },
      necesita_acompanante: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      acompanante_documento: {
        type: DataTypes.STRING
      },
      acompanante_tipo_documento: {
        type: DataTypes.STRING
      },
      acompanante_nombres: {
        type: DataTypes.STRING
      },
      municipio_origen: {
        type: DataTypes.STRING,
        allowNull: false
      },
      direccion_origen: {
        type: DataTypes.STRING,
        allowNull: false
      },
      municipio_destino: {
        type: DataTypes.STRING,
        allowNull: false
      },
      direccion_destino: {
        type: DataTypes.STRING,
        allowNull: false
      },
      num_pasajeros: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      num_traslados: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      mes: {
        type: DataTypes.STRING
      },
      valor_pasaje: {
        type: DataTypes.DECIMAL(10, 2)
      },
      valor_total: {
        type: DataTypes.DECIMAL(10, 2)
      },
      prioridad: {
        type: DataTypes.ENUM('ALTA', 'MEDIA', 'BAJA'),
        defaultValue: 'MEDIA'
      },
      transporte_urbano: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      num_transporte_urbano: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      valor_pasaje_urbano: {
        type: DataTypes.DECIMAL(10, 2)
      },
      valor_total_urbano: {
        type: DataTypes.DECIMAL(10, 2)
      },
      observaciones: {
        type: DataTypes.TEXT
      },
      estado: {
        type: DataTypes.ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'EFECTUADO'),
        defaultValue: 'PENDIENTE'
      },
      verificado_auditor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      operador_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      }
    }, {
      tableName: 'viaticos',
      timestamps: true
    });
  
    Viatico.associate = (models) => {
      Viatico.belongsTo(models.Paciente, {
        foreignKey: 'paciente_id',
        as: 'Paciente'
      });
      Viatico.belongsTo(models.Usuario, {
        foreignKey: 'operador_id',
        as: 'Operador'
      });
    };
  
    return Viatico;
  };