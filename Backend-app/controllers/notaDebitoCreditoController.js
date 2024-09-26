const { NotaDebitoCredito, FacturaCompra } = require('../models');

exports.crearNotaDebitoCredito = async (req, res) => {
  try {
    const { numero, fecha, tipo, concepto, monto, factura_compra_id } = req.body;
    
    const notaDebitoCredito = await NotaDebitoCredito.create({
      numero,
      fecha,
      tipo,
      concepto,
      monto,
      FacturaCompraId: factura_compra_id
    });

    res.status(201).json(notaDebitoCredito);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerNotasDebitoCredito = async (req, res) => {
  try {
    const notas = await NotaDebitoCredito.findAll({
      include: [{ model: FacturaCompra }]
    });
    res.json(notas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
