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
      console.log(`Creando asiento en Libro Diario para ${tipo}`, documento);
      try {
        let debe, haber;
  
        switch (tipo) {
          case 'VENTA':
            debe = [{ cuenta: '1010', monto: parseFloat(documento.total) || 0 }];
            haber = [
              { cuenta: '4010', monto: parseFloat(documento.subtotal) || 0 },
              { cuenta: '2110', monto: parseFloat(documento.impuestos) || 0 }
            ];
            break;
          case 'COMPRA':
            const total = parseFloat(documento.total) || 0;
            const subtotal = parseFloat(documento.subtotal) || (total / 1.19);
            const impuestos = parseFloat(documento.impuestos) || (total - subtotal);
            
            debe = [
              { cuenta: '1110', monto: subtotal },
              { cuenta: '1190', monto: impuestos }
            ];
            haber = [{ cuenta: '2010', monto: total }];
            break;
          case 'NOMINA':
            const montoPagar = parseFloat(documento.total_pagar) || 0;
            debe = [{ cuenta: '5010', monto: montoPagar }];
            haber = [{ cuenta: '1010', monto: montoPagar }];
            break;
          case 'EGRESO':
            const montoEgreso = parseFloat(documento.monto) || 0;
            debe = [{ cuenta: '5000', monto: montoEgreso }];
            haber = [{ cuenta: '1010', monto: montoEgreso }];
            break;
          case 'INGRESO':
            const montoIngreso = parseFloat(documento.monto) || 0;
            debe = [{ cuenta: '1010', monto: montoIngreso }];
            haber = [{ cuenta: '4010', monto: montoIngreso }];
            break;
          default:
            throw new Error(`Tipo de transacción no soportado: ${tipo}`);
        }
  
        let fecha;
        if (tipo === 'NOMINA') {
          fecha = documento.periodo ? new Date(documento.periodo) : new Date();
        } else {
          fecha = documento.fecha ? new Date(documento.fecha) : new Date();
        }
  
        const descripcion = tipo === 'NOMINA'
          ? `${tipo} - Empleado ID: ${documento.empleado_id}`
          : tipo === 'EGRESO'
            ? `${tipo} - Comprobante #${documento.numero}`
            : tipo === 'INGRESO'
              ? `${tipo} - Recibo de Caja #${documento.numero}`
              : `${tipo} - Factura #${documento.numero}`;
  
        console.log('Creando asiento con datos:', {
          fecha,
          descripcion,
          debe,
          haber
        });
  
        const asiento = await LibroDiario.create({
          fecha,
          descripcion,
          debe, // Ya no necesitamos JSON.stringify porque el campo es DataTypes.JSON
          haber // Ya no necesitamos JSON.stringify porque el campo es DataTypes.JSON
        }, { transaction });
  
        console.log('Asiento creado exitosamente:', asiento.toJSON());
        return asiento;
      } catch (error) {
        console.error('Error al crear asiento:', error);
        throw error;
      }
    }
  },

  planCuentas: {
    actualizar: async (documento, tipo, transaction) => {
      console.log(`Actualizando Plan de Cuentas para ${tipo}`, documento);
      try {
        switch (tipo) {
          case 'VENTA':
            await Promise.all([
              contabilidadService.auxiliares.incrementarSaldoCuenta('1010', parseFloat(documento.total), transaction),
              contabilidadService.auxiliares.incrementarSaldoCuenta('4010', parseFloat(documento.subtotal), transaction),
              contabilidadService.auxiliares.incrementarSaldoCuenta('2110', parseFloat(documento.impuestos), transaction)
            ]);
            break;
  
          case 'COMPRA':
            const total = parseFloat(documento.total) || 0;
            const subtotal = parseFloat(documento.subtotal) || (total / 1.19);
            const impuestos = parseFloat(documento.impuestos) || (total - subtotal);
  
            await Promise.all([
              contabilidadService.auxiliares.incrementarSaldoCuenta('1110', subtotal, transaction),
              contabilidadService.auxiliares.incrementarSaldoCuenta('1190', impuestos, transaction),
              contabilidadService.auxiliares.incrementarSaldoCuenta('2010', total, transaction),
              contabilidadService.auxiliares.incrementarSaldoCuenta('5000', subtotal, transaction) // Registrar el gasto
            ]);
            break;
  
          case 'EGRESO':
            const montoEgreso = parseFloat(documento.monto) || 0;
            await Promise.all([
              contabilidadService.auxiliares.decrementarSaldoCuenta('2010', montoEgreso, transaction),
              contabilidadService.auxiliares.decrementarSaldoCuenta('1010', montoEgreso, transaction),
              contabilidadService.auxiliares.incrementarSaldoCuenta('5000', montoEgreso, transaction) // Registrar el gasto
            ]);
            break;
  
          case 'INGRESO':
            const montoIngreso = parseFloat(documento.monto) || 0;
            await Promise.all([
              contabilidadService.auxiliares.incrementarSaldoCuenta('1010', montoIngreso, transaction),
              contabilidadService.auxiliares.incrementarSaldoCuenta('4010', montoIngreso, transaction)
            ]);
            break;
  
          case 'NOMINA':
            const montoPagar = parseFloat(documento.total_pagar) || 0;
            await Promise.all([
              contabilidadService.auxiliares.incrementarSaldoCuenta('5010', montoPagar, transaction),
              contabilidadService.auxiliares.decrementarSaldoCuenta('1010', montoPagar, transaction)
            ]);
            break;
  
          default:
            throw new Error(`Tipo de transacción no soportado: ${tipo}`);
        }
  
        // Actualizar balance general y estado de resultados después de cada transacción
        await Promise.all([
          contabilidadService.balanceGeneral.actualizar(documento.fecha || new Date(), transaction),
          contabilidadService.estadoResultados.actualizar(documento.fecha || new Date(), transaction)
        ]);
  
        console.log('Plan de cuentas actualizado exitosamente');
      } catch (error) {
        console.error('Error al actualizar plan de cuentas:', error);
        throw error;
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
        console.log('Generando Balance General para fecha:', fechaFormateada);
  
        // Obtener todas las cuentas con sus saldos
        const cuentas = await Cuenta.findAll({
          attributes: [
            'codigo',
            'nombre',
            'tipo',
            'saldo'
          ],
          where: {
            tipo: {
              [Op.in]: ['ACTIVO', 'PASIVO', 'PATRIMONIO']
            }
          },
          raw: true
        });
  
        console.log('Cuentas encontradas:', cuentas);
  
        // Calcular totales
        const totalActivos = cuentas
          .filter(cuenta => cuenta.tipo === 'ACTIVO')
          .reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
  
        const totalPasivos = cuentas
          .filter(cuenta => cuenta.tipo === 'PASIVO')
          .reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
  
        // Calcular patrimonio como activos - pasivos más cualquier cuenta de patrimonio
        const patrimonioBase = totalActivos - totalPasivos;
        const patrimonioAdicional = cuentas
          .filter(cuenta => cuenta.tipo === 'PATRIMONIO')
          .reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
  
        const totalPatrimonio = patrimonioBase + patrimonioAdicional;
  
        console.log('Totales calculados:', {
          totalActivos,
          totalPasivos,
          patrimonioBase,
          patrimonioAdicional,
          totalPatrimonio
        });
  
        // Guardar el balance generado
        const balanceGeneral = await BalanceGeneral.create({
          fecha: fechaFormateada,
          activos: totalActivos,
          pasivos: totalPasivos,
          patrimonio: totalPatrimonio
        });
  
        return {
          fecha: fechaFormateada,
          activos: totalActivos,
          pasivos: totalPasivos,
          patrimonio: totalPatrimonio,
          detalle: {
            activos: cuentas.filter(c => c.tipo === 'ACTIVO'),
            pasivos: cuentas.filter(c => c.tipo === 'PASIVO'),
            patrimonio: cuentas.filter(c => c.tipo === 'PATRIMONIO')
          }
        };
      } catch (error) {
        console.error('Error al generar balance general:', error);
        throw error;
      }
    },
  
    actualizar: async (fecha, transaction) => {
      console.log('Actualizando Balance General para fecha:', fecha);
      try {
        const [activos, pasivos] = await Promise.all([
          Cuenta.sum('saldo', { 
            where: { tipo: 'ACTIVO' },
            transaction 
          }),
          Cuenta.sum('saldo', { 
            where: { tipo: 'PASIVO' },
            transaction 
          })
        ]);
  
        const totalActivos = parseFloat(activos || 0);
        const totalPasivos = parseFloat(pasivos || 0);
        const totalPatrimonio = totalActivos - totalPasivos;
  
        console.log('Saldos calculados:', {
          totalActivos,
          totalPasivos,
          totalPatrimonio
        });
  
        const [balanceGeneral] = await BalanceGeneral.upsert({
          fecha,
          activos: totalActivos,
          pasivos: totalPasivos,
          patrimonio: totalPatrimonio
        }, { transaction });
  
        return balanceGeneral;
      } catch (error) {
        console.error('Error al actualizar Balance General:', error);
        throw error;
      }
    },
  
    obtener: async (fecha) => {
      console.log('Obteniendo Balance General para fecha:', fecha);
      const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
  
      try {
        let balance = await BalanceGeneral.findOne({
          where: { fecha: fechaFormateada },
          order: [['createdAt', 'DESC']]
        });
  
        if (!balance) {
          console.log('No se encontró Balance General, generando uno nuevo...');
          const nuevoBalance = await contabilidadService.balanceGeneral.generar(fechaFormateada);
          balance = await BalanceGeneral.create({
            fecha: fechaFormateada,
            activos: nuevoBalance.activos,
            pasivos: nuevoBalance.pasivos,
            patrimonio: nuevoBalance.activos - nuevoBalance.pasivos
          });
        } else {
          // Asegurar que el patrimonio esté actualizado
          const patrimonioCalculado = balance.activos - balance.pasivos;
          if (balance.patrimonio !== patrimonioCalculado) {
            balance.patrimonio = patrimonioCalculado;
            await balance.save();
          }
        }
  
        const result = {
          fecha: fechaFormateada,
          activos: parseFloat(balance.activos || 0),
          pasivos: parseFloat(balance.pasivos || 0),
          patrimonio: parseFloat(balance.patrimonio || 0)
        };
  
        console.log('Balance General obtenido:', result);
        return result;
      } catch (error) {
        console.error('Error al obtener Balance General:', error);
        throw error;
      }
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
          Cuenta.sum('saldo', { 
            where: { tipo: 'INGRESO' },
            transaction 
          }),
          Cuenta.sum('saldo', { 
            where: { tipo: 'GASTO' },
            transaction 
          })
        ]);
        console.log('Sumas calculadas:', { ingresos, gastos });
  
        if (!EstadoResultados) {
          throw new Error('Modelo EstadoResultados no está definido');
        }
  
        const [estadoResultados, created] = await EstadoResultados.upsert({
          fecha,
          ingresos: ingresos || 0,
          gastos: gastos || 0,
          utilidad: (ingresos || 0) - (gastos || 0)
        }, { transaction });
  
        console.log('Estado de Resultados actualizado:', estadoResultados.get());
        return estadoResultados;
      } catch (error) {
        console.error('Error en actualizar Estado de Resultados:', error);
        throw error;
      }
    },
  
    obtener: async (fechaInicio, fechaFin) => {
      console.log('Obteniendo Estado de Resultados para fechas:', { fechaInicio, fechaFin });
      const estadoResultados = await EstadoResultados.findOne({
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        },
        order: [['createdAt', 'DESC']]
      });
  
      if (estadoResultados) {
        const result = {
          fechaInicio,
          fechaFin,
          ingresos: parseFloat(estadoResultados.ingresos) || 0,
          gastos: parseFloat(estadoResultados.gastos) || 0,
          utilidad: parseFloat(estadoResultados.utilidad) || 0
        };
        console.log('Estado de Resultados encontrado:', result);
        return result;
      } else {
        console.log('No se encontró Estado de Resultados, generando uno nuevo...');
        return await estadoResultados.actualizar(fechaFin);
      }
    },
  },

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
      console.log('Actualizando contabilidad por comprobante de egreso:', comprobante.id);
      try {
        await contabilidadService.libroDiario.crearAsiento(comprobante, 'EGRESO', transaction);
        await contabilidadService.planCuentas.actualizar(comprobante, 'EGRESO', transaction);
        await contabilidadService.balanceGeneral.actualizar(comprobante.fecha, transaction);
        await contabilidadService.estadoResultados.actualizar(comprobante.fecha, transaction);
        console.log('Contabilidad actualizada para comprobante de egreso:', comprobante.id);
      } catch (error) {
        console.error('Error al actualizar contabilidad para comprobante de egreso:', error);
        throw error;
      }
    },
  
    actualizarPorReciboCaja: async (reciboCaja, transaction) => {
      console.log('Actualizando contabilidad por recibo de caja:', reciboCaja.id);
      try {
        await contabilidadService.libroDiario.crearAsiento(reciboCaja, 'INGRESO', transaction);
        await contabilidadService.planCuentas.actualizar(reciboCaja, 'INGRESO', transaction);
        await contabilidadService.balanceGeneral.actualizar(reciboCaja.fecha, transaction);
        await contabilidadService.estadoResultados.actualizar(reciboCaja.fecha, transaction);
        console.log('Contabilidad actualizada para recibo de caja:', reciboCaja.id);
      } catch (error) {
        console.error('Error al actualizar contabilidad para recibo de caja:', error);
        throw error;
      }
    },
    
    actualizarPorNomina: async (nomina, transaction) => {
      console.log('Actualizando contabilidad por nómina:', nomina.id);
      try {
        await contabilidadService.libroDiario.crearAsiento(nomina, 'NOMINA', transaction);
        await contabilidadService.planCuentas.actualizar(nomina, 'NOMINA', transaction);
        await contabilidadService.balanceGeneral.actualizar(nomina.periodo, transaction);
        await contabilidadService.estadoResultados.actualizar(nomina.periodo, transaction);
        console.log('Contabilidad actualizada para nómina:', nomina.id);
      } catch (error) {
        console.error('Error al actualizar contabilidad para nómina:', error);
        throw error;
      }
    },
  
    actualizarPorFacturaCompra: async (factura, transaction) => {
      console.log('Actualizando contabilidad por factura de compra:', factura.id);
      try {
        // Asegurarse de que los valores sean numéricos
        const facturaData = {
          ...factura,
          total: parseFloat(factura.total) || 0,
          subtotal: parseFloat(factura.subtotal) || 0,
          impuestos: parseFloat(factura.impuestos) || 0
        };

        console.log('Datos de factura procesados:', facturaData);

        await contabilidadService.libroDiario.crearAsiento(facturaData, 'COMPRA', transaction);
        await contabilidadService.planCuentas.actualizar(facturaData, 'COMPRA', transaction);
        await contabilidadService.balanceGeneral.actualizar(factura.fecha, transaction);
        await contabilidadService.estadoResultados.actualizar(factura.fecha, transaction);
        console.log('Contabilidad actualizada para factura de compra:', factura.id);
      } catch (error) {
        console.error('Error al actualizar contabilidad para factura de compra:', error);
        throw error;
      }
    },
  
  
    revertirFacturaVenta: async (factura, transaction) => {
      console.log(`Revirtiendo factura de venta: ${factura.id}`);
      try {
        const cuentaVentas = await contabilidadService.auxiliares.obtenerOCrearCuenta('4010', 'Ingresos por Ventas', 'INGRESO', transaction);
        const cuentaCaja = await contabilidadService.auxiliares.obtenerOCrearCuenta('1010', 'Caja', 'ACTIVO', transaction);
        const cuentaImpuestos = await contabilidadService.auxiliares.obtenerOCrearCuenta('2110', 'Impuestos por Pagar', 'PASIVO', transaction);
  
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
        await contabilidadService.auxiliares.decrementarSaldoCuenta('1010', factura.total, transaction);
        await contabilidadService.auxiliares.decrementarSaldoCuenta('4010', factura.subtotal, transaction);
        await contabilidadService.auxiliares.decrementarSaldoCuenta('2110', factura.impuestos, transaction);
  
        // Actualizar Balance General y Estado de Resultados
        await contabilidadService.balanceGeneral.actualizar(factura.fecha, transaction);
        await contabilidadService.estadoResultados.actualizar(factura.fecha, transaction);
  
        console.log(`Factura de venta ${factura.id} revertida exitosamente`);
      } catch (error) {
        console.error('Error al revertir factura de venta:', error);
        throw error;
      }
    }
  },
  
  auxiliares: {
    decrementarSaldoCuenta: async (codigo, monto, transaction) => {
      console.log(`Decrementando saldo de cuenta ${codigo} en ${monto}`);
      try {
        const cuenta = await Cuenta.findOne({ where: { codigo }, transaction });
        if (!cuenta) {
          throw new Error(`No se encontró la cuenta con código ${codigo}`);
        }

        const montoNumerico = parseFloat(monto) || 0;
        const saldoActual = parseFloat(cuenta.saldo) || 0;
        const nuevoSaldo = saldoActual - montoNumerico;

        console.log(`Cuenta ${codigo} - Saldo actual: ${saldoActual}, Monto a decrementar: ${montoNumerico}, Nuevo saldo: ${nuevoSaldo}`);

        await cuenta.update({
          saldo: nuevoSaldo
        }, { transaction });

        return cuenta;
      } catch (error) {
        console.error(`Error al decrementar saldo de cuenta ${codigo}:`, error);
        throw error;
      }
    },

    incrementarSaldoCuenta: async (codigo, monto, transaction) => {
      console.log(`Incrementando saldo de cuenta ${codigo} en ${monto}`);
      try {
        const cuenta = await Cuenta.findOne({ where: { codigo }, transaction });
        if (!cuenta) {
          throw new Error(`No se encontró la cuenta con código ${codigo}`);
        }

        const montoNumerico = parseFloat(monto) || 0;
        const saldoActual = parseFloat(cuenta.saldo) || 0;
        const nuevoSaldo = saldoActual + montoNumerico;

        console.log(`Cuenta ${codigo} - Saldo actual: ${saldoActual}, Monto a incrementar: ${montoNumerico}, Nuevo saldo: ${nuevoSaldo}`);

        await cuenta.update({
          saldo: nuevoSaldo
        }, { transaction });

        return cuenta;
      } catch (error) {
        console.error(`Error al incrementar saldo de cuenta ${codigo}:`, error);
        throw error;
      }
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