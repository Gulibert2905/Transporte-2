const { ReciboCaja } = require('../models');

exports.crearReciboCaja = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);  // Añade este log para depuración
    const { numero, fecha, cliente, concepto, monto } = req.body;

    // Validación básica
    if (!numero || !fecha || !cliente || !concepto || !monto) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const reciboCaja = await ReciboCaja.create({
      numero,
      fecha,
      cliente,
      concepto,
      monto: parseFloat(monto)  // Asegúrate de que monto sea un número
    });

    res.status(201).json(reciboCaja);
  } catch (error) {
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
    res.status(500).json({ message: error.message });
  }
};