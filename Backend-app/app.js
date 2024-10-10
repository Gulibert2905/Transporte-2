const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
const db = require('./models');


const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
} else {
  app.use(cors({
    origin: 'https://tu-dominio-de-produccion.com'
  }));
}

// Middleware


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Servidor backend funcionando correctamente');
});

// Importar rutas
const prestadoresRoutes = require('./routes/prestadoresRoutes');
const rutasRoutes = require('./routes/rutasRoutes');
const tarifasRoutes = require('./routes/tarifasRoutes');
const viajesRoutes = require('./routes/viajesRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const contabilidadRoutes = require('./routes/contabilidadRoutes');
const nominaRoutes = require('./routes/nominaRoutes');
const comprobanteEgresoRoutes = require('./routes/comprobanteEgresoRoutes');
const reciboCajaRoutes = require('./routes/reciboCajaRoutes');
const facturaCompraRoutes = require('./routes/facturaCompraRoutes');
const notaDebitoCreditoRoutes = require('./routes/notaDebitoCreditoRoutes');
const facturaRoutes = require("./routes/facturaRoutes")
const notaContabilidadRoutes = require('./routes/notaContabilidadRoutes');
const cuentaRoutes = require("./routes/cuentaRoutes")
const transaccionesRoutes = require('./routes/transaccionesRoutes');
const impuestoRoutes = require('./routes/impuestoRoutes');

// Log de modelos cargados
console.log('Modelos cargados:', Object.keys(db));

// Usar rutas
app.use('/api/prestadores', prestadoresRoutes);
app.use('/api/rutas', rutasRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/tarifas', tarifasRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contabilidad', contabilidadRoutes);
app.use('/api/nominas', nominaRoutes);
app.use('/api/comprobantes-egreso', comprobanteEgresoRoutes);
app.use('/api/recibos-caja', reciboCajaRoutes);
app.use('/api/facturas-compra', facturaCompraRoutes);
app.use('/api/notas-debito-credito', notaDebitoCreditoRoutes);
app.use('/api/notas-contabilidad', notaContabilidadRoutes);
app.use("/api/cuenta", cuentaRoutes);
app.use("/api/factura-venta", facturaRoutes);
app.use('/api/impuestos', impuestoRoutes);
app.use('/api', authRoutes);



const PORT = process.env.PORT || 3000;

db.sequelize.sync({ alter: false })
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente.');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
    process.exit(1);
  });

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

module.exports = app;