// controllers/trasladoController.js
const { Traslado, Paciente, Usuario, Ruta } = require('../models');
const { Op } = require('sequelize');
const excel = require('exceljs');
const formatearFecha = (fecha) => {
    if (!fecha) return '';
    try {
        return new Date(fecha).toLocaleString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return fecha;
    }
};

const formatearMoneda = (valor) => {
    if (!valor) return '$ 0';
    try {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    } catch (error) {
        return `$ ${valor}`;
    }
};

// Mantener los métodos existentes
const trasladoController = {
    getAllTraslados: async (req, res) => {
        try {
            const traslados = await Traslado.findAll({
                include: [{
                    model: Paciente,
                    as: 'Paciente',
                    include: [{
                        model: Usuario,
                        as: 'Operador',
                        attributes: ['id', 'username']
                    }]
                }, {
                    model: Usuario,
                    as: 'Operador',
                    attributes: ['id', 'username']
                }, {
                    model: Usuario,
                    as: 'Auditor',
                    attributes: ['id', 'username']
                }]
            });
            res.json(traslados);
        } catch (error) {
            console.error('Error al obtener traslados:', error);
            res.status(500).json({ message: error.message });
        }
    },

    createTraslado: async (req, res) => {
        try {
            console.log('Datos recibidos:', req.body);

            const {
                paciente_id,
                fecha_solicitud,
                fecha_cita,
                hora_cita,
                direccion_origen,
                direccion_destino,
                prestador_id,
                ruta_id,
                num_pasajeros,
                num_traslados,
                tipo_transporte,
                valor_traslado,
                valor_total
            } = req.body;

            // Obtener la ruta para verificar
            const ruta = await Ruta.findByPk(ruta_id);
            if (!ruta) {
                return res.status(404).json({
                    success: false,
                    message: 'Ruta no encontrada'
                });
            }

            // Crear el traslado con tipo_traslado explícito
            const traslado = await Traslado.create({
                paciente_id,
                fecha_solicitud,
                fecha_cita,
                hora_cita,
                direccion_origen,
                direccion_destino,
                municipio_origen: ruta.origen,
                municipio_destino: ruta.destino,
                prestador_id,
                ruta_id,
                num_pasajeros,
                num_traslados,
                tipo_traslado: 'MUNICIPAL', // o 'TICKET' según corresponda
                tipo_transporte,
                valor_traslado,
                valor_total,
                estado: 'PENDIENTE'
            });

            res.status(201).json({
                success: true,
                message: 'Traslado creado exitosamente',
                data: traslado
            });

        } catch (error) {
            console.error('Error completo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el traslado',
                error: error.message,
                details: error.errors?.map(e => e.message)
            });
        }
    },


    updateTraslado: async (req, res) => {
        try {
            const traslado = await Traslado.findByPk(req.params.id);
            if (traslado) {
                await traslado.update(req.body);
                res.json(traslado);
            } else {
                res.status(404).json({ message: 'Traslado no encontrado' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    deleteTraslado: async (req, res) => {
        try {
            const traslado = await Traslado.findByPk(req.params.id);
            if (traslado) {
                await traslado.destroy();
                res.json({ message: 'Traslado eliminado exitosamente' });
            } else {
                res.status(404).json({ message: 'Traslado no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getPendientesVerificacion: async (req, res) => {
        try {
            const traslados = await Traslado.findAll({
                where: {
                    verificado_auditor: false
                },
                include: [{
                    model: Paciente,
                    as: 'Paciente',
                    attributes: ['nombres', 'apellidos', 'documento']
                }],
                attributes: [
                    'id',
                    'fecha_cita',
                    'municipio_origen',
                    'municipio_destino',
                    'estado',
                    'verificado_auditor'
                ],
                order: [['fecha_cita', 'DESC']]
            });
    
            const trasladosFormateados = traslados.map(t => {
                const traslado = t.get({ plain: true });
                return {
                    ...traslado,
                    paciente_nombre: traslado.Paciente ? 
                        `${traslado.Paciente.nombres} ${traslado.Paciente.apellidos}`.trim() : 
                        'N/A'
                };
            });
    
            res.json(trasladosFormateados);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener traslados pendientes'
            });
        }
    },
    
    verificarTraslado: async (req, res) => {
        try {
            const { id } = req.params;
            const traslado = await Traslado.findByPk(id);
            
            if (!traslado) {
                return res.status(404).json({
                    success: false,
                    message: 'Traslado no encontrado'
                });
            }
    
            await traslado.update({
                verificado_auditor: true,
                fecha_verificacion: new Date(),
                auditor_id: req.user.id
            });
    
            res.json({
                success: true,
                message: 'Traslado verificado exitosamente'
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar el traslado'
            });
        }
    },

    getEstadisticasVerificacion: async (req, res) => {
        try {
            const fecha = new Date();
            const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
            const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

            const estadisticas = {
                total: await Traslado.count(),
                pendientes: await Traslado.count({
                    where: { verificado_auditor: false }
                }),
                verificadosHoy: await Traslado.count({
                    where: {
                        verificado_auditor: true,
                        updatedAt: {
                            [Op.gte]: new Date(new Date().setHours(0,0,0,0))
                        }
                    }
                }),
                montoMensual: await Traslado.sum('valor_total', {
                    where: {
                        fecha_cita: {
                            [Op.between]: [inicioMes, finMes]
                        }
                    }
                }) || 0
            };

            res.json(estadisticas);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getReporteTraslados: async (req, res) => {
        try {
            const { fechaInicio, fechaFin, tipo, estado } = req.query;
            
            let whereCondition = {};
            
            if (fechaInicio && fechaFin) {
                whereCondition.fecha_cita = {
                    [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
                };
            }

            const traslados = await Traslado.findAll({
                where: whereCondition,
                include: [{
                    model: Paciente,
                    as: 'Paciente',
                    attributes: ['nombres', 'apellidos', 'documento']
                }, {
                    model: Usuario,
                    as: 'Auditor',
                    attributes: ['username']
                }],
                order: [['fecha_cita', 'DESC']]
            });

            // Crear workbook y worksheet
            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet('Traslados');

            // Definir columnas
            worksheet.columns = [
                { header: 'Nombres', key: 'nombres', width: 15 },
                { header: 'Apellidos', key: 'apellidos', width: 15 },
                { header: 'Documento', key: 'documento', width: 15 },
                { header: 'Fecha Solicitud', key: 'fecha_solicitud', width: 15 },
                { header: 'Fecha Cita', key: 'fecha_cita', width: 15 },
                { header: 'Hora Cita', key: 'hora_cita', width: 15 },
                { header: 'Origen', key: 'origen', width: 15 },
                { header: 'Destino', key: 'destino', width: 15 },
                { header: 'Estado', key: 'estado', width: 15 },
                { header: 'Verificado', key: 'verificado', width: 15 },
                { header: 'Auditor', key: 'auditor', width: 15 }
            ];

            // Formatear datos
            const trasladosFormateados = traslados.map(t => ({
                nombres: t.Paciente?.nombres || '',
                apellidos: t.Paciente?.apellidos || '',
                documento: t.Paciente?.documento || '',
                fecha_solicitud: t.fecha_solicitud ? new Date(t.fecha_solicitud).toLocaleDateString() : '',
                fecha_cita: t.fecha_cita ? new Date(t.fecha_cita).toLocaleDateString() : '',
                hora_cita: t.hora_cita || '',
                origen: t.municipio_origen || '',
                destino: t.municipio_destino || '',
                estado: t.estado || '',
                verificado: t.verificado_auditor ? 'Sí' : 'No',
                auditor: t.Auditor?.username || ''
            }));

            // Agregar filas
            worksheet.addRows(trasladosFormateados);

            // Configurar respuesta
            res.setHeader(
                'Content-Type', 
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition', 
                'attachment; filename=reporte-traslados.xlsx'
            );

            // Escribir el archivo y enviarlo
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Error al generar reporte:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar el reporte',
                error: error.message
            });
        }
    },

    getPendientesMunicipales: async (req, res) => {
        try {
            const traslados = await Traslado.findAll({
                where: {
                    tipo_traslado: 'MUNICIPAL',
                    estado: 'PENDIENTE',
                    prestador_id: null // aún no asignados
                },
                include: [{
                    model: Paciente,
                    as: 'Paciente',
                    attributes: ['nombres', 'apellidos', 'documento']
                }],
                order: [['fecha_cita', 'ASC']]
            });

            res.json({
                success: true,
                data: traslados
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener traslados municipales pendientes'
            });
        }
    },

    // Método para gestores de tickets
    getPendientesTickets: async (req, res) => {
        try {
            const traslados = await Traslado.findAll({
                where: {
                    tipo_traslado: 'TICKET',
                    estado: 'PENDIENTE',
                    prestador_id: null
                },
                include: [{
                    model: Paciente,
                    as: 'Paciente',
                    attributes: ['nombres', 'apellidos', 'documento']
                }],
                order: [['fecha_cita', 'ASC']]
            });

            res.json({
                success: true,
                data: traslados
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener traslados por ticket pendientes'
            });
        }
    },

    // Método para asignar prestador
    asignarPrestador: async (req, res) => {
        try {
            const { traslado_id, prestador_id, valor_traslado } = req.body;
            
            const traslado = await Traslado.findByPk(traslado_id);
            
            if (!traslado) {
                return res.status(404).json({
                    success: false,
                    message: 'Traslado no encontrado'
                });
            }

            // Actualizar traslado con la información del prestador
            await traslado.update({
                prestador_id,
                valor_traslado,
                valor_total: valor_traslado * traslado.num_traslados,
                estado: 'ASIGNADO'
            });

            res.json({
                success: true,
                message: 'Prestador asignado exitosamente',
                data: traslado
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error al asignar prestador'
            });
        }
    },

    // Método para registrar viáticos
    registrarViaticos: async (req, res) => {
        try {
            const { traslado_id, monto, observacion } = req.body;
            
            const traslado = await Traslado.findByPk(traslado_id);
            
            if (!traslado) {
                return res.status(404).json({
                    success: false,
                    message: 'Traslado no encontrado'
                });
            }

            await traslado.update({
                viaticos_monto: monto,
                viaticos_observacion: observacion,
                verificado_auditor: true,
                fecha_verificacion: new Date(),
                auditor_id: req.user.id
            });

            res.json({
                success: true,
                message: 'Viáticos registrados exitosamente',
                data: traslado
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar viáticos'
            });
        }
    },

    // Método para actualizar traslado urbano
    actualizarTrasladoUrbano: async (req, res) => {
        try {
            const { traslado_id, num_traslados_urbano, valor_urbano } = req.body;
            
            const traslado = await Traslado.findByPk(traslado_id);
            
            if (!traslado) {
                return res.status(404).json({
                    success: false,
                    message: 'Traslado no encontrado'
                });
            }

            const valor_total_urbano = num_traslados_urbano * valor_urbano;

            await traslado.update({
                requiere_urbano: true,
                num_traslados_urbano,
                valor_urbano,
                valor_total_urbano
            });

            res.json({
                success: true,
                message: 'Traslado urbano actualizado exitosamente',
                data: traslado
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar traslado urbano'
            });
        }
    }

    
};
module.exports = trasladoController;