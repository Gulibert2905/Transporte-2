const { Nomina, Empleado } = require('../models');
const contabilidadService = require('../services/contabilidadService');
const { sequelize } = require('../models');

exports.crearNomina = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { empleado_id, periodo, salario_base, deducciones, bonificaciones } = req.body;

    if (!empleado_id || !periodo || !salario_base) {
      throw new Error('Faltan datos obligatorios');
    }

    const empleado = await Empleado.findByPk(empleado_id);
    if (!empleado) {
      throw new Error('Empleado no encontrado');
    }

    const total_pagar = parseFloat(salario_base) - parseFloat(deducciones || 0) + parseFloat(bonificaciones || 0);

    const nomina = await Nomina.create({
      empleado_id,
      periodo,
      salario_base,
      deducciones: deducciones || 0,
      bonificaciones: bonificaciones || 0,
      total_pagar
    }, { transaction });

    console.log('Nómina creada:', nomina.toJSON());

    // Verificamos que la función exista antes de llamarla
    if (typeof contabilidadService.transacciones.actualizarPorNomina !== 'function') {
      throw new Error('La función actualizarPorNomina no está definida en el servicio de contabilidad');
    }

    // Llamamos a la función correctamente
    await contabilidadService.transacciones.actualizarPorNomina(nomina, transaction);

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