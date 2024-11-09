// controllers/trasladoController.js
const { Traslado, Paciente, Usuario } = require('../models');

exports.getAllTraslados = async (req, res) => {
    try {
        const traslados = await Traslado.findAll({
            include: [{
                model: Paciente,
                as: 'Paciente',
                include: [{
                    model: Usuario,
                    as: 'Operador'
                }]
            }]
        });
        res.json(traslados);
    } catch (error) {
        console.error('Error al obtener traslados:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createTraslado = async (req, res) => {
    try {
        const traslado = await Traslado.create({
            ...req.body,
            valor_total: req.body.valor_traslado * req.body.num_traslados,
            valor_total_urbano: req.body.transporte_urbano ? 
                req.body.valor_urbano * req.body.num_transporte_urbano : 0
        });
        res.status(201).json(traslado);
    } catch (error) {
        console.error('Error al crear traslado:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.updateTraslado = async (req, res) => {
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
};

exports.deleteTraslado = async (req, res) => {
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
};

exports.getPendientesVerificacion = async (req, res) => {
    try {
        const traslados = await Traslado.findAll({
            where: {
                verificado_auditor: false
            },
            include: [{
                model: Paciente,
                as: 'Paciente'
            }]
        });
        res.json(traslados);
    } catch (error) {
        console.error('Error al obtener traslados pendientes:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.verificarTraslado = async (req, res) => {
    try {
        const traslado = await Traslado.findByPk(req.params.id);
        if (!traslado) {
            return res.status(404).json({ message: 'Traslado no encontrado' });
        }

        await traslado.update({
            verificado_auditor: true,
            estado: 'COMPLETADO'
        });

        res.json(traslado);
    } catch (error) {
        console.error('Error al verificar traslado:', error);
        res.status(400).json({ message: error.message });
    }
};