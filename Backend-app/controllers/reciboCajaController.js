const { ReciboCaja } = require('../models');

exports.crearReciboCaja = async (req, res) => {
  try {
    const { numero, fecha, cliente, concepto, monto } = req.body;
    
    const reciboCaja = await ReciboCaja.create({
      numero,
      fecha,
      cliente,
      concepto,
      monto
    });

    res.status(201).json(reciboCaja);
  } catch (error) {
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