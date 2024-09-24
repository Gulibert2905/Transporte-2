const { Parser } = require('json2csv');
const Excel = require('exceljs');
const { Viaje, Prestador, Ruta } = require('../models');

const getViajes = async () => {
  return await Viaje.findAll({
    include: [
      { model: Prestador, as: 'Prestador' },
      { model: Ruta, as: 'Ruta' }
    ]
  });
};

exports.generarReporteCSV = async (req, res) => {
  try {
    const viajes = await getViajes();
    const fields = ['id', 'Prestador.nombre', 'Ruta.origen', 'Ruta.destino', 'fecha_viaje', 'tarifa_aplicada'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(viajes);

    res.header('Content-Type', 'text/csv');
    res.attachment('reporte_viajes.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error al generar reporte CSV:', error);
    res.status(500).json({ message: 'Error al generar el reporte CSV' });
  }
};

exports.generarReporteExcel = async (req, res) => {
  try {
    const viajes = await getViajes();

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Viajes');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Prestador', key: 'prestador', width: 30 },
      { header: 'Origen', key: 'origen', width: 20 },
      { header: 'Destino', key: 'destino', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Tarifa', key: 'tarifa', width: 15 }
    ];

    viajes.forEach(viaje => {
      worksheet.addRow({
        id: viaje.id,
        prestador: viaje.Prestador ? viaje.Prestador.nombre : 'N/A',
        origen: viaje.Ruta ? viaje.Ruta.origen : 'N/A',
        destino: viaje.Ruta ? viaje.Ruta.destino : 'N/A',
        fecha: viaje.fecha_viaje,
        tarifa: viaje.tarifa_aplicada
      });
    });

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('reporte_viajes.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al generar reporte Excel:', error);
    res.status(500).json({ message: 'Error al generar el reporte Excel' });
  }
};