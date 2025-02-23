'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('Traslados', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      paciente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_solicitud: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      tipo_servicio: {
        type: DataTypes.ENUM('AMBULANCIA', 'BASICO', 'ESPECIAL'),
        allowNull: false,
        defaultValue: 'BASICO'
      },
      requiere_acompanante: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      acompanante_tipo_doc: DataTypes.STRING,
      acompanante_documento: DataTypes.STRING,
      acompanante_nombres: DataTypes.STRING,
      fecha_cita: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      hora_cita: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      direccion_origen: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      municipio_origen: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      direccion_destino: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      municipio_destino: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tipo_traslado: {
        type: DataTypes.ENUM('MUNICIPAL', 'TICKET'),
        allowNull: false,
      },
      num_pasajeros: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      num_traslados: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      valor_traslado: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      valor_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      prioridad: {
        type: DataTypes.ENUM('ALTA', 'MEDIA', 'BAJA'),
        defaultValue: 'MEDIA',
      },
      requiere_urbano: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      num_transporte_urbano: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      valor_urbano: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      valor_total_urbano: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      estado: {
        type: DataTypes.ENUM('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'),
        defaultValue: 'PENDIENTE',
      },
      traslado_efectivo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      observaciones: DataTypes.TEXT,
      prestador_id: DataTypes.INTEGER,
      operador_id: DataTypes.INTEGER,
      auditor_id: DataTypes.INTEGER,
      fecha_verificacion: DataTypes.DATE,
      verificado_auditor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      observaciones_auditoria: DataTypes.TEXT,
      viaticos_monto: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Traslados');
  }
};