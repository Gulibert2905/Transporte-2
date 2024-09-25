// controllers/contabilidadController.js
const { Cuenta, Transaccion, Factura } = require('../models');
const { generateBalancePDF, generateBalanceExcel, generateEstadoResultadosPDF, generateEstadoResultadosExcel } = require('../services/reportGenerator');

exports.crearCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.create(req.body);
    res.status(201).json(cuenta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerCuentas = async (req, res) => {
  try {
    const cuentas = await Cuenta.findAll();
    res.json(cuentas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.crearTransaccion = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { cuentaId, monto, tipo } = req.body;
    const transaccion = await Transaccion.create(req.body, { transaction: t });

    const cuenta = await Cuenta.findByPk(cuentaId, { transaction: t });
    if (!cuenta) {
      throw new Error('Cuenta no encontrada');
    }

    const nuevoSaldo = tipo === 'DEBITO' 
      ? parseFloat(cuenta.saldo) + parseFloat(monto)
      : parseFloat(cuenta.saldo) - parseFloat(monto);

    await cuenta.update({ saldo: nuevoSaldo }, { transaction: t });

    await t.commit();
    res.status(201).json(transaccion);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerTransacciones = async (req, res) => {
  try {
    const transacciones = await Transaccion.findAll();
    res.json(transacciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.crearFactura = async (req, res) => {
  try {
    const factura = await Factura.create(req.body);
    res.status(201).json(factura);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerFacturas = async (req, res) => {
  try {
    const facturas = await Factura.findAll();
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBalanceGeneral = async (req, res) => {
  try {
    const activos = await Cuenta.sum('saldo', { where: { tipo: 'ACTIVO' } });
    const pasivos = await Cuenta.sum('saldo', { where: { tipo: 'PASIVO' } });
    const patrimonio = activos - pasivos;

    res.json({ activos, pasivos, patrimonio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEstadoResultados = async (req, res) => {
  try {
    const ingresos = await Cuenta.sum('saldo', { where: { tipo: 'INGRESO' } });
    const gastos = await Cuenta.sum('saldo', { where: { tipo: 'GASTO' } });
    const utilidad = ingresos - gastos;

    res.json({ ingresos, gastos, utilidad });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportBalancePDF = async (req, res) => {
  try {
    const activos = await Cuenta.sum('saldo', { where: { tipo: 'ACTIVO' } });
    const pasivos = await Cuenta.sum('saldo', { where: { tipo: 'PASIVO' } });
    const patrimonio = activos - pasivos;

    const data = { activos, pasivos, patrimonio };
    const pdfDoc = generateBalancePDF(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=balance_general.pdf');

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportBalanceExcel = async (req, res) => {
  try {
    const activos = await Cuenta.sum('saldo', { where: { tipo: 'ACTIVO' } });
    const pasivos = await Cuenta.sum('saldo', { where: { tipo: 'PASIVO' } });
    const patrimonio = activos - pasivos;

    const data = { activos, pasivos, patrimonio };
    const workbook = await generateBalanceExcel(data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=balance_general.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportEstadoResultadosPDF = async (req, res) => {
  try {
    const ingresos = await Cuenta.sum('saldo', { where: { tipo: 'INGRESO' } });
    const gastos = await Cuenta.sum('saldo', { where: { tipo: 'GASTO' } });
    const utilidad = ingresos - gastos;

    const data = { ingresos, gastos, utilidad };
    const pdfDoc = generateEstadoResultadosPDF(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=estado_resultados.pdf');

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportEstadoResultadosExcel = async (req, res) => {
  try {
    const ingresos = await Cuenta.sum('saldo', { where: { tipo: 'INGRESO' } });
    const gastos = await Cuenta.sum('saldo', { where: { tipo: 'GASTO' } });
    const utilidad = ingresos - gastos;

    const data = { ingresos, gastos, utilidad };
    const workbook = await generateEstadoResultadosExcel(data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=estado_resultados.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};