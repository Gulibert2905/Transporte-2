const { FacturaCompra } = require('../models');

exports.crearFacturaCompra = async (req, res) => {
  try {
    const { numero, fecha, proveedor, total, estado } = req.body;
    
    // Verifica que todos los campos requeridos estén presentes
    if (!numero || !fecha || !proveedor || !total || !estado) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }
    
    const facturaCompra = await FacturaCompra.create({
      numero,
      fecha,
      proveedor,
      total,
      estado
    });

    res.status(201).json(facturaCompra);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerFacturasCompra = async (req, res) => {
  try {
    const facturas = await FacturaCompra.findAll();
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
