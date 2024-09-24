const { Prestador } = require('../models');

exports.getAllPrestadores = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: prestadores } = await Prestador.findAndCountAll({
      limit,
      offset,
      order: [['nit', 'ASC']]
    });

    res.json({
      prestadores,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    console.error('Error al obtener prestadores:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createPrestador = async (req, res) => {
  try {
    const { nit, nombre, contacto } = req.body;
    const newPrestador = await Prestador.create({ nit, nombre, contacto });
    res.status(201).json(newPrestador);
  } catch (error) {
    console.error('Error al crear prestador:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updatePrestador = async (req, res) => {
  try {
    const { nit } = req.params;
    const { nombre, contacto } = req.body;
    const prestador = await Prestador.findByPk(nit);
    if (prestador) {
      await prestador.update({ nombre, contacto });
      res.json(prestador);
    } else {
      res.status(404).json({ message: 'Prestador no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar prestador:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deletePrestador = async (req, res) => {
  try {
    const { nit } = req.params;
    const prestador = await Prestador.findByPk(nit);
    if (prestador) {
      await prestador.destroy();
      res.json({ message: 'Prestador eliminado' });
    } else {
      res.status(404).json({ message: 'Prestador no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar prestador:', error);
    res.status(500).json({ message: error.message });
  }
};