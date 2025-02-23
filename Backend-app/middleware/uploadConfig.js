const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // límite de 5MB
  }
}).single('file');

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: 'Error al subir el archivo',
      error: err.message
    });
  }
  next(err);
};

module.exports = {
  upload,
  handleMulterError
};