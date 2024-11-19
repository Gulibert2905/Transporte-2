// routes/viaticos.js
const express = require('express');
const router = express.Router();
const ViaticoController = require('../controllers/ViaticoController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Rutas protegidas
router.use(verificarToken);

// Crear viático
router.post('/', 
  verificarRol(['ADMIN', 'OPERADOR_FIJO', 'OPERADOR_TICKET']), 
  ViaticoController.crear
);

// Listar viáticos
router.get('/', ViaticoController.listar);

// Actualizar estado
router.patch('/:id/estado',
  verificarRol(['ADMIN', 'OPERADOR_FIJO', 'OPERADOR_TICKET']),
  ViaticoController.actualizarEstado
);

// Verificar viático (solo auditor)
router.patch('/:id/verificar',
  verificarRol(['AUDITOR']),
  ViaticoController.verificar
);

module.exports = router;