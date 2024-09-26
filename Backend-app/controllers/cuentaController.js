// controllers/cuentaController.js
const { Cuenta } = require('../models');

exports.crearCuenta = async (req, res) => {
  try {
    const nuevaCuenta = await Cuenta.create(req.body);
    res.status(201).json(nuevaCuenta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerCuentas = async (req, res) => {
  try {
    const cuentas = await Cuenta.findAll({
      include: [{ model: Cuenta, as: 'subcuentas' }]
    });
    res.json(cuentas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Implementa aquí las funciones para actualizar y eliminar cuentas