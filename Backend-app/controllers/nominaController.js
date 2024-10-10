const { Nomina, Empleado } = require('../models');
const contabilidadService = require('../services/contabilidadService');
const { sequelize } = require('../models');

exports.crearNomina = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { empleado_id, periodo, salario_base, deducciones, bonificaciones } = req.body;

    if (!empleado_id || !periodo || !salario_base) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

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
    }, { transaction });

    await contabilidadService.actualizarPorNomina(nomina, transaction);

    await transaction.commit();
    res.status(201).json(nomina);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear nómina:', error);
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
    console.error('Error al obtener nóminas:', error);
    res.status(500).json({ message: error.message });
  }
};