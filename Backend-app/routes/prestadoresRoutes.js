const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { authenticateToken, authorize } = require('../middleware/auth');
const prestadorController = require('../controllers/prestadorController');

// Ruta principal para obtener prestadores - remover /prestadores del path
router.get('/',
    authenticateToken,
    authorize('admin', 'contador', 'operador', 'auditor'),
    prestadorController.getAllPrestadores
);

router.post('/', 
    authenticateToken,
    authorize('admin'), 
    prestadorController.createPrestador
);

router.put('/:nit', 
    authenticateToken,
    authorize('admin'), 
    prestadorController.updatePrestador
);

router.delete('/:nit', 
    authenticateToken,
    authorize('admin'), 
    prestadorController.deletePrestador
);

router.post('/import',
    authenticateToken,
    authorize('admin'),
    upload.single('file'),
    prestadorController.importFromExcel
);

module.exports = router;