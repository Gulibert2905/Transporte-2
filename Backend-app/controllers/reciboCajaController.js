const { ReciboCaja } = require('../models');
const contabilidadService = require('../services/contabilidadService');
const { sequelize } = require('../models');

exports.crearReciboCaja = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('Iniciando creación de recibo de caja');
    const { numero, fecha, cliente, concepto, monto } = req.body;

    if (!numero || !fecha || !cliente || !concepto || !monto) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const reciboCaja = await ReciboCaja.create({
      numero,
      fecha,
      cliente,
      concepto,
      monto: parseFloat(monto)
    }, { transaction });

    console.log('Recibo de caja creado:', reciboCaja.id);

    console.log('Actualizando contabilidad');
    await contabilidadService.transacciones.actualizarPorReciboCaja(reciboCaja, transaction);

    console.log('Confirmando transacción');
    await transaction.commit();
    res.status(201).json(reciboCaja);
  } catch (error) {
    console.error('Error al crear recibo de caja:', error);
    await transaction.rollback();
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El número de recibo ya existe' });
    }
    res.status(500).json({ 
      message: 'Error al crear recibo de caja', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.obtenerRecibosCaja = async (req, res) => {
  try {
    console.log('Obteniendo recibos de caja');
    const recibos = await ReciboCaja.findAll();
    res.json(recibos);
  } catch (error) {
    console.error('Error al obtener recibos de caja:', error);
    res.status(500).json({ message: 'Error al obtener recibos de caja', error: error.message });
  }
};