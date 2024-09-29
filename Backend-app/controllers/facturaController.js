const { Factura } = require('../models');

exports.crearFactura = async (req, res) => {
    try {
      const factura = await Factura.create(req.body);
      res.status(201).json(factura);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  exports.obtenerFacturas = async (req, res) => {
    try {
      const facturas = await Factura.findAll();
      res.json(facturas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };