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

const app = express();

// Middleware básicos
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api/users', userRoutes);
app.use('/api/prestadores', prestadoresRoutes);
app.use('/api/rutas', rutasRoutes);
app.use('/api/tarifas', tarifasRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contabilidad', contabilidadRoutes);
app.use('/api/nominas', nominaRoutes);
app.use('/api/comprobantes-egreso', comprobanteEgresoRoutes);
app.use('/api/recibos-caja', reciboCajaRoutes);
app.use('/api/facturas-compra', facturaCompraRoutes);
app.use('/api/notas-debito-credito', notaDebitoCreditoRoutes);
app.use('/api/notas-contabilidad', notaContabilidadRoutes);
app.use('/api/cuenta', cuentaRoutes);
app.use('/api/factura-venta', facturaRoutes);
app.use('/api/impuestos', impuestosRoutes);
app.use('/api/transacciones', transaccionesRoutes);

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