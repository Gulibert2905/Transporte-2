// controllers/transaccionesController.js
const { Transaccion, MovimientoCuenta, Cuenta, sequelize } = require('../models');

exports.crearTransaccion = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    console.log('Datos recibidos para crear transacción:', JSON.stringify(req.body, null, 2));

    const { fecha, descripcion, monto, tipo, cuentaId, movimientos } = req.body;

    let transaccionData;
    let movimientosData;

    if (movimientos) {
      // Formato con múltiples movimientos
      transaccionData = { fecha, descripcion };
      movimientosData = movimientos;
    } else if (monto && tipo && cuentaId) {
      // Formato con un solo movimiento
      transaccionData = { fecha, descripcion };
      movimientosData = [{
        monto,
        tipo,
        cuentaId
      }];
    } else {
      throw new Error('Datos de transacción incompletos o inválidos');
    }

    const transaccion = await Transaccion.create(transaccionData, { transaction: t });

    for (let movimiento of movimientosData) {
      await MovimientoCuenta.create({
        transaccionId: transaccion.id,
        cuentaId: movimiento.cuentaId,
        monto: movimiento.monto,
        tipo: movimiento.tipo,
        fecha: fecha,
        descripcion: descripcion
      }, { transaction: t });

      const cuenta = await Cuenta.findByPk(movimiento.cuentaId, { transaction: t });
      if (!cuenta) {
        throw new Error(`Cuenta con id ${movimiento.cuentaId} no encontrada`);
      }

      if (movimiento.tipo === 'DEBITO') {
        cuenta.saldo += parseFloat(movimiento.monto);
      } else if (movimiento.tipo === 'CREDITO') {
        cuenta.saldo -= parseFloat(movimiento.monto);
      } else {
        throw new Error('Tipo de movimiento inválido');
      }
      await cuenta.save({ transaction: t });
    }

    await t.commit();
    res.status(201).json(transaccion);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear transacción:', error);
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
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ message: 'Error al obtener las transacciones', error: error.message });
  }
};