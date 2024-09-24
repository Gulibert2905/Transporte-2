const { Ruta } = require('../models');

exports.getAllRutas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: rutas } = await Ruta.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']]
    });

    res.json({
      rutas,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createRuta = async (req, res) => {
  try {
    const { origen, destino, distancia } = req.body;
    const newRuta = await Ruta.create({ origen, destino, distancia });
    res.status(201).json(newRuta);
  } catch (error) {
    console.error('Error al crear ruta:', error);
    res.status(400).json({ message: error.message });
  }
};