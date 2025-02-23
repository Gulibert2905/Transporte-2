require('dotenv').config({
  path: process.env.NODE_ENV === 'production' 
    ? '.env.production' 
    : '.env.development'
});

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const { logger, requestLogger } = require('./services/logger');
const db = require('./models');
const { authenticateToken, authorize } = require('./middleware/auth');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const prestadoresRoutes = require('./routes/prestadoresRoutes');
const rutasRoutes = require('./routes/rutasRoutes');
const tarifasRoutes = require('./routes/tarifasRoutes');
const viajesRoutes = require('./routes/viajesRoutes');
const reportesRoutes = require('./routes/reporteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const contabilidadRoutes = require('./routes/contabilidadRoutes');
const nominaRoutes = require('./routes/nominaRoutes');
const comprobanteEgresoRoutes = require('./routes/comprobanteEgresoRoutes');
const reciboCajaRoutes = require('./routes/reciboCajaRoutes');
const facturaCompraRoutes = require('./routes/facturaCompraRoutes');
const notaDebitoCreditoRoutes = require('./routes/notaDebitoCreditoRoutes');
const notaContabilidadRoutes = require('./routes/notaContabilidadRoutes');
const cuentaRoutes = require('./routes/cuentaRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const impuestosRoutes = require('./routes/impuestoRoutes');
const transaccionesRoutes = require('./routes/transaccionesRoutes');
const userRoutes = require('./routes/userRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes'); 
const trasladoRoutes = require('./routes/trasladoRoutes');

const app = express();

// Middleware básicos
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(morgan('dev'));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas de contabilidad - agregar authorize para contador y admin
app.use('/api/contabilidad', authenticateToken, authorize('contador', 'admin'), contabilidadRoutes);
app.use('/api/nominas', authenticateToken, authorize('contador', 'admin'), nominaRoutes);
app.use('/api/comprobantes-egreso', authenticateToken, authorize('contador', 'admin'), comprobanteEgresoRoutes);
app.use('/api/recibos-caja', authenticateToken, authorize('contador', 'admin'), reciboCajaRoutes);
app.use('/api/facturas-compra', authenticateToken, authorize('contador', 'admin'), facturaCompraRoutes);
app.use('/api/notas-debito-credito', authenticateToken, authorize('contador', 'admin'), notaDebitoCreditoRoutes);
app.use('/api/notas-contabilidad', authenticateToken, authorize('contador', 'admin'), notaContabilidadRoutes);
app.use('/api/cuenta', authenticateToken, authorize('contador', 'admin'), cuentaRoutes);
app.use('/api/factura-venta', authenticateToken, authorize('contador', 'admin'), facturaRoutes);
app.use('/api/impuestos', authenticateToken, authorize('contador', 'admin'), impuestosRoutes);
app.use('/api/transacciones', authenticateToken, authorize('contador', 'admin'), transaccionesRoutes);

// Rutas generales - mantener solo authenticateToken
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/prestadores', authenticateToken, prestadoresRoutes);
app.use('/api/rutas', authenticateToken, rutasRoutes);
app.use('/api/tarifas', authenticateToken, tarifasRoutes);
app.use('/api/viajes', authenticateToken, viajesRoutes);
app.use('/api/reportes', authenticateToken, reportesRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/pacientes', authenticateToken, pacienteRoutes);
app.use('/api/traslados', authenticateToken, trasladoRoutes);

// Manejador de rutas no encontradas
app.use((req, res) => {
  logger.debug(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({
    error: {
      message: 'Ruta no encontrada',
      path: req.url,
      method: req.method
    }
  });
});


// Manejo de errores
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body
  });

  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message
    }
  });
});

// Inicialización del servidor
const PORT = process.env.PORT || 3000;

db.sequelize.sync({ alter: false })
  .then(() => {
    logger.info('Conexión a la base de datos establecida correctamente.');
    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
      logger.info('Rutas disponibles:');
      logger.info('- POST /api/auth/login');
      logger.info('- GET /api/auth/validate-token');
    });
  })
  .catch(err => {
    logger.error('Error al conectar con la base de datos:', err);
    process.exit(1);
  });

module.exports = app;