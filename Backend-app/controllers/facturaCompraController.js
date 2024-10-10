const { FacturaCompra } = require('../models');
const contabilidadService = require('../services/contabilidadService');
const { sequelize } = require('../models');

exports.crearFacturaCompra = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { numero, fecha, proveedor, total, estado } = req.body;

    if (!numero || !fecha || !proveedor || !total || !estado) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    const facturaCompra = await FacturaCompra.create({
      numero,
      fecha,
      proveedor,
      total,
      estado
    }, { transaction });

    await contabilidadService.actualizarPorFacturaCompra(facturaCompra, transaction);

    await transaction.commit();
    res.status(201).json(facturaCompra);
  } catch (error) {
    await transaction.rollback();
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
