const { Transaccion, MovimientoCuenta, Cuenta, sequelize } = require('../models');

exports.crearTransaccion = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { fecha, descripcion, referencia, movimientos } = req.body;

    // Validar que los débitos y créditos estén balanceados
    const totalDebitos = movimientos
      .filter(m => m.tipo === 'DEBITO')
      .reduce((sum, m) => sum + parseFloat(m.monto), 0);
    const totalCreditos = movimientos
      .filter(m => m.tipo === 'CREDITO')
      .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    if (totalDebitos.toFixed(2) !== totalCreditos.toFixed(2)) {
      throw new Error('Los débitos y créditos no están balanceados');
    }
    const transaccion = await Transaccion.create({
      fecha,
      descripcion,
      referencia
    }, { transaction: t });

    for (let movimiento of movimientos) {
      await MovimientoCuenta.create({
        transaccionId: transaccion.id,
        cuentaId: movimiento.cuentaId,
        monto: movimiento.monto,
        tipo: movimiento.tipo
      }, { transaction: t });

      const cuenta = await Cuenta.findByPk(movimiento.cuentaId, { transaction: t });
      if (movimiento.tipo === 'DEBITO') {
        cuenta.saldo += parseFloat(movimiento.monto);
      } else {
        cuenta.saldo -= parseFloat(movimiento.monto);
      }
      await cuenta.save({ transaction: t });
    }

    await t.commit();
    res.status(201).json(transaccion);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerTransacciones = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
  
      const { count, rows: transacciones } = await Transaccion.findAndCountAll({
        include: [{
          model: MovimientoCuenta,
          as: 'movimientos',
          include: [{
            model: Cuenta,
            as: 'cuenta'
          }]
        }],
        order: [['fecha', 'DESC']],
        limit,
        offset
      });
  
      res.json({
        transacciones,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };