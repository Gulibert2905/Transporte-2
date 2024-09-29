const db = require('../models');
const cuentaController = require('./cuentaController');
const { generateBalancePDF, generateBalanceExcel, generateEstadoResultadosPDF, generateEstadoResultadosExcel } = require('../services/reportGenerator');

exports.getBalanceGeneral = async (req, res) => {
  try {
    console.log('Iniciando cálculo de balance general');
    console.log('Modelos disponibles:', Object.keys(db));
    const activos = await db.Cuenta.sum('saldo', { 
      where: { tipo: 'ACTIVO' } 
    });
    console.log('Activos calculados:', activos);
    
    const pasivos = await db.Cuenta.sum('saldo', { 
      where: { tipo: 'PASIVO' } 
    });
    console.log('Pasivos calculados:', pasivos);
    
    const patrimonio = activos - pasivos;
    console.log('Patrimonio calculado:', patrimonio);

    res.json({ activos, pasivos, patrimonio });
  } catch (error) {
    console.error('Error detallado:', error);
    
    res.status(500).json({ 
      message: 'Error al obtener balance general', 
      error: error.message 
    });
  }
};

exports.getEstadoResultados = async (req, res) => {
  try {
    console.log('Iniciando cálculo de estado de resultados');
    
    // Usamos el controlador de Cuenta para obtener los datos
    const ingresos = await cuentaController.getSumByTipo('INGRESO');
    console.log('Ingresos calculados:', ingresos);
    
    const gastos = await cuentaController.getSumByTipo('GASTO');
    console.log('Gastos calculados:', gastos);
    
    const utilidad = ingresos - gastos;
    console.log('Utilidad calculada:', utilidad);

    res.json({ ingresos, gastos, utilidad });
  } catch (error) {
    console.error('Error al obtener estado de resultados:', error);
    res.status(500).json({ 
      message: 'Error al obtener estado de resultados', 
      error: error.message 
    });
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