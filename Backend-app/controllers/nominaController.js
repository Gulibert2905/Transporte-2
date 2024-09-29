const { Nomina, Empleado } = require('../models');

exports.crearNomina = async (req, res) => {
  try {
    const { empleado_id, periodo, salario_base, deducciones, bonificaciones } = req.body;

    // Validación de los campos requeridos
    if (!empleado_id || !periodo || !salario_base) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Validación: Verificar si el empleado existe en la base de datos
    const empleado = await Empleado.findByPk(empleado_id);
    if (!empleado) {
      return res.status(400).json({ message: 'Empleado no encontrado' });
    }
    
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