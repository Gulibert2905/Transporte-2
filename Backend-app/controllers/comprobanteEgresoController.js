const { ComprobanteEgreso, Nomina, FacturaCompra } = require('../models');
const contabilidadService = require('../services/contabilidadService');
const { sequelize } = require('../models');

exports.crearComprobanteEgreso = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('Iniciando creación de comprobante de egreso');
    const { numero, fecha, beneficiario, concepto, monto, tipoEgreso, nomina_id, factura_compra_id } = req.body;

    // Validación de campos obligatorios
    if (!numero || !fecha || !beneficiario || !concepto || !monto || !tipoEgreso) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Todos los campos obligatorios son requeridos' });
    }

    let NominaId = null;
    let FacturaCompraId = null;

    // Verificar si la Nomina existe si se proporciona
    if (tipoEgreso === 'NOMINA') {
      if (!nomina_id) {
        await transaction.rollback();
        return res.status(400).json({ message: 'ID de Nómina es requerido para tipo de egreso NOMINA' });
      }
      const nomina = await Nomina.findByPk(nomina_id);
      if (!nomina) {
        await transaction.rollback();
        return res.status(400).json({ message: 'La Nómina especificada no existe' });
      }
      NominaId = nomina_id;
      console.log(`Nómina encontrada: ${NominaId}`);
    }

    // Verificar si la FacturaCompra existe si se proporciona
    if (tipoEgreso === 'FACTURA_COMPRA') {
      if (!factura_compra_id) {
        await transaction.rollback();
        return res.status(400).json({ message: 'ID de Factura de Compra es requerido para tipo de egreso FACTURA_COMPRA' });
      }
      const facturaCompra = await FacturaCompra.findByPk(factura_compra_id);
      if (!facturaCompra) {
        await transaction.rollback();
        return res.status(400).json({ message: 'La Factura de Compra especificada no existe' });
      }
      FacturaCompraId = factura_compra_id;
      console.log(`Factura de Compra encontrada: ${FacturaCompraId}`);
    }

    console.log('Creando comprobante de egreso');
    const comprobanteEgreso = await ComprobanteEgreso.create({
      numero,
      fecha,
      beneficiario,
      concepto,
      monto,
      tipoEgreso,
      NominaId,
      FacturaCompraId
    }, { transaction });

    console.log(`Comprobante de egreso creado: ${comprobanteEgreso.id}`);

    console.log('Actualizando contabilidad');
    await contabilidadService.transacciones.actualizarPorComprobanteEgreso(comprobanteEgreso, transaction);

    console.log('Confirmando transacción');
    await transaction.commit();
    res.status(201).json(comprobanteEgreso);
  } catch (error) {
    console.error('Error al crear comprobante de egreso:', error);
    await transaction.rollback();
    if (error.message.includes('No se encontró la cuenta')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error al crear comprobante de egreso', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

exports.obtenerComprobantesEgreso = async (req, res) => {
  try {
    const comprobantes = await ComprobanteEgreso.findAll({
      include: [
        {
          model: Nomina,
          include: ['Empleado']
        },
        {
          model: FacturaCompra
        }
      ]
    });
    res.json(comprobantes);
  } catch (error) {
    console.error('Error al obtener comprobantes de egreso:', error);
    res.status(500).json({ message: 'Error al obtener comprobantes de egreso', error: error.message });
  }
};



