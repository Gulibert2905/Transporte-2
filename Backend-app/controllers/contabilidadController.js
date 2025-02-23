const db = require('../models');
const { generateBalancePDF, generateBalanceExcel, generateEstadoResultadosPDF, generateEstadoResultadosExcel } = require('../services/reportGenerator');
const contabilidadService = require('../services/contabilidadService');
const cierreContableService = require('../services/cierreContableService');

exports.getBalanceGeneral = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ message: 'Se requiere la fecha' });
    }
    console.log('Obteniendo Balance General para fecha:', fecha);
    const balanceGeneral = await contabilidadService.balanceGeneral.obtener(fecha);
    res.json(balanceGeneral);
  } catch (error) {
    console.error('Error al obtener balance general:', error);
    res.status(500).json({ message: 'Error al obtener balance general', error: error.message });
  }
};

// Nuevo método para generar balance general
exports.getBalanceGeneralGenerado = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ message: 'La fecha es requerida' });
    }
    console.log('Generando Balance General para fecha:', fecha);
    const balanceGeneral = await contabilidadService.balanceGeneral.generar(fecha);
    console.log('Balance General generado:', balanceGeneral);
    res.json(balanceGeneral);
  } catch (error) {
    console.error('Error al generar balance general:', error);
    res.status(500).json({ message: 'Error al generar balance general', error: error.message });
  }
};

exports.getLibroDiario = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const libroDiario = await contabilidadService.libroDiario.obtener(fechaInicio, fechaFin);
    res.json(libroDiario);
  } catch (error) {
    console.error('Error al obtener libro diario:', error);
    res.status(500).json({ message: 'Error al obtener libro diario', error: error.message });
  }
};

exports.getBalanceDePrueba = async (req, res) => {
  try {
    const { fecha } = req.query;
    const balanceDePrueba = await contabilidadService.planCuentas.obtenerBalanceDePrueba(fecha);
    res.json(balanceDePrueba);
  } catch (error) {
    console.error('Error al obtener balance de prueba:', error);
    res.status(500).json({ message: 'Error al obtener balance de prueba', error: error.message });
  }
};

exports.getEstadoResultados = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ message: 'Se requieren fechas de inicio y fin' });
    }
    const estadoResultados = await contabilidadService.estadoResultados.obtener(fechaInicio, fechaFin);
    res.json(estadoResultados);
  } catch (error) {
    console.error('Error al obtener estado de resultados:', error);
    res.status(500).json({ message: 'Error al obtener estado de resultados', error: error.message });
  }
};

// Nuevo método para generar estado de resultados
exports.getEstadoResultadosGenerado = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ message: 'Las fechas de inicio y fin son requeridas' });
    }
    console.log('Generando Estado de Resultados para fechas:', { fechaInicio, fechaFin });
    const estadoResultados = await contabilidadService.estadoResultados.generar(fechaInicio, fechaFin);
    console.log('Estado de Resultados generado:', estadoResultados);
    res.json(estadoResultados);
  } catch (error) {
    console.error('Error al generar estado de resultados:', error);
    res.status(500).json({ message: 'Error al generar estado de resultados', error: error.message });
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
exports.realizarCierreMensual = async (req, res) => {
  try {
    const { año, mes } = req.params;
    const resultado = await cierreContableService.realizarCierreMensual(parseInt(año), parseInt(mes));
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.realizarCierreAnual = async (req, res) => {
  try {
    const { año } = req.params;
    const resultado = await cierreContableService.realizarCierreAnual(año);
    res.json(resultado);
  } catch (error) {
    console.error('Error al realizar cierre contable:', error);
    res.status(500).json({ message: 'Error al realizar cierre contable', error: error.message });
  }
};