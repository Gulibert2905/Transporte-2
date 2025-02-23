// controllers/librodiarioController.js
const { LibroDiario, DetalleAsiento, MovimientoCuenta, Cuenta } = require('../models');

exports.obtenerLibroDiario = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const movimientos = await MovimientoCuenta.findAndCountAll({
      where: {
        fecha: { [Op.between]: [fechaInicio, fechaFin] }
      },
      include: [{
        model: Cuenta,
        as: 'cuenta',
        attributes: ['codigo', 'nombre']
      }],
      order: [['fecha', 'ASC'], ['id', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      movimientos: movimientos.rows,
      totalPages: Math.ceil(movimientos.count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error al obtener libro diario:', error);
    res.status(500).json({ message: 'Error al obtener libro diario', error: error.message });
  }
};
exports.crearAsiento = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { fecha, descripcion, referencia, detalles } = req.body;

    const asiento = await LibroDiario.create({
      fecha,
      descripcion,
      referencia
    }, { transaction });

    for (const detalle of detalles) {
      await DetalleAsiento.create({
        asientoId: asiento.id,
        cuentaId: detalle.cuentaId,
        debe: detalle.debe || 0,
        haber: detalle.haber || 0
      }, { transaction });

      // Actualizar saldo de la cuenta
      await Cuenta.increment(
        { saldo: detalle.debe ? detalle.debe : -detalle.haber },
        { where: { id: detalle.cuentaId }, transaction }
      );
    }

    await transaction.commit();
    res.status(201).json(asiento);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerAsientos = async (req, res) => {
  try {
    const asientos = await LibroDiario.findAll({
      include: [{
        model: DetalleAsiento,
        as: 'detalles',
        include: [{
          model: Cuenta,
          as: 'cuenta',
          attributes: ['id', 'codigo', 'nombre']
        }]
      }],
      order: [['fecha', 'DESC']]
    });
    res.json(asientos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};