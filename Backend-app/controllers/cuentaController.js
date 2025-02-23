const { Cuenta, sequelize } = require('../models');


exports.crearCuenta = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { codigo, nombre, tipo, cuentaPadreId } = req.body;
    
    let nivel = 1;
    if (cuentaPadreId) {
      const cuentaPadre = await Cuenta.findByPk(cuentaPadreId);
      if (!cuentaPadre) {
        throw new Error('Cuenta padre no encontrada');
      }
      nivel = cuentaPadre.nivel + 1;
    }

    const nuevaCuenta = await Cuenta.create({
      codigo,
      nombre,
      tipo,
      cuentaPadreId,
      nivel
    }, { transaction });

    await transaction.commit();
    res.status(201).json(nuevaCuenta);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerCuentas = async (req, res) => {
  try {
    const cuentas = await Cuenta.findAll({
      where: { cuentaPadreId: null },
      include: [{
        model: Cuenta,
        as: 'subcuentas',
        include: ['subcuentas']
      }],
      order: [['codigo', 'ASC']]
    });
    res.json(cuentas);
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.obtenerCuentaPorId = async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id, {
      include: [{
        model: Cuenta,
        as: 'subcuentas',
        include: { all: true, nested: true }
      }]
    });
    if (cuenta) {
      res.json(cuenta);
    } else {
      res.status(404).json({ message: 'Cuenta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.actualizarCuenta = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { nombre, tipo } = req.body;
    const cuenta = await Cuenta.findByPk(id);
    if (!cuenta) {
      throw new Error('Cuenta no encontrada');
    }
    await cuenta.update({ nombre, tipo }, { transaction });
    await transaction.commit();
    res.json(cuenta);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
};

exports.eliminarCuenta = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const cuenta = await Cuenta.findByPk(id);
    if (!cuenta) {
      throw new Error('Cuenta no encontrada');
    }
    const tieneSubcuentas = await Cuenta.count({ where: { cuentaPadreId: id } });
    if (tieneSubcuentas > 0) {
      throw new Error('No se puede eliminar una cuenta con subcuentas');
    }
    await cuenta.destroy({ transaction });
    await transaction.commit();
    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerBalanceGeneral = async (req, res) => {
  try {
    const activos = await Cuenta.sum('saldo', { where: { tipo: 'ACTIVO' } });
    const pasivos = await Cuenta.sum('saldo', { where: { tipo: 'PASIVO' } });
    const patrimonio = await Cuenta.sum('saldo', { where: { tipo: 'PATRIMONIO' } });

    res.json({
      activos,
      pasivos,
      patrimonio,
      totalPasivoPatrimonio: pasivos + patrimonio
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.obtenerEstadoResultados = async (req, res) => {
  try {
    const ingresos = await Cuenta.sum('saldo', { where: { tipo: 'INGRESO' } });
    const gastos = await Cuenta.sum('saldo', { where: { tipo: 'GASTO' } });

    res.json({
      ingresos,
      gastos,
      utilidad: ingresos - gastos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSumByTipo = async (tipo) => {
  try {
    const sum = await Cuenta.sum('saldo', { where: { tipo } });
    return sum || 0;
  } catch (error) {
    console.error(`Error al calcular la suma para el tipo ${tipo}:`, error);
    throw error;
  }
};