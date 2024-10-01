const { ComprobanteEgreso, Nomina, FacturaCompra } = require('../models');

exports.crearComprobanteEgreso = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);  // Log para depuración
    const { numero, fecha, beneficiario, concepto, monto, nomina_id, factura_compra_id } = req.body;

    // Validación básica
    if (!numero || !fecha || !beneficiario || !concepto || !monto) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const comprobanteEgreso = await ComprobanteEgreso.create({
      numero,
      fecha,
      beneficiario,
      concepto,
      monto,
      NominaId: nomina_id || null,
      FacturaCompraId: factura_compra_id || null
    });

    res.status(201).json(comprobanteEgreso);
  } catch (error) {
    console.error('Error al crear comprobante de egreso:', error);
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