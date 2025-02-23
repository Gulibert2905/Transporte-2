const { FacturaCompra, sequelize } = require('../models');
const contabilidadService = require('../services/contabilidadService');


exports.crearFacturaCompra = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('Datos recibidos para crear FacturaCompra:', req.body);
    const { numero, fecha, proveedor, total, estado } = req.body;

    // Validaciones
    if (!numero || !fecha || !proveedor || !total) {
      throw new Error('Los campos numero, fecha, proveedor y total son requeridos');
    }

    const totalNumerico = parseFloat(total);
    if (isNaN(totalNumerico) || totalNumerico <= 0) {
      throw new Error('El total debe ser un número positivo');
    }

    // Calcular subtotal e impuestos
    const subtotal = (totalNumerico / 1.19).toFixed(2);
    const impuestos = (totalNumerico - parseFloat(subtotal)).toFixed(2);

    // Crear la factura de compra
    const facturaCompra = await FacturaCompra.create({
      numero,
      fecha,
      proveedor,
      subtotal: parseFloat(subtotal),
      impuestos: parseFloat(impuestos),
      total: totalNumerico,
      estado: estado || 'PENDIENTE'
    }, { transaction });

    console.log('FacturaCompra creada:', facturaCompra.toJSON());

    // Actualizar la contabilidad
    await contabilidadService.transacciones.actualizarPorFacturaCompra(facturaCompra, transaction);

    await transaction.commit();
    console.log('Transacción completada con éxito');

    res.status(201).json(facturaCompra);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear FacturaCompra:', error);
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.obtenerFacturasCompra = async (req, res) => {
  try {
    console.log('Iniciando obtención de facturas de compra');
    const facturas = await FacturaCompra.findAll();
    console.log(`Se encontraron ${facturas.length} facturas de compra`);
    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas de compra:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error al obtener facturas de compra', 
      error: error.message,
      stack: error.stack 
    });
  }
};