module.exports = (sequelize, DataTypes) => {
  const Traslado = sequelize.define('Traslado', {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      paciente_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
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
      // Datos del acompañante (opcional)
      requiere_acompanante: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
      },
      acompanante_tipo_doc: DataTypes.STRING,
      acompanante_documento: DataTypes.STRING,
      acompanante_nombres: DataTypes.STRING,
      
      // Datos del traslado
      direccion_origen: {
          type: DataTypes.STRING,
          allowNull: false
      },
      municipio_origen: {
          type: DataTypes.STRING,
          allowNull: false
      },
      direccion_destino: {
          type: DataTypes.STRING,
          allowNull: false
      },
      municipio_destino: {
          type: DataTypes.STRING,
          allowNull: false
      },
      num_pasajeros: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1
      },
      num_traslados: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1
      },
      tipo_transporte: {
          type: DataTypes.ENUM('URBANO', 'RURAL', 'OTRO'),
          allowNull: false
      },
      valor_traslado: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false
      },
      valor_total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false
      },
      estado: {
          type: DataTypes.ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'),
          defaultValue: 'PENDIENTE'
      },
      observaciones: DataTypes.TEXT
  });
  
    Traslado.associate = (models) => {
      Traslado.belongsTo(models.Paciente, {
        foreignKey: 'paciente_id',
        as: 'Paciente'
      });
      Traslado.hasMany(models.AuditoriaTraslado, {
        foreignKey: 'traslado_id',
        as: 'Auditorias'
      });
    };
  
    return Traslado;
  };