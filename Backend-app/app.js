const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
const db = require('./models');


const app = express();

// Middleware

app.use(cors());
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
// Log de modelos cargados
console.log('Modelos cargados:', Object.keys(db));

// Usar rutas
app.use('/api/prestadores', prestadoresRoutes);
app.use('/api/rutas', rutasRoutes);
app.use('/api/tarifas', tarifasRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', authRoutes);




const PORT = process.env.PORT || 3000;

db.sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente.');
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
    process.exit(1); // Termina el proceso si hay un error de conexión
  });

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

module.exports = app;