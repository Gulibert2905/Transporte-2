// services/reportGenerator.js
const PdfPrinter = require('pdfmake');
const Excel = require('exceljs');

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
};

const printer = new PdfPrinter(fonts);

exports.generateBalancePDF = (data) => {
  const docDefinition = {
    content: [
      { text: 'Balance General', style: 'header' },
      { text: `Fecha: ${new Date().toLocaleDateString()}`, style: 'subheader' },
      { text: ' ' },
      { text: `Activos: $${data.activos}` },
      { text: `Pasivos: $${data.pasivos}` },
      { text: `Patrimonio: $${data.patrimonio}` },
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
    }
  };

  return printer.createPdfKitDocument(docDefinition);
};

exports.generateBalanceExcel = async (data) => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Balance General');

  worksheet.columns = [
    { header: 'Concepto', key: 'concepto', width: 20 },
    { header: 'Valor', key: 'valor', width: 15 },
  ];

  worksheet.addRows([
    { concepto: 'Activos', valor: data.activos },
    { concepto: 'Pasivos', valor: data.pasivos },
    { concepto: 'Patrimonio', valor: data.patrimonio },
  ]);

  return workbook;
};

exports.generateEstadoResultadosPDF = (data) => {
  const docDefinition = {
    content: [
      { text: 'Estado de Resultados', style: 'header' },
      { text: `Fecha: ${new Date().toLocaleDateString()}`, style: 'subheader' },
      { text: ' ' },
      { text: `Ingresos: $${data.ingresos}` },
      { text: `Gastos: $${data.gastos}` },
      { text: `Utilidad: $${data.utilidad}` },
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
    }
  };

  return printer.createPdfKitDocument(docDefinition);
};

exports.generateEstadoResultadosExcel = async (data) => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Estado de Resultados');

  worksheet.columns = [
    { header: 'Concepto', key: 'concepto', width: 20 },
    { header: 'Valor', key: 'valor', width: 15 },
  ];

  worksheet.addRows([
    { concepto: 'Ingresos', valor: data.ingresos },
    { concepto: 'Gastos', valor: data.gastos },
    { concepto: 'Utilidad', valor: data.utilidad },
  ]);

  return workbook;
};