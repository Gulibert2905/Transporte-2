const { 
  LibroDiario, 
  Cuenta, 
  MovimientoCuenta, 
  Factura,
  BalanceGeneral, 
  EstadoResultados,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');
console.log('Modelos importados:', { LibroDiario, Cuenta, MovimientoCuenta, Factura, BalanceGeneral, EstadoResultados });

const contabilidadService = {
  libroDiario: {
    crearAsiento: async (documento, tipo, transaction) => {
      console.log(`Creando asiento en Libro Diario para ${tipo}`);
      await LibroDiario.create({
        fecha: documento.fecha,
        descripcion: `${tipo} - Factura #${documento.numero}`,
        debe: JSON.stringify([{ cuenta: '1010', monto: documento.total }]),
        haber: JSON.stringify([
          { cuenta: '4010', monto: documento.subtotal },
          { cuenta: '2110', monto: documento.impuestos }
        ])
      }, { transaction });
    },
    obtener: async (fechaInicio, fechaFin) => {
      return await LibroDiario.findAll({
        where: { fecha: { [Op.between]: [fechaInicio, fechaFin] } },
        order: [['fecha', 'ASC']]
      });
    }
  },

  planCuentas: {
    actualizar: async (documento, tipo, transaction) => {
      console.log(`Actualizando Plan de Cuentas para ${tipo}`);
      switch (tipo) {
        case 'VENTA':
          await contabilidadService.auxiliares.incrementarSaldoCuenta('1010', documento.total, transaction);
          await contabilidadService.auxiliares.incrementarSaldoCuenta('4010', documento.subtotal, transaction);
          await contabilidadService.auxiliares.incrementarSaldoCuenta('2110', documento.impuestos, transaction);
          break;
        case 'COMPRA':
          await contabilidadService.auxiliares.incrementarSaldoCuenta('1110', documento.total, transaction);
          await contabilidadService.auxiliares.incrementarSaldoCuenta('2010', documento.total, transaction);
          break;
        case 'EGRESO':
          await contabilidadService.auxiliares.decrementarSaldoCuenta('2010', documento.monto, transaction);
          await contabilidadService.auxiliares.decrementarSaldoCuenta('1010', documento.monto, transaction);
          break;
        case 'INGRESO':
          await contabilidadService.auxiliares.incrementarSaldoCuenta('1010', documento.monto, transaction);
          await contabilidadService.auxiliares.decrementarSaldoCuenta('1120', documento.monto, transaction);
          break;
        case 'NOMINA':
          await contabilidadService.auxiliares.incrementarSaldoCuenta('5010', documento.total_pagar, transaction);
          await contabilidadService.auxiliares.decrementarSaldoCuenta('1010', documento.total_pagar, transaction);
          break;
      }
    },
    obtenerBalanceDePrueba: async (fecha) => {
      const cuentas = await Cuenta.findAll({
        attributes: [
          'codigo',
          'nombre',
          'tipo',
          [sequelize.fn('SUM', sequelize.col('movimientos.monto')), 'total']
        ],
        include: [{
          model: MovimientoCuenta,
          as: 'movimientos',
          attributes: [],
          where: {
            fecha: {
              [Op.lte]: fecha
            }
          }
        }],
        group: ['Cuenta.id'],
        raw: true
      });
    
      return cuentas.map(cuenta => ({
        ...cuenta,
        debe: cuenta.tipo === 'ACTIVO' || cuenta.tipo === 'GASTO' ? cuenta.total : 0,
        haber: cuenta.tipo === 'PASIVO' || cuenta.tipo === 'PATRIMONIO' || cuenta.tipo === 'INGRESO' ? cuenta.total : 0
      }));
    }
  },

  balanceGeneral: {
    generar: async (fecha) => {
      try {
        if (!fecha || isNaN(new Date(fecha).getTime())) {
          throw new Error('Fecha inválida');
        }
    
        const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
    
        const cuentas = await Cuenta.findAll({
          attributes: [
            'id', 'codigo', 'nombre', 'tipo',
            [sequelize.fn('SUM', sequelize.col('movimientos.monto')), 'saldo']
          ],
          include: [{
            model: MovimientoCuenta,
            as: 'movimientos',
            attributes: [],
            where: {
              fecha: { [Op.lte]: fechaFormateada }
            },
            required: false
          }],
          where: {
            tipo: { [Op.in]: ['ACTIVO', 'PASIVO', 'PATRIMONIO'] }
          },
          group: ['Cuenta.id'],
          having: sequelize.literal('saldo IS NOT NULL AND saldo != 0'),
          order: [['codigo', 'ASC']]
        });
    
        const activos = cuentas.filter(c => c.tipo === 'ACTIVO');
        const pasivos = cuentas.filter(c => c.tipo === 'PASIVO');
        const patrimonio = cuentas.filter(c => c.tipo === 'PATRIMONIO');
    
        const totalActivos = activos.reduce((sum, c) => sum + parseFloat(c.get('saldo') || 0), 0);
        const totalPasivos = pasivos.reduce((sum, c) => sum + parseFloat(c.get('saldo') || 0), 0);
        const totalPatrimonio = patrimonio.reduce((sum, c) => sum + parseFloat(c.get('saldo') || 0), 0);
    
        return {
          fecha: fechaFormateada,
          activos,
          pasivos,
          patrimonio,
          totalActivos,
          totalPasivos,
          totalPatrimonio
        };
      } catch (error) {
        console.error('Error al generar balance general:', error);
        throw error;
      }
    },
    actualizar: async (fecha, transaction) => {
      console.log('Iniciando actualización de Balance General para:', fecha);
      try {
        const [activos, pasivos, patrimonio] = await Promise.all([
          Cuenta.sum('saldo', { where: { tipo: 'ACTIVO' }, transaction }),
          Cuenta.sum('saldo', { where: { tipo: 'PASIVO' }, transaction }),
          Cuenta.sum('saldo', { where: { tipo: 'PATRIMONIO' }, transaction })
        ]);
        console.log('Sumas calculadas:', { activos, pasivos, patrimonio });

        if (!BalanceGeneral) {
          console.error('Modelo BalanceGeneral no está definido');
          return;
        }

        const resultado = await BalanceGeneral.upsert({
          fecha,
          activos: activos || 0,
          pasivos: pasivos || 0,
          patrimonio: patrimonio || 0
        }, { transaction });
        console.log('Resultado de upsert BalanceGeneral:', resultado);
      } catch (error) {
        console.error('Error en actualizar Balance General:', error);
        throw error;
      }
    },
    obtener: async (fecha) => {
      console.log('Obteniendo Balance General para fecha:', fecha);
      const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
      console.log('Fecha formateada:', fechaFormateada);
  
      let balance = await BalanceGeneral.findOne({
        where: { fecha: fechaFormateada },
        order: [['createdAt', 'DESC']]
      });
  
      if (!balance) {
        console.log('No se encontró Balance General para la fecha especificada. Generando uno nuevo...');
        balance = await contabilidadService.balanceGeneral.generar(fechaFormateada);
        
        if (balance) {
          await BalanceGeneral.create({
            fecha: fechaFormateada,
            activos: balance.totalActivos,
            pasivos: balance.totalPasivos,
            patrimonio: balance.totalPatrimonio
          });
          console.log('Nuevo Balance General creado y guardado en la base de datos.');
        }
      }
  
      console.log('Balance General encontrado o generado:', balance);
      return balance;
    }
  },

  estadoResultados: {
    generar: async (fechaInicio, fechaFin) => {
      console.log(`Generando Estado de Resultados de ${fechaInicio} a ${fechaFin}`);
      try {
        if (!fechaInicio || !fechaFin) {
          throw new Error('Fechas de inicio y fin son requeridas');
        }
    
        console.log('Generando estado de resultados para:', { fechaInicio, fechaFin });
    
        const resultados = await MovimientoCuenta.findAll({
          attributes: [
            [sequelize.fn('SUM', sequelize.col('MovimientoCuenta.monto')), 'total'],
            [sequelize.col('cuenta.id'), 'cuentaId'],
            [sequelize.col('cuenta.codigo'), 'codigo'],
            [sequelize.col('cuenta.nombre'), 'nombre'],
            [sequelize.col('cuenta.tipo'), 'tipo'],
            [sequelize.col('MovimientoCuenta.tipo'), 'tipoMovimiento']
          ],
          include: [{
            model: Cuenta,
            as: 'cuenta',
            attributes: []
          }],
          where: {
            fecha: { [Op.between]: [fechaInicio, fechaFin] },
            '$cuenta.tipo$': { [Op.in]: ['INGRESO', 'GASTO'] }
          },
          group: ['cuenta.id', 'cuenta.codigo', 'cuenta.nombre', 'cuenta.tipo', 'MovimientoCuenta.tipo'],
          raw: true
        });
    
        const ingresos = resultados.filter(r => r.tipo === 'INGRESO' && r.tipoMovimiento === 'CREDITO');
        const gastos = resultados.filter(r => r.tipo === 'GASTO' && r.tipoMovimiento === 'DEBITO');
    
        const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.total || 0), 0);
        const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.total || 0), 0);
    
        return {
          fechaInicio,
          fechaFin,
          ingresos,
          gastos,
          totalIngresos,
          totalGastos,
          utilidad: totalIngresos - totalGastos
        };
      } catch (error) {
        console.error('Error al generar estado de resultados:', error);
        throw error;
      }
    },

    actualizar: async (fecha, transaction) => {
      console.log('Iniciando actualización de Estado de Resultados para:', fecha);
      try {
        const [ingresos, gastos] = await Promise.all([
          Cuenta.sum('saldo', { where: { tipo: 'INGRESO' }, transaction }),
          Cuenta.sum('saldo', { where: { tipo: 'GASTO' }, transaction })
        ]);
        console.log('Sumas calculadas:', { ingresos, gastos });

        if (!EstadoResultados) {
          console.error('Modelo EstadoResultados no está definido');
          return;
        }

        const resultado = await EstadoResultados.upsert({
          fecha,
          ingresos: ingresos || 0,
          gastos: gastos || 0,
          utilidad: (ingresos || 0) - (gastos || 0)
        }, { transaction });
        console.log('Resultado de upsert EstadoResultados:', resultado);
      } catch (error) {
        console.error('Error en actualizar Estado de Resultados:', error);
        throw error;
      }
    },
    obtener: async (fechaInicio, fechaFin) => {
      console.log('Obteniendo Estado de Resultados para fechas:', { fechaInicio, fechaFin });
      const estado = await EstadoResultados.findOne({
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (estado) {
        const result = {
          fechaInicio,
          fechaFin,
          ingresos: parseFloat(estado.ingresos) || 0,
          gastos: parseFloat(estado.gastos) || 0,
          utilidad: parseFloat(estado.utilidad) || 0
        };
        console.log('Estado de Resultados encontrado:', result);
        return result;
      } else {
        console.log('No se encontró Estado de Resultados para las fechas especificadas');
        return {
          fechaInicio,
          fechaFin,
          ingresos: 0,
          gastos: 0,
          utilidad: 0
        };
      }
    },},

  transacciones: {
    actualizarPorFacturaVenta: async (factura, transaction) => {
      console.log('Iniciando actualización por factura de venta:', factura.id);
      try {
        await contabilidadService.libroDiario.crearAsiento(factura, 'VENTA', transaction);
        await contabilidadService.planCuentas.actualizar(factura, 'VENTA', transaction);
        await contabilidadService.balanceGeneral.actualizar(factura.fecha, transaction);
        await contabilidadService.estadoResultados.actualizar(factura.fecha, transaction);
        console.log('Actualización por factura de venta completada');
      } catch (error) {
        console.error('Error en actualizarPorFacturaVenta:', error);
        throw error;
      }
    },
    actualizarPorComprobanteEgreso: async (comprobante, transaction) => {
      await crearAsientoLibroDiario(comprobante, 'EGRESO', transaction);
      await actualizarPlanDeCuentas(comprobante, 'EGRESO', transaction);
      await actualizarInformesFinancieros(comprobante.fecha, transaction);
    },
  
    actualizarPorReciboCaja: async (recibo, transaction) => {
      await crearAsientoLibroDiario(recibo, 'INGRESO', transaction);
      await actualizarPlanDeCuentas(recibo, 'INGRESO', transaction);
      await actualizarInformesFinancieros(recibo.fecha, transaction);
    },
  
    actualizarPorNomina: async (nomina, transaction) => {
      await crearAsientoLibroDiario(nomina, 'NOMINA', transaction);
      await actualizarPlanDeCuentas(nomina, 'NOMINA', transaction);
      await actualizarInformesFinancieros(nomina.fecha, transaction);
    },

    revertirFacturaVenta: async (factura, transaction) => {
      console.log(`Revirtiendo factura de venta: ${factura.id}`);
      const cuentaVentas = await obtenerOCrearCuenta('4010', 'Ingresos por Ventas', 'INGRESO', transaction);
      const cuentaCaja = await obtenerOCrearCuenta('1010', 'Caja', 'ACTIVO', transaction);
      const cuentaImpuestos = await obtenerOCrearCuenta('2110', 'Impuestos por Pagar', 'PASIVO', transaction);

  // Crear asiento de reversión en el Libro Diario
  await LibroDiario.create({
    fecha: new Date(),
    descripcion: `Anulación - Factura #${factura.numero}`,
    debe: JSON.stringify([
      { cuentaId: cuentaVentas.id, monto: factura.subtotal },
      { cuentaId: cuentaImpuestos.id, monto: factura.impuestos }
    ]),
    haber: JSON.stringify([
      { cuentaId: cuentaCaja.id, monto: factura.total }
    ])
  }, { transaction });

  // Revertir saldos de las cuentas
  await Cuenta.decrement('saldo', {
    by: factura.total,
    where: { id: cuentaCaja.id },
    transaction
  });
  await Cuenta.decrement('saldo', {
    by: factura.subtotal,
    where: { id: cuentaVentas.id },
    transaction
  });
  await Cuenta.decrement('saldo', {
    by: factura.impuestos,
    where: { id: cuentaImpuestos.id },
    transaction
  });
    }
    
  },
  
  auxiliares: {
    incrementarSaldoCuenta: async (codigo, monto, transaction) => {
      await Cuenta.increment('saldo', {
        by: monto,
        where: { codigo },
        transaction
      });
    },
    decrementarSaldoCuenta: async (codigo, monto, transaction) => {
      await Cuenta.decrement('saldo', {
        by: monto,
        where: { codigo },
        transaction
      });
    },
    obtenerOCrearCuenta: async (codigo, nombre, tipo, transaction) => {
      const [cuenta, created] = await Cuenta.findOrCreate({
        where: { codigo },
        defaults: { nombre, tipo },
        transaction
      });
      return cuenta;
    },
    obtenerIdCuenta: async (codigo) => {
      const cuenta = await Cuenta.findOne({ where: { codigo } });
      return cuenta ? cuenta.id : null;
    }
  },

  actualizarInformesFinancieros: async (fecha, transaction) => {
    await contabilidadService.balanceGeneral.actualizar(fecha, transaction);
    await contabilidadService.estadoResultados.actualizar(fecha, transaction);
  },

  crearFacturaVenta: async (facturaData) => {
    const t = await sequelize.transaction();
    try {
      const factura = await Factura.create(facturaData, { transaction: t });
      await contabilidadService.transacciones.actualizarPorFacturaVenta(factura, t);
      await t.commit();
      return factura;
    } catch (error) {
      await t.rollback();
      console.error('Error en crearFacturaVenta:', error);
      throw error;
    }
  }
};

module.exports = contabilidadService;