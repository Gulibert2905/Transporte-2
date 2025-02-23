const cierreContableService = require('../services/cierreContableService');

exports.realizarCierreAnual = async (req, res) => {
  try {
    const { año } = req.params;
    const resultado = await cierreContableService.realizarCierreAnual(año);
    res.json(resultado);
  } catch (error) {
    console.error('Error al realizar cierre contable:', error);
    res.status(500).json({ message: 'Error al realizar cierre contable', error: error.message });
  }
};