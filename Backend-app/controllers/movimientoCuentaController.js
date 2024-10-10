const { MovimientoCuenta, Cuenta, sequelize } = require('../models');
const contabilidadService = require('../services/contabilidadService');

exports.crearMovimiento = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { fecha, descripcion, cuentaId, monto, tipo } = req.body;

    const movimiento = await MovimientoCuenta.create({
      fecha,
      descripcion,
      cuentaId,
      monto,
      tipo
    }, { transaction });

    const cuenta = await Cuenta.findByPk(cuentaId, { transaction });
    if (!cuenta) {
      throw new Error('Cuenta no encontrada');
    }

    if (tipo === 'DEBITO') {
      cuenta.saldo += parseFloat(monto);
    } else {
      cuenta.saldo -= parseFloat(monto);
    }
    await cuenta.save({ transaction });

    await contabilidadService.manejarMovimientosContables({ fecha, numero: movimiento.id }, [{
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      tipo: cuenta.tipo,
      monto,
      esDebito: tipo === 'DEBITO'
    }], movimiento, transaction);

    await transaction.commit();
    res.status(201).json(movimiento);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear movimiento de cuenta:', error);
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
    console.error('Error al obtener movimientos de cuenta:', error);
    res.status(500).json({ message: error.message });
  }
};