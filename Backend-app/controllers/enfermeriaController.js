// controllers/enfermeriaController.js
const { Usuario, Paciente, SignosVitales, NotasEnfermeria, Medicacion } = require('../models');
const { logger } = require('../services/logger');
const { Op } = require('sequelize');

const enfermeriaController = {
    getPacientesAsignados: async (req, res) => {
        try {
            const pacientes = await Paciente.findAll({
                where: { estado: 'activo' },
                attributes: [
                    'id', 
                    'nombre', 
                    'apellido', 
                    'documento', 
                    'fecha_nacimiento',
                    'telefono',
                    'direccion',
                    'estado'
                ],
                include: [{
                    model: SignosVitales,
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                }]
            });

            res.json({
                success: true,
                data: pacientes
            });
        } catch (error) {
            logger.error('Error en getPacientesAsignados:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener lista de pacientes'
            });
        }
    },

    getSignosVitales: async (req, res) => {
        try {
            const { pacienteId } = req.params;
            const signosVitales = await SignosVitales.findAll({
                where: { pacienteId },
                order: [['fecha', 'DESC']],
                include: [{
                    model: Usuario,
                    attributes: ['nombre', 'apellido']
                }]
            });

            res.json({
                success: true,
                data: signosVitales
            });
        } catch (error) {
            logger.error('Error en getSignosVitales:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener signos vitales'
            });
        }
    },

    registrarSignosVitales: async (req, res) => {
        try {
            const { pacienteId } = req.params;
            const {
                presion_arterial,
                frecuencia_cardiaca,
                frecuencia_respiratoria,
                temperatura,
                saturacion_oxigeno,
                glucemia,
                observaciones
            } = req.body;

            const signosVitales = await SignosVitales.create({
                pacienteId,
                enfermeroId: req.user.id,
                fecha: new Date(),
                presion_arterial,
                frecuencia_cardiaca,
                frecuencia_respiratoria,
                temperatura,
                saturacion_oxigeno,
                glucemia,
                observaciones
            });

            res.status(201).json({
                success: true,
                data: signosVitales
            });
        } catch (error) {
            logger.error('Error en registrarSignosVitales:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar signos vitales'
            });
        }
    },

    crearNotaEnfermeria: async (req, res) => {
        try {
            const { pacienteId } = req.params;
            const { nota, tipo_nota } = req.body;

            const notaEnfermeria = await NotasEnfermeria.create({
                pacienteId,
                enfermeroId: req.user.id,
                fecha: new Date(),
                nota,
                tipo_nota
            });

            res.status(201).json({
                success: true,
                data: notaEnfermeria
            });
        } catch (error) {
            logger.error('Error en crearNotaEnfermeria:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear nota de enfermería'
            });
        }
    },

    getNotasEnfermeria: async (req, res) => {
        try {
            const { pacienteId } = req.params;
            const notas = await NotasEnfermeria.findAll({
                where: { pacienteId },
                order: [['fecha', 'DESC']],
                include: [{
                    model: Usuario,
                    attributes: ['nombre', 'apellido']
                }]
            });

            res.json({
                success: true,
                data: notas
            });
        } catch (error) {
            logger.error('Error en getNotasEnfermeria:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener notas de enfermería'
            });
        }
    },

    registrarMedicacion: async (req, res) => {
        try {
            const { pacienteId } = req.params;
            const {
                medicamento,
                dosis,
                via_administracion,
                hora_administracion,
                observaciones
            } = req.body;

            const medicacion = await Medicacion.create({
                pacienteId,
                enfermeroId: req.user.id,
                fecha: new Date(),
                medicamento,
                dosis,
                via_administracion,
                hora_administracion,
                observaciones
            });

            res.status(201).json({
                success: true,
                data: medicacion
            });
        } catch (error) {
            logger.error('Error en registrarMedicacion:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar medicación'
            });
        }
    },

    getMedicaciones: async (req, res) => {
        try {
            const { pacienteId } = req.params;
            const medicaciones = await Medicacion.findAll({
                where: { pacienteId },
                order: [['fecha', 'DESC']],
                include: [{
                    model: Usuario,
                    attributes: ['nombre', 'apellido']
                }]
            });

            res.json({
                success: true,
                data: medicaciones
            });
        } catch (error) {
            logger.error('Error en getMedicaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener registro de medicaciones'
            });
        }
    },

    getDashboardEnfermeria: async (req, res) => {
        try {
            const pacientesActivos = await Paciente.count({
                where: { estado: 'activo' }
            });

            const signosVitalesHoy = await SignosVitales.count({
                where: {
                    fecha: {
                        [Op.gte]: new Date().setHours(0,0,0,0)
                    }
                }
            });

            const medicacionesPendientes = await Medicacion.count({
                where: {
                    estado: 'pendiente',
                    hora_administracion: {
                        [Op.gte]: new Date()
                    }
                }
            });

            res.json({
                success: true,
                data: {
                    pacientesActivos,
                    signosVitalesHoy,
                    medicacionesPendientes
                }
            });
        } catch (error) {
            logger.error('Error en getDashboardEnfermeria:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener dashboard de enfermería'
            });
        }
    }
};

module.exports = enfermeriaController;