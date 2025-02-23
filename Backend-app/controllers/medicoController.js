// controllers/medicoController.js
const { Usuario, Paciente, HistoriaClinica, Consulta, Traslado } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../services/logger');

const medicoController = {
    // controllers/medicoController.js
    getDashboard: async (req, res) => {
        try {
            // Primero, buscar los traslados en ambulancia pendientes
            const trasladosPendientes = await Traslado.findAll({
                where: {
                    tipo_servicio: 'AMBULANCIA',
                    estado: 'PENDIENTE'
                },
                include: [
                    {
                        model: Paciente,
                        as: 'Paciente',
                        attributes: ['nombres', 'apellidos', 'documento']
                    }
                ]
            });
    
            // Luego, filtrar los que no tienen historia clínica
            const trasladosSinHistoria = await Promise.all(
                trasladosPendientes.map(async (traslado) => {
                    const historia = await HistoriaClinica.findOne({
                        where: { traslado_id: traslado.id }
                    });
                    if (!historia) {
                        return traslado;
                    }
                    return null;
                })
            );
    
            const trasladosFiltrados = trasladosSinHistoria.filter(t => t !== null);
    
            const stats = {
                totalPacientes: await Paciente.count(),
                consultasHoy: await Consulta.count({
                    where: {
                        fecha: {
                            [Op.gte]: new Date().setHours(0,0,0,0),
                            [Op.lt]: new Date().setHours(23,59,59,999)
                        }
                    }
                }),
                pendientes: trasladosFiltrados.length
            };
    
            res.json({
                success: true,
                data: { 
                    stats, 
                    trasladosPendientes: trasladosFiltrados 
                }
            });
        } catch (error) {
            logger.error('Error en getDashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos del dashboard'
            });
        }
    },

    getMisPacientes: async (req, res) => {
        try {
            console.log('ID del médico:', req.user.id);

            const pacientes = await Paciente.findAll({
                where: { medico_id: req.user.id },
                attributes: ['id', 'nombres', 'apellidos', 'documento', 'telefono'],
                raw: true
            });

            console.log('Pacientes encontrados:', pacientes);

            res.json({
                success: true,
                data: pacientes,
                count: pacientes.length
            });
        } catch (error) {
            logger.error('Error en getMisPacientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener lista de pacientes',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    getConsultas: async (req, res) => {
        try {
            const consultas = await Consulta.findAll({
                where: { medicoId: req.user.id },
                include: [{
                    model: Paciente,
                    attributes: ['nombres', 'apellidos']
                }],
                order: [['fecha', 'DESC']]
            });

            res.json({
                success: true,
                data: consultas
            });
        } catch (error) {
            logger.error('Error en getConsultas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener consultas'
            });
        }
    },

    createConsulta: async (req, res) => {
        try {
            const { pacienteId, fecha, motivo, diagnostico, tratamiento } = req.body;

            const consulta = await Consulta.create({
                pacienteId,
                medicoId: req.user.id,
                fecha,
                motivo,
                diagnostico,
                tratamiento
            });

            res.status(201).json({
                success: true,
                data: consulta
            });
        } catch (error) {
            logger.error('Error en createConsulta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear consulta'
            });
        }
    },

    getHistoriaClinica: async (req, res) => {
        try {
            const { pacienteId } = req.params;

            const historiaClinica = await HistoriaClinica.findAll({
                where: { pacienteId },
                include: [{
                    model: Usuario,
                    attributes: ['nombres', 'apellidos']
                }],
                order: [['fecha', 'DESC']]
            });

            res.json({
                success: true,
                data: historiaClinica
            });
        } catch (error) {
            logger.error('Error en getHistoriaClinica:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener historia clínica'
            });
        }
    },

    createHistoriaClinica: async (req, res) => {
        try {
            const { pacienteId } = req.params;
            const { 
                motivo_consulta,
                antecedentes,
                diagnostico,
                tratamiento,
                observaciones 
            } = req.body;

            const historiaClinica = await HistoriaClinica.create({
                pacienteId,
                medicoId: req.user.id,
                fecha: new Date(),
                motivo_consulta,
                antecedentes,
                diagnostico,
                tratamiento,
                observaciones
            });

            res.status(201).json({
                success: true,
                data: historiaClinica
            });
        } catch (error) {
            logger.error('Error en createHistoriaClinica:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear registro de historia clínica'
            });
        }
    }
};

module.exports = medicoController;