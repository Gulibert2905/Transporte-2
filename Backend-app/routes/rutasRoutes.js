const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');
const { upload, handleMulterError } = require('../middleware/uploadConfig');
const { authenticateToken, authorize } = require('../middleware/auth');

// GET all rutas - removed /rutas from path since it's already prefixed in app.js
router.get('/', 
    authenticateToken,
    authorize('admin', 'contador', 'operador'),
    rutaController.getAllRutas
);

router.post('/', 
    authenticateToken,
    authorize('admin', 'contador'),
    rutaController.createRuta
);

router.post('/import',
    authenticateToken,
    authorize('admin', 'contador'),
    (req, res, next) => {
        upload(req, res, function(err) {
            if (err) {
                console.error('Error en multer:', err);
                return res.status(400).json({
                    message: 'Error al subir el archivo',
                    error: err.message
                });
            }
            rutaController.importFromExcel(req, res, next);
        });
    }
);

router.use(handleMulterError);

module.exports = router;