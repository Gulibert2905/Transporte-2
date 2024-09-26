const { MovimientoCuenta, Cuenta, sequelize } = require('../models');

exports.crearMovimiento = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { fecha, descripcion, cuentaId, monto, tipo } = req.body;

    const movimiento = await MovimientoCuenta.create({
      fecha,
      descripcion,
      cuentaId,
      monto,
      tipo
    }, { transaction: t });

    const cuenta = await Cuenta.findByPk(cuentaId, { transaction: t });
    if (!cuenta) {
      throw new Error('Cuenta no encontrada');
    }

    if (tipo === 'DEBITO') {
      cuenta.saldo += parseFloat(monto);
    } else {
      cuenta.saldo -= parseFloat(monto);
    }
    await cuenta.save({ transaction: t });

    await t.commit();
    res.status(201).json(movimiento);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await MovimientoCuenta.findAll({
      include: [{
        model: Cuenta,
        attributes: ['id', 'nombre', 'codigo']
      }],
      order: [['fecha', 'DESC']]
    });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};