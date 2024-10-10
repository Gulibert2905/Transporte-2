const { ReciboCaja } = require('../models');
const contabilidadService = require('../services/contabilidadService');
const { sequelize } = require('../models');

exports.crearReciboCaja = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { numero, fecha, cliente, concepto, monto } = req.body;

    if (!numero || !fecha || !cliente || !concepto || !monto) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const reciboCaja = await ReciboCaja.create({
      numero,
      fecha,
      cliente,
      concepto,
      monto: parseFloat(monto)
    }, { transaction });

    await contabilidadService.actualizarPorReciboCaja(reciboCaja, transaction);

    await transaction.commit();
    res.status(201).json(reciboCaja);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear recibo de caja:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El número de recibo ya existe' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerRecibosCaja = async (req, res) => {
  try {
    const recibos = await ReciboCaja.findAll();
    res.json(recibos);
  } catch (error) {
    console.error('Error al obtener recibos de caja:', error);
    res.status(500).json({ message: error.message });
  }
};