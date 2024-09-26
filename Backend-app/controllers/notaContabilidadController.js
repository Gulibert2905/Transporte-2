const { NotaContabilidad, DetalleNotaContabilidad, Cuenta } = require('../models');

exports.crearNotaContabilidad = async (req, res) => {
  try {
    const { numero, fecha, concepto, detalles } = req.body;
    
    const notaContabilidad = await NotaContabilidad.create({
      numero,
      fecha,
      concepto,
      total_debito: detalles.reduce((sum, d) => sum + (d.debito || 0), 0),
      total_credito: detalles.reduce((sum, d) => sum + (d.credito || 0), 0)
    });

    for (let detalle of detalles) {
      await DetalleNotaContabilidad.create({
        ...detalle,
        NotaContabilidadId: notaContabilidad.id
      });
    }

    res.status(201).json(notaContabilidad);
  } catch (error) {
    res.status(400).json({ message: error.message });
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