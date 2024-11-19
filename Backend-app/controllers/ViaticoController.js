// controllers/ViaticoController.js
const { Viatico, Paciente, Usuario } = require('../models');
const { Op } = require('sequelize');

const ViaticoController = {
  // Crear nuevo viático
  async crear(req, res) {
    try {
      const datos = req.body;
      
      // Validar que el paciente existe
      const paciente = await Paciente.findByPk(datos.paciente_id);
      if (!paciente) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
      }

      // Asignar operador según la categoría del paciente
      if (paciente.categoria === 'FIJO') {
        const operador = await Usuario.findOne({
          where: { rol: 'OPERADOR_FIJO', estado: 'ACTIVO' }
        });
        datos.operador_id = operador?.id;
      } else if (paciente.categoria === 'TICKET') {
        const operador = await Usuario.findOne({
          where: { rol: 'OPERADOR_TICKET', estado: 'ACTIVO' }
        });
        datos.operador_id = operador?.id;
      }

      // Calcular valores totales
      datos.valor_total = datos.valor_pasaje * datos.num_traslados;
      if (datos.transporte_urbano) {
        datos.valor_total_urbano = datos.valor_pasaje_urbano * datos.num_transporte_urbano;
      }

      const viatico = await Viatico.create(datos);
      
      return res.status(201).json(viatico);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al crear viático' });
    }
  },

  // Obtener viáticos según rol
  async listar(req, res) {
    try {
      const { rol, usuario_id } = req.user;
      let where = {};

      // Filtrar según rol
      if (rol === 'OPERADOR_FIJO') {
        where.operador_id = usuario_id;
      } else if (rol === 'OPERADOR_TICKET') {
        where.operador_id = usuario_id;
      }

      // Aplicar filtros adicionales
      if (req.query.fecha_inicio && req.query.fecha_fin) {
        where.fecha_solicitud = {
          [Op.between]: [req.query.fecha_inicio, req.query.fecha_fin]
        };
      }

      if (req.query.estado) {
        where.estado = req.query.estado;
      }

      const viaticos = await Viatico.findAll({
        where,
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'nombres', 'apellidos', 'tipo_documento', 'numero_documento']
          },
          {
            model: Usuario,
            as: 'operador',
            attributes: ['id', 'nombres', 'apellidos']
          }
        ],
        order: [['fecha_solicitud', 'DESC']]
      });

      return res.json(viaticos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al listar viáticos' });
    }
  },

  // Actualizar estado de viático
  async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;

      const viatico = await Viatico.findByPk(id);
      if (!viatico) {
        return res.status(404).json({ message: 'Viático no encontrado' });
      }

      await viatico.update({
        estado,
        observaciones: observaciones || viatico.observaciones
      });

      return res.json(viatico);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al actualizar estado' });
    }
  },

  // Verificar viático (rol auditor)
  async verificar(req, res) {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;

      if (req.user.rol !== 'AUDITOR') {
        return res.status(403).json({ message: 'No autorizado' });
      }

      const viatico = await Viatico.findByPk(id);
      if (!viatico) {
        return res.status(404).json({ message: 'Viático no encontrado' });
      }

      await viatico.update({
        verificado_auditor: true,
        observaciones: observaciones || viatico.observaciones
      });

      return res.json(viatico);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al verificar viático' });
    }
  }
};

module.exports = ViaticoController;