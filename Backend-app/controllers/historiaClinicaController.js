// controllers/historiaClinicaController.js
const { HistoriaClinica, Traslado, Paciente, Usuario } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../services/logger');
const { generarHistoriaClinicaPDF } = require('../services/pdfService');

exports.crearHistoriaClinica = async (req, res) => {
    try {
        const { trasladoId } = req.params;
        const { 
            presion_arterial,
            frecuencia_cardiaca,
            frecuencia_respiratoria,
            temperatura,
            saturacion_oxigeno,
            glasgow,
            motivo_traslado,
            antecedentes,
            condicion_actual,
            medicamentos_actuales,
            procedimientos_realizados,
            oxigeno_suplementario,
            tipo_dispositivo_o2,
            flujo_oxigeno
        } = req.body;

        // Validar campos requeridos
        if (!motivo_traslado || !condicion_actual) {
            return res.status(400).json({
                success: false,
                message: 'El motivo de traslado y la condición actual son requeridos'
            });
        }

        // Verificar si ya existe una historia clínica
        const historiaExistente = await HistoriaClinica.findOne({
            where: { traslado_id: trasladoId }
        });

        if (historiaExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una historia clínica para este traslado'
            });
        }

        // Verificar el traslado
        const traslado = await Traslado.findOne({
            where: { id: trasladoId },
            include: [{
                model: Paciente,
                attributes: ['id', 'nombres', 'apellidos', 'documento']
            }]
        });

        if (!traslado) {
            return res.status(404).json({
                success: false,
                message: 'Traslado no encontrado'
            });
        }

        if (traslado.tipo_servicio !== 'AMBULANCIA') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden crear historias clínicas para traslados en ambulancia'
            });
        }

        // Crear la historia clínica con los campos estructurados
        const historiaClinica = await HistoriaClinica.create({
            traslado_id: trasladoId,
            medico_id: req.user.id, // Asegúrate de que tienes el usuario en el request
            presion_arterial,
            frecuencia_cardiaca,
            frecuencia_respiratoria,
            temperatura,
            saturacion_oxigeno,
            glasgow,
            motivo_traslado,
            antecedentes,
            condicion_actual,
            medicamentos_actuales,
            procedimientos_realizados,
            oxigeno_suplementario: oxigeno_suplementario || false,
            tipo_dispositivo_o2: tipo_dispositivo_o2 || 'NINGUNO',
            flujo_oxigeno,
            fecha_registro: new Date()
        });

        logger.info(`Historia clínica creada para el traslado ${trasladoId} por médico ${req.user.id}`);

        // Actualizar el estado del traslado si es necesario
        await traslado.update({
            estado: 'EN_PROCESO'
        });

        return res.status(201).json({
            success: true,
            data: {
                historiaClinica,
                paciente: traslado.Paciente
            },
            message: 'Historia clínica creada exitosamente'
        });

    } catch (error) {
        logger.error('Error al crear historia clínica:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear la historia clínica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.obtenerHistoriaClinica = async (req, res) => {
    try {
        const { id } = req.params;

        const historiaClinica = await HistoriaClinica.findOne({
            where: { id },
            include: [
                {
                    model: Traslado,
                    as: 'Traslado',
                    include: [
                        {
                            model: Paciente,
                            as: 'Paciente'
                        }
                    ]
                },
                {
                    model: Usuario,
                    as: 'Medico',
                    attributes: ['id', 'nombre_completo']
                },
                {
                    model: Usuario,
                    as: 'Enfermero',
                    attributes: ['id', 'nombre_completo']
                }
            ]
        });

        if (!historiaClinica) {
            return res.status(404).json({
                success: false,
                message: 'Historia clínica no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            data: historiaClinica
        });

    } catch (error) {
        logger.error('Error al obtener historia clínica:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la historia clínica'
        });
    }
};

exports.actualizarHistoriaClinica = async (req, res) => {
    try {
        const { id } = req.params;

        const historiaClinica = await HistoriaClinica.findByPk(id);

        if (!historiaClinica) {
            return res.status(404).json({
                success: false,
                message: 'Historia clínica no encontrada'
            });
        }

        // Solo permitir actualización si el traslado no está finalizado
        const traslado = await Traslado.findByPk(historiaClinica.traslado_id);
        if (traslado.estado === 'FINALIZADO') {
            return res.status(400).json({
                success: false,
                message: 'No se puede modificar la historia clínica de un traslado finalizado'
            });
        }

        await historiaClinica.update(req.body);

        logger.info(`Historia clínica ${id} actualizada`);

        return res.status(200).json({
            success: true,
            data: historiaClinica
        });

    } catch (error) {
        logger.error('Error al actualizar historia clínica:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la historia clínica'
        });
    }
};

exports.listarHistoriasClinicas = async (req, res) => {
    try {
        const { pacienteId, fecha_inicio, fecha_fin } = req.query;
        const where = {
            '$Traslado.tipo_servicio$': 'AMBULANCIA'  // Agregar esta condición
        };


        if (pacienteId) {
            where['$Traslado.paciente_id$'] = pacienteId;
        }

        if (fecha_inicio && fecha_fin) {
            where.fecha_registro = {
                [Op.between]: [fecha_inicio, fecha_fin]
            };
        }

        const historiasClinicas = await HistoriaClinica.findAll({
            where,
            include: [
                {
                    model: Traslado,
                    as: 'Traslado',
                    required: true,  // Inner join para asegurar que solo se traigan traslados en ambulancia
                    include: [
                        {
                            model: Paciente,
                            as: 'Paciente'
                        }
                    ]
                },
                {
                    model: Usuario,
                    as: 'Medico',
                    attributes: ['id', 'nombre_completo']
                },
                {
                    model: Usuario,
                    as: 'Enfermero',
                    attributes: ['id', 'nombre_completo']
                }
            ],
            order: [['fecha_registro', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: historiasClinicas
        });

    } catch (error) {
        logger.error('Error al listar historias clínicas:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las historias clínicas'
        });
    }
};
exports.generarPDF = async (req, res) => {
    try {
        const { id } = req.params;

        const historiaClinica = await HistoriaClinica.findOne({
            where: { id },
            include: [
                {
                    model: Traslado,
                    include: [{ model: Paciente }]
                },
                {
                    model: Usuario,
                    as: 'Medico',
                    attributes: ['id', 'nombre_completo']
                },
                {
                    model: Usuario,
                    as: 'Enfermero',
                    attributes: ['id', 'nombre_completo']
                }
            ]
        });

        if (!historiaClinica) {
            return res.status(404).json({
                success: false,
                message: 'Historia clínica no encontrada'
            });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=historia-clinica-${id}.pdf`);

        generarHistoriaClinicaPDF(historiaClinica, res);

    } catch (error) {
        logger.error('Error al generar PDF:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al generar el PDF'
        });
    }
};

exports.verificarHistoriaClinica = async (req, res) => {
    try {
        const { trasladoId } = req.params;
        const historiaExistente = await HistoriaClinica.findOne({
            where: { traslado_id: trasladoId }
        });
        
        res.json({
            success: true,
            exists: !!historiaExistente,
            historia: historiaExistente
        });
    } catch (error) {
        logger.error('Error verificando historia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar historia clínica'
        });
    }
};