const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');
const { upload, handleMulterError } = require('../middleware/uploadConfig');


router.get('/', rutaController.getAllRutas);
router.post('/', rutaController.createRuta);

router.post('/import', (req, res, next) => {
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
  });
  
  router.use(handleMulterError);

module.exports = router;