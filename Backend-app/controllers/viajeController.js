const { Viaje, Prestador, Ruta } = require('../models');
const { Op } = require('sequelize');
const excel = require('exceljs');
const { Parser } = require('json2csv');

exports.getAllViajes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: viajes } = await Viaje.findAndCountAll({
      limit,
      offset,
      include: [
        { model: Prestador, as: 'Prestador' },
        { model: Ruta, as: 'Ruta' }
      ],
      order: [['id', 'DESC']]
    });

    res.json({
      viajes,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    console.error('Error al obtener viajes:', error);
    res.status(500).json({ message: error.message });
  }
};
exports.createViaje = async (req, res) => {
  try {
    const { prestador_nit, ruta_id, fecha_viaje, tarifa_aplicada } = req.body;
    
    // Verificar si el prestador y la ruta existen
    const prestador = await Prestador.findByPk(prestador_nit);
    const ruta = await Ruta.findByPk(ruta_id);

    if (!prestador_nit || !ruta_id || !fecha_viaje || tarifa_aplicada === undefined || tarifa_aplicada === '') {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
  // Convertir tarifa_aplicada a número
  const tarifaNumero = parseFloat(tarifa_aplicada);
  if (isNaN(tarifaNumero)) {
    return res.status(400).json({ message: 'La tarifa debe ser un número válido' });
  }

  const newViaje = await Viaje.create({ 
    prestador_nit, 
    ruta_id, 
    fecha_viaje, 
    tarifa_aplicada: tarifaNumero 
  });
  
  res.status(201).json(newViaje);
} catch (error) {
  console.error('Error al crear viaje:', error);
  res.status(400).json({ message: error.message });
}
};


exports.exportCSV = async (req, res) => {
  try {
    const viajes = await getFilteredViajes(req.query);
    const fields = ['id', 'fecha_viaje', 'tarifa_aplicada', 'prestador_nombre', 'ruta_origen', 'ruta_destino'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(viajes);
    res.header('Content-Type', 'text/csv');
    res.attachment('viajes.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Error exporting CSV' });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const viajes = await getFilteredViajes(req.query);
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Viajes');
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Fecha', key: 'fecha_viaje', width: 15 },
      { header: 'Tarifa', key: 'tarifa_aplicada', width: 15 },
      { header: 'Prestador', key: 'prestador_nombre', width: 20 },
      { header: 'Origen', key: 'ruta_origen', width: 20 },
      { header: 'Destino', key: 'ruta_destino', width: 20 },
    ];
    worksheet.addRows(viajes);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=viajes.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ message: 'Error exporting Excel' });
  }
};

async function getFilteredViajes(query) {
  const where = {};
  const include = [
    { model: Prestador, as: 'Prestador', attributes: ['nombre'] },
    { model: Ruta, as: 'Ruta', attributes: ['origen', 'destino'] }
  ];

  if (query.search) {
    where[Op.or] = [
      { '$Prestador.nombre$': { [Op.like]: `%${query.search}%` } },
      { '$Ruta.origen$': { [Op.like]: `%${query.search}%` } },
      { '$Ruta.destino$': { [Op.like]: `%${query.search}%` } }
    ];
  }

  if (query.prestador) where.prestador_nit = query.prestador;
  if (query.ruta) where.ruta_id = query.ruta;
  if (query.fechaDesde) where.fecha_viaje = { ...where.fecha_viaje, [Op.gte]: new Date(query.fechaDesde) };
  if (query.fechaHasta) where.fecha_viaje = { ...where.fecha_viaje, [Op.lte]: new Date(query.fechaHasta) };
  if (query.tarifaMinima) where.tarifa_aplicada = { ...where.tarifa_aplicada, [Op.gte]: query.tarifaMinima };
  if (query.tarifaMaxima) where.tarifa_aplicada = { ...where.tarifa_aplicada, [Op.lte]: query.tarifaMaxima };

  const viajes = await Viaje.findAll({ where, include });
  return viajes.map(v => ({
    id: v.id,
    fecha_viaje: v.fecha_viaje,
    tarifa_aplicada: v.tarifa_aplicada,
    prestador_nombre: v.Prestador.nombre,
    ruta_origen: v.Ruta.origen,
    ruta_destino: v.Ruta.destino
  }));
}