const { Tarifa, Prestador, Ruta } = require('../models');

exports.getAllTarifas = async (req, res) => {
  try {
    console.log('Modelo Tarifa:', Tarifa);
    if (!Tarifa || typeof Tarifa.findAndCountAll !== 'function') {
      throw new Error('El modelo Tarifa no está definido correctamente');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: tarifas } = await Tarifa.findAndCountAll({
      limit,
      offset,
      include: [
        { model: Prestador, as: 'Prestador' },
        { model: Ruta, as: 'Ruta' }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      tarifas,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    console.error('Error detallado al obtener tarifas:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createTarifa = async (req, res) => {
  try {
    const { prestador_nit, ruta_id, tarifa } = req.body;
    const newTarifa = await Tarifa.create({ prestador_nit, ruta_id, tarifa });
    res.status(201).json(newTarifa);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Ya existe una tarifa para este prestador y ruta.' });
    } else {
      console.error('Error detallado al crear tarifa:', error);
      res.status(500).json({ message: 'Error al crear la tarifa', error: error.message });
    }
  }
};

exports.getTarifaByPrestadorAndRuta = async (req, res) => {
  try {
    const { prestador_nit, ruta_id } = req.query;
    const tarifa = await Tarifa.findOne({
      where: { prestador_nit, ruta_id },
      attributes: ['tarifa']
    });

    if (tarifa) {
      res.json({ tarifa: tarifa.tarifa });
    } else {
      res.status(404).json({ message: 'Tarifa no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener tarifa:', error);
    res.status(500).json({ message: error.message });
  }
};