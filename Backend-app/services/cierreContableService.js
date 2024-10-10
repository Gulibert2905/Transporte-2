const { sequelize, Cuenta, MovimientoCuenta, LibroDiario } = require('../models');
const { Op } = require('sequelize');

const cierreContableService = {
  realizarCierreAnual: async (año) => {
    const transaction = await sequelize.transaction();

    try {
      const fechaInicio = new Date(año, 0, 1);
      const fechaFin = new Date(año, 11, 31);

      // Obtener todas las cuentas de ingresos y gastos
      const cuentasResultado = await Cuenta.findAll({
        where: {
          tipo: {
            [Op.or]: ['INGRESO', 'GASTO']
          }
        },
        transaction
      });

      let utilidadNeta = 0;

      // Cerrar cuentas de resultado
      for (const cuenta of cuentasResultado) {
        const saldo = await MovimientoCuenta.sum('monto', {
          where: {
            cuentaId: cuenta.id,
            fecha: {
              [Op.between]: [fechaInicio, fechaFin]
            }
          },
          transaction
        });

        if (cuenta.tipo === 'INGRESO') {
          utilidadNeta += saldo;
        } else {
          utilidadNeta -= saldo;
        }

        // Crear asiento de cierre para esta cuenta
        await LibroDiario.create({
          fecha: fechaFin,
          descripcion: `Cierre de cuenta ${cuenta.nombre}`,
          debe: cuenta.tipo === 'INGRESO' ? saldo : 0,
          haber: cuenta.tipo === 'GASTO' ? saldo : 0
        }, { transaction });

        // Resetear el saldo de la cuenta
        await cuenta.update({ saldo: 0 }, { transaction });
      }

      // Crear asiento para registrar utilidad o pérdida
      const cuentaUtilidad = await Cuenta.findOne({
        where: { codigo: '3110' }, // Asumiendo que este es el código para Utilidad del Ejercicio
        transaction
      });

      await LibroDiario.create({
        fecha: fechaFin,
        descripcion: 'Registro de utilidad/pérdida del ejercicio',
        debe: utilidadNeta < 0 ? Math.abs(utilidadNeta) : 0,
        haber: utilidadNeta > 0 ? utilidadNeta : 0
      }, { transaction });

      await cuentaUtilidad.increment('saldo', { by: utilidadNeta, transaction });

      await transaction.commit();

      return { mensaje: 'Cierre contable realizado con éxito', utilidadNeta };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }}
  exports.realizarCierreMensual = async (año, mes) => {
    const transaction = await sequelize.transaction();
    try {
      const fechaInicio = new Date(año, mes - 1, 1);
      const fechaFin = new Date(año, mes, 0);
  
      // 1. Cerrar todos los asientos del mes
      await LibroDiario.update(
        { estado: 'PUBLICADO' },
        { 
          where: { 
            fecha: { [Op.between]: [fechaInicio, fechaFin] },
            estado: 'BORRADOR'
          },
          transaction
        }
      );
  
      // 2. Calcular saldos de cuentas de resultados
      const cuentasResultado = await Cuenta.findAll({
        attributes: [
          'id', 'codigo', 'nombre', 'tipo',
          [sequelize.fn('SUM', sequelize.col('detalles.debe')), 'totalDebe'],
          [sequelize.fn('SUM', sequelize.col('detalles.haber')), 'totalHaber'],
          [sequelize.literal('SUM(detalles.haber) - SUM(detalles.debe)'), 'saldo']
        ],
        include: [{
          model: DetalleAsiento,
          as: 'detalles',
          attributes: [],
          include: [{
            model: LibroDiario,
            as: 'asiento',
            attributes: [],
            where: { 
              fecha: { [Op.between]: [fechaInicio, fechaFin] },
              estado: 'PUBLICADO'
            }
          }]
        }],
        where: {
          tipo: { [Op.in]: ['INGRESO', 'GASTO'] }
        },
        group: ['Cuenta.id'],
        having: sequelize.literal('saldo != 0'),
        transaction
      });
  
      // 3. Crear asiento de cierre
      const asientoCierre = await LibroDiario.create({
        fecha: fechaFin,
        descripcion: `Cierre del mes ${mes} del año ${año}`,
        estado: 'PUBLICADO'
      }, { transaction });
  
      let utilidad = 0;
      for (const cuenta of cuentasResultado) {
        await DetalleAsiento.create({
          asientoId: asientoCierre.id,
          cuentaId: cuenta.id,
          debe: cuenta.tipo === 'INGRESO' ? cuenta.saldo : 0,
          haber: cuenta.tipo === 'GASTO' ? cuenta.saldo : 0
        }, { transaction });
  
        utilidad += cuenta.tipo === 'INGRESO' ? cuenta.saldo : -cuenta.saldo;
  
        // Resetear saldo de la cuenta
        await cuenta.update({ saldo: 0 }, { transaction });
      }
  
      // 4. Registrar utilidad/pérdida del período
      const cuentaResultado = await Cuenta.findOne({
        where: { codigo: '3110' }, // Asumiendo que este es el código para Resultado del Ejercicio
        transaction
      });
  
      await DetalleAsiento.create({
        asientoId: asientoCierre.id,
        cuentaId: cuentaResultado.id,
        debe: utilidad < 0 ? -utilidad : 0,
        haber: utilidad > 0 ? utilidad : 0
      }, { transaction });
  
      await cuentaResultado.increment('saldo', { by: utilidad, transaction });
  
      await transaction.commit();
      return { mensaje: 'Cierre mensual realizado con éxito', utilidad };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
;

module.exports = cierreContableService;