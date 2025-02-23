// routes/historiaClinica.js
const express = require('express');
const router = express.Router();
const historiaClinicaController = require('../controllers/historiaClinicaController');
const { authorize } = require('../middleware/auth');



// Ruta para crear historia clínica
router.post('/crear/:trasladoId',
    authorize(['medico', 'enfermero']),
    historiaClinicaController.crearHistoriaClinica
);

router.post('/:trasladoId', async (req, res) => {
    try {
        const result = await historiaClinicaController.crearHistoriaClinica(req, res);
        return result;
    } catch (error) {
        console.error('Error en ruta POST /:trasladoId:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud'
        });
    }
});

// Listar historias clínicas
router.get('/', async (req, res) => {
    try {
        const result = await historiaClinicaController.listarHistoriasClinicas(req, res);
        return result;
    } catch (error) {
        console.error('Error en ruta GET /:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud'
        });
    }
});

// Obtener una historia clínica específica
router.get('/:id', 
    authorize('admin', 'medico', 'enfermero', 'auditor'), 
    historiaClinicaController.obtenerHistoriaClinica
);

// Actualizar historia clínica
router.put('/:id', 
    authorize(['admin', 'medico', 'enfermero']), 
    historiaClinicaController.actualizarHistoriaClinica
);

// Generar PDF
router.get('/:id/pdf',
    authorize(['admin', 'medico', 'enfermero', 'auditor']),
    historiaClinicaController.generarPDF
);

router.get('/verificar/:trasladoId',
    authorize(['medico', 'enfermero', 'admin']),
    historiaClinicaController.verificarHistoriaClinica
);

router.get('/verificar/:trasladoId', async (req, res) => {
    try {
        const result = await historiaClinicaController.verificarHistoriaClinica(req, res);
        return result;
    } catch (error) {
        console.error('Error en ruta GET /verificar/:trasladoId:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud'
        });
    }
});

module.exports = router;