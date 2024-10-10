const { sequelize, Factura, Impuesto } = require('../models');
const contabilidadService = require('../services/contabilidadService');

exports.crearFactura = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { numero, fecha, cliente, items, impuestosAplicados = [] } = req.body;

    console.log('Datos recibidos:', JSON.stringify({ numero, fecha, cliente, items, impuestosAplicados }, null, 2));

    // Verificar si ya existe una factura con ese número
    const facturaExistente = await Factura.findOne({ where: { numero } });
    if (facturaExistente) {
      throw new Error('Ya existe una factura con este número');
    }

    // Validar items
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('La factura debe tener al menos un item');
    }

    // Calcular subtotal
    const subtotal = items.reduce((sum, item, index) => {
      console.log(`Procesando item ${index + 1}:`, JSON.stringify(item, null, 2));
      
      if (typeof item !== 'object' || item === null) {
        throw new Error(`El item ${index + 1} no es un objeto válido`);
      }

      const precio = parseFloat(item.precioUnitario);
      const cantidad = parseInt(item.cantidad);

      if (isNaN(precio)) {
        throw new Error(`Precio inválido en el item ${index + 1}: ${item.precioUnitario}`);
      }
      if (isNaN(cantidad)) {
        throw new Error(`Cantidad inválida en el item ${index + 1}: ${item.cantidad}`);
      }

      return sum + (precio * cantidad);
    }, 0);

    console.log('Subtotal calculado:', subtotal);

    let totalImpuestos = 0;
    if (impuestosAplicados.length > 0) {
      // Obtener y calcular impuestos
      const impuestos = await Impuesto.findAll({
        where: { id: impuestosAplicados.map(imp => imp.id) }
      });

      impuestos.forEach(impuesto => {
        const porcentaje = parseFloat(impuesto.porcentaje);
        if (isNaN(porcentaje)) {
          throw new Error(`Porcentaje de impuesto inválido para ${impuesto.nombre}: ${impuesto.porcentaje}`);
        }
        const montoImpuesto = subtotal * (porcentaje / 100);
        totalImpuestos += impuesto.esRetencion ? -montoImpuesto : montoImpuesto;
      });
    }

    console.log('Total impuestos calculado:', totalImpuestos);

    // Calcular total
    const total = subtotal + totalImpuestos;

    console.log('Total calculado:', total);

    // Crear factura
    const factura = await Factura.create({
      numero,
      fecha,
      cliente,
      subtotal,
      impuestos: totalImpuestos,
      total,
      estado: 'PENDIENTE'
    }, { transaction });

    // Asociar impuestos a la factura si existen
    if (impuestosAplicados.length > 0) {
      const impuestos = await Impuesto.findAll({
        where: { id: impuestosAplicados.map(imp => imp.id) }
      });
      await factura.setImpuestosAplicados(impuestos, { transaction });
    }

    // Actualizar contabilidad
    console.log('Factura creada, actualizando contabilidad');
    await contabilidadService.transacciones.actualizarPorFacturaVenta(factura, transaction);
    console.log('Contabilidad actualizada');
    
    // Obtener balance general y estado de resultados actualizados
    const balanceGeneral = await contabilidadService.balanceGeneral.generar(fecha);
    const estadoResultados = await contabilidadService.estadoResultados.generar(fecha, fecha);

    await transaction.commit();

    res.status(201).json({
      factura,
      balanceGeneral,
      estadoResultados
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear factura:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerFacturas = async (req, res) => {
  try {
    const facturas = await Factura.findAll({
      include: [{
        model: Impuesto,
        as: 'impuestosAplicados',
        through: { attributes: [] }
      }]
    });
    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.obtenerFacturaPorId = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id, {
      include: [{
        model: Impuesto,
        as: 'impuestosAplicados',
        through: { attributes: [] }
      }]
    });
    if (factura) {
      res.json(factura);
    } else {
      res.status(404).json({ message: 'Factura no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.actualizarFactura = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const factura = await Factura.findByPk(req.params.id);
    if (!factura) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    const { items, impuestosAplicados, estado } = req.body;

    // Recalcular subtotal si se proporcionan nuevos items
    let subtotal = factura.subtotal;
    if (items) {
      subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }

    // Recalcular impuestos si se proporcionan nuevos impuestos
    let totalImpuestos = factura.impuestos;
    if (impuestosAplicados) {
      const impuestos = await Impuesto.findAll({
        where: { id: impuestosAplicados.map(imp => imp.id) }
      });

      totalImpuestos = 0;
      impuestos.forEach(impuesto => {
        const montoImpuesto = subtotal * (impuesto.porcentaje / 100);
        totalImpuestos += impuesto.esRetencion ? -montoImpuesto : montoImpuesto;
      });

      await factura.setImpuestosAplicados(impuestos, { transaction });
    }

    // Actualizar factura
    await factura.update({
      subtotal,
      impuestos: totalImpuestos,
      total: subtotal + totalImpuestos,
      estado: estado || factura.estado
    }, { transaction });

    // Actualizar contabilidad si el estado cambió a PAGADA
    if (estado === 'PAGADA' && factura.estado !== 'PAGADA') {
      await contabilidadService.actualizarPorFacturaVenta(factura, transaction);
    }

    await transaction.commit();
    res.json(factura);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar factura:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.eliminarFactura = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const factura = await Factura.findByPk(req.params.id);
    if (!factura) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    // Anular la factura en lugar de eliminarla
    await factura.update({ estado: 'ANULADA' }, { transaction });

    // Revertir los efectos contables si la factura estaba pagada
    if (factura.estado === 'PAGADA') {
      await contabilidadService.revertirFacturaVenta(factura, transaction);
    }

    await transaction.commit();
    res.json({ message: 'Factura anulada correctamente' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al anular factura:', error);
    res.status(400).json({ message: error.message });
  }
};