const { Nomina, Empleado } = require('../models');

exports.crearNomina = async (req, res) => {
  try {
    const { empleado_id, periodo, salario_base, deducciones, bonificaciones } = req.body;
    const total_pagar = salario_base - deducciones + bonificaciones;
    
    const nomina = await Nomina.create({
      empleado_id,
      periodo,
      salario_base,
      deducciones,
      bonificaciones,
      total_pagar
    });

    res.status(201).json(nomina);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.obtenerNominas = async (req, res) => {
  try {
    const nominas = await Nomina.findAll({
      include: [{ model: Empleado, attributes: ['nombre', 'cargo'] }]
    });
    res.json(nominas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};