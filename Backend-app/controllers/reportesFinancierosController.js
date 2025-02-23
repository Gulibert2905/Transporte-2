const contabilidadService = require('../services/contabilidadService');

exports.obtenerBalanceGeneral = async (req, res) => {
  try {
    const { fecha } = req.query;
    const balance = await contabilidadService.generarBalanceGeneral(fecha);
    res.json(balance);
  } catch (error) {
    console.error('Error al generar balance general:', error);
    res.status(500).json({ message: 'Error al generar balance general', error: error.message });
  }
};

exports.obtenerEstadoResultados = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const estadoResultados = await contabilidadService.generarEstadoResultados(fechaInicio, fechaFin);
    res.json(estadoResultados);
  } catch (error) {
    console.error('Error al generar estado de resultados:', error);
    res.status(500).json({ message: 'Error al generar estado de resultados', error: error.message });
  }
};