const { ComprobanteEgreso, Nomina, FacturaCompra } = require('../models');
const contabilidadService = require('../services/contabilidadService');
const { sequelize } = require('../models');

exports.crearComprobanteEgreso = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { numero, fecha, beneficiario, concepto, monto, nomina_id, factura_compra_id } = req.body;

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
    }, { transaction });

    await contabilidadService.actualizarPorComprobanteEgreso(comprobanteEgreso, transaction);

    await transaction.commit();
    res.status(201).json(comprobanteEgreso);
  } catch (error) {
    await transaction.rollback();
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
    console.error('Error al obtener comprobantes de egreso:', error);
    res.status(500).json({ message: error.message });
  }
};