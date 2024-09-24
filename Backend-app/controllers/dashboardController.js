const db = require('../models');
const { Sequelize, Op } = db.Sequelize;
const { Viaje, Prestador, Ruta, Tarifa } = db;

exports.getDashboardData = async (req, res) => {
  try {
    console.log('Iniciando obtención de datos del dashboard');

    console.log('Obteniendo total de viajes...');
    const totalViajes = await Viaje.count();
    console.log('Total de viajes obtenido:', totalViajes);

    console.log('Calculando promedio de tarifa...');
    const promedioTarifa = await Viaje.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('tarifa_aplicada')), 'promedioTarifa']],
      raw: true
    });
    console.log('Promedio de tarifa calculado:', promedioTarifa);

    console.log('Obteniendo viajes por mes...');
    const viajesPorMes = await Viaje.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha_viaje'), '%Y-%m-01'), 'mes'],
        [Sequelize.fn('COUNT', '*'), 'viajes']
      ],
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha_viaje'), '%Y-%m-01')],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha_viaje'), '%Y-%m-01'), 'ASC']],
      raw: true
    });
    console.log('Viajes por mes obtenidos:', viajesPorMes);

    console.log('Obteniendo tarifas por prestador...');
    const tarifasPorPrestador = await Viaje.findAll({
      attributes: [
        'prestador_nit',
        [Sequelize.fn('AVG', Sequelize.col('tarifa_aplicada')), 'tarifaPromedio']
      ],
      include: [{
        model: Prestador,
        as: 'Prestador',
        attributes: ['nombre']
      }],
      group: ['prestador_nit', 'Prestador.nombre'],
      raw: true,
      nest: true
    });
    console.log('Tarifas por prestador obtenidas:', tarifasPorPrestador);

    console.log('Obteniendo viajes por ruta...');
    const viajesPorRuta = await Viaje.findAll({
      attributes: [
        'ruta_id',
        [Sequelize.fn('COUNT', '*'), 'viajes']
      ],
      include: [{
        model: Ruta,
        as: 'Ruta',
        attributes: ['origen', 'destino']
      }],
      group: ['ruta_id', 'Ruta.origen', 'Ruta.destino'],
      raw: true,
      nest: true
    });
    console.log('Viajes por ruta obtenidos:', viajesPorRuta);

    console.log('Datos del dashboard obtenidos exitosamente');
    res.json({
      totalViajes,
      promedioTarifa: parseFloat(promedioTarifa.promedioTarifa),
      viajesPorMes: viajesPorMes.map(vm => ({
        mes: vm.mes,
        viajes: parseInt(vm.viajes)
      })),
      tarifasPorPrestador: tarifasPorPrestador.map(t => ({
        nombre: t.Prestador.nombre,
        tarifaPromedio: parseFloat(t.tarifaPromedio)
      })),
      viajesPorRuta: viajesPorRuta.map(v => ({
        ruta: `${v.Ruta.origen} - ${v.Ruta.destino}`,
        viajes: parseInt(v.viajes)
      }))
    });
  } catch (error) {
    console.error('Error en getDashboardData:', error);
    res.status(500).json({ message: 'Error al obtener datos del dashboard', error: error.message });
  }
};