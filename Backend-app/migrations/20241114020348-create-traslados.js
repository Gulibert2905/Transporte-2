
/** @type {import('sequelize-cli').Migration} */
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Traslados', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      paciente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      fecha_solicitud: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      requiere_acompanante: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      acompanante_tipo_doc: Sequelize.STRING,
      acompanante_documento: Sequelize.STRING,
      acompanante_nombres: Sequelize.STRING,
      fecha_cita: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      hora_cita: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      direccion_origen: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      municipio_origen: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      direccion_destino: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      municipio_destino: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipo_traslado: {
        type: Sequelize.ENUM('MUNICIPAL', 'TICKET'),
        allowNull: false,
      },
      num_pasajeros: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      num_traslados: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      valor_traslado: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      prioridad: {
        type: Sequelize.ENUM('ALTA', 'MEDIA', 'BAJA'),
        defaultValue: 'MEDIA',
      },
      requiere_urbano: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      num_transporte_urbano: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      valor_urbano: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      valor_total_urbano: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      estado: {
        type: Sequelize.ENUM('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'),
        defaultValue: 'PENDIENTE',
      },
      traslado_efectivo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      observaciones: Sequelize.TEXT,
      prestador_id: Sequelize.INTEGER,
      operador_id: Sequelize.INTEGER,
      auditor_id: Sequelize.INTEGER,
      fecha_verificacion: Sequelize.DATE,
      verificado_auditor: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      observaciones_auditoria: Sequelize.TEXT,
      viaticos_monto: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Traslados');
  }
};
