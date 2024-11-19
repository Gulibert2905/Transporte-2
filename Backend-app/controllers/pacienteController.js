// controllers/pacienteController.js
const { Paciente, Usuario } = require('../models');
const xlsx = require('xlsx');

const pacienteController = {
    // Obtener todos los pacientes
    getAllPacientes: async (req, res) => {
        try {
            const pacientes = await Paciente.findAll({
                include: [{
                    model: Usuario,
                    as: 'Operador',
                    attributes: ['id', 'username'],
                }]
            });
            
            res.json({
                pacientes,
                currentPage: 1,
                totalPages: 1,
                totalItems: pacientes.length
            });
        } catch (error) {
            console.error('Error al obtener pacientes:', error);
            res.status(500).json({ 
                message: error.message,
                detail: error.original?.sqlMessage 
            });
        }
    },

    // Crear nuevo paciente
    createPaciente: async (req, res) => {
        try {
            const paciente = await Paciente.create(req.body);
            res.status(201).json(paciente);
        } catch (error) {
            console.error('Error al crear paciente:', error);
            res.status(400).json({ message: error.message });
        }
    },

    // Actualizar paciente
    updatePaciente: async (req, res) => {
        try {
            const paciente = await Paciente.findByPk(req.params.id);
            if (paciente) {
                await paciente.update(req.body);
                res.json(paciente);
            } else {
                res.status(404).json({ message: 'Paciente no encontrado' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Eliminar paciente
    deletePaciente: async (req, res) => {
        try {
            const paciente = await Paciente.findByPk(req.params.id);
            if (paciente) {
                await paciente.destroy();
                res.json({ message: 'Paciente eliminado exitosamente' });
            } else {
                res.status(404).json({ message: 'Paciente no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Buscar paciente por documento
    buscarPorDocumento: async (req, res) => {
        try {
            const { documento } = req.params;
            const paciente = await Paciente.findOne({
                where: { documento },
                include: [{
                    model: Usuario,
                    as: 'Operador',
                    attributes: ['id', 'username']
                }]
            });

            if (!paciente) {
                return res.status(404).json({
                    success: false,
                    message: 'Paciente no encontrado'
                });
            }

            res.json({
                success: true,
                paciente
            });
        } catch (error) {
            console.error('Error buscando paciente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar paciente'
            });
        }
    },

    // Importar pacientes desde Excel
    importarPacientes: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó ningún archivo'
                });
            }

            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(worksheet);

            const requiredColumns = ['tipo_documento', 'documento', 'nombres', 'apellidos', 'telefono', 'categoria'];
            const firstRow = data[0];

            const missingColumns = requiredColumns.filter(col => !(col in firstRow));
            if (missingColumns.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Faltan columnas requeridas: ${missingColumns.join(', ')}`
                });
            }

            const pacientesCreados = await Paciente.bulkCreate(data, {
                updateOnDuplicate: ['nombres', 'apellidos', 'telefono', 'categoria'],
                validate: true
            });

            res.json({
                success: true,
                message: `${pacientesCreados.length} pacientes importados exitosamente`,
                pacientes: pacientesCreados
            });

        } catch (error) {
            console.error('Error importando pacientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al importar pacientes',
                error: error.message
            });
        }
    }
};

module.exports = pacienteController;