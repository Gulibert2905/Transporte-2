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
const userRoutes = require('./routes/userRoutes');
const routes = {
  prestadores: require('./routes/prestadoresRoutes'),
  rutas: require('./routes/rutasRoutes'),
  tarifas: require('./routes/tarifasRoutes'),
  viajes: require('./routes/viajesRoutes'),
  reportes: require('./routes/reporteRoutes'),
  dashboard: require('./routes/dashboardRoutes'),
  contabilidad: require('./routes/contabilidadRoutes'),
  nomina: require('./routes/nominaRoutes'),
  comprobanteEgreso: require('./routes/comprobanteEgresoRoutes'),
  reciboCaja: require('./routes/reciboCajaRoutes'),
  facturaCompra: require('./routes/facturaCompraRoutes'),
  notaDebitoCredito: require('./routes/notaDebitoCreditoRoutes'),
  notaContabilidad: require('./routes/notaContabilidadRoutes'),
  cuenta: require('./routes/cuentaRoutes'),
  facturaVenta: require('./routes/facturaRoutes'),
  impuestos: require('./routes/impuestoRoutes'),
  transacciones: require('./routes/transaccionesRoutes')
};

const app = express();

// Middleware básicos
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);


// Rutas de autenticación - Importante: debe ir antes de las otras rutas
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/users', userRoutes); // Rutas de gestión de usuarios
// Otras rutas
Object.entries(routes).forEach(([name, router]) => {
  if (name !== 'auth') { // Evitamos duplicar las rutas de auth
    app.use(`/api/${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`, router);
  }
});

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
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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
      logger.info('- POST /api/login');
      logger.info('- GET /api/validate-token');
    });
  })
  .catch(err => {
    logger.error('Error al conectar con la base de datos:', err);
    process.exit(1);
  });

module.exports = app;