const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { authenticateToken, authorize } = require('../middleware/auth');
const prestadorController = require('../controllers/prestadorController');

// Proteger todas las rutas
router.use(authenticateToken);

// Rutas de lectura - acceso para varios roles
router.get('/', authorize('contador', 'admin', 'operador'), prestadorController.getAllPrestadores);

// Rutas de modificación - solo admin
router.post('/', authorize('admin'), prestadorController.createPrestador);
router.put('/:nit', authorize('admin'), prestadorController.updatePrestador);
router.delete('/:nit', authorize('admin'), prestadorController.deletePrestador);

// Importación - solo admin
router.post('/import', 
    authorize('admin'),
    upload.single('file'), 
    prestadorController.importFromExcel
);

module.exports = router;