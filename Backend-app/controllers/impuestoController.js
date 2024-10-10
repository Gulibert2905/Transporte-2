const { Impuesto } = require('../models');

exports.crearImpuesto = async (req, res) => {
  try {
    const { nombre, porcentaje, esRetencion } = req.body;
    const impuesto = await Impuesto.create({ nombre, porcentaje, esRetencion });
    res.status(201).json(impuesto);
  } catch (error) {
    console.error('Error al crear impuesto:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerImpuestos = async (req, res) => {
  try {
    const impuestos = await Impuesto.findAll();
    res.json(impuestos);
  } catch (error) {
    console.error('Error al obtener impuestos:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.obtenerImpuestoPorId = async (req, res) => {
  try {
    const impuesto = await Impuesto.findByPk(req.params.id);
    if (impuesto) {
      res.json(impuesto);
    } else {
      res.status(404).json({ message: 'Impuesto no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener impuesto:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.actualizarImpuesto = async (req, res) => {
  try {
    const { nombre, porcentaje, esRetencion } = req.body;
    const impuesto = await Impuesto.findByPk(req.params.id);
    if (impuesto) {
      await impuesto.update({ nombre, porcentaje, esRetencion });
      res.json(impuesto);
    } else {
      res.status(404).json({ message: 'Impuesto no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar impuesto:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.eliminarImpuesto = async (req, res) => {
  try {
    const impuesto = await Impuesto.findByPk(req.params.id);
    if (impuesto) {
      await impuesto.destroy();
      res.json({ message: 'Impuesto eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Impuesto no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar impuesto:', error);
    res.status(400).json({ message: error.message });
  }
};