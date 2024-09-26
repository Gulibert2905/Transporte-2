const { ComprobanteEgreso, Nomina, FacturaCompra } = require('../models');

exports.crearComprobanteEgreso = async (req, res) => {
  try {
    const { numero, fecha, beneficiario, concepto, monto, nomina_id, factura_compra_id } = req.body;
    
    const comprobanteEgreso = await ComprobanteEgreso.create({
      numero,
      fecha,
      beneficiario,
      concepto,
      monto,
      NominaId: nomina_id,
      FacturaCompraId: factura_compra_id
    });

    res.status(201).json(comprobanteEgreso);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerComprobantesEgreso = async (req, res) => {
  try {
    const comprobantes = await ComprobanteEgreso.findAll({
      include: [
        { model: Nomina, include: ['Empleado'] },
        { model: FacturaCompra }
      ]
    });
    res.json(comprobantes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};