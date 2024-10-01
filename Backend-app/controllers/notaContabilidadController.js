const { NotaContabilidad, DetalleNotaContabilidad, Cuenta } = require('../models');

exports.crearNotaContabilidad = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { numero, fecha, concepto, detalles } = req.body;
    
    console.log('Datos recibidos:', { numero, fecha, concepto, detalles });

    // Validaciones
    if (!numero || !fecha || !concepto || !detalles || detalles.length < 2) {
      await t.rollback();
      return res.status(400).json({ message: 'Todos los campos son requeridos y debe haber al menos dos detalles' });
    }

    const totalDebito = detalles.reduce((sum, d) => sum + parseFloat(d.debito || 0), 0);
    const totalCredito = detalles.reduce((sum, d) => sum + parseFloat(d.credito || 0), 0);

    console.log('Totales calculados:', { totalDebito, totalCredito });

    if (Math.abs(totalDebito - totalCredito) > 0.001) {
      await t.rollback();
      return res.status(400).json({ message: 'El total de débitos debe ser igual al total de créditos' });
    }

    const notaContabilidad = await NotaContabilidad.create({
      numero,
      fecha,
      concepto,
      total_debito: totalDebito,
      total_credito: totalCredito
    }, { transaction: t });

    console.log('Nota de contabilidad creada:', notaContabilidad);

    for (let detalle of detalles) {
      console.log('Creando detalle:', detalle);
      await DetalleNotaContabilidad.create({
        cuenta_id: detalle.cuenta_id,
        descripcion: detalle.descripcion || '',
        debito: parseFloat(detalle.debito || 0),
        credito: parseFloat(detalle.credito || 0),
        NotaContabilidadId: notaContabilidad.id
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json(notaContabilidad);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear nota de contabilidad:', error);
    res.status(500).json({ message: 'Error al crear la nota de contabilidad', error: error.message });
  }
};
exports.obtenerNotasContabilidad = async (req, res) => {
  try {
    const notas = await NotaContabilidad.findAll({
      include: [{
        model: DetalleNotaContabilidad,
        include: [{ model: Cuenta }]
      }]
    });
    res.json(notas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};