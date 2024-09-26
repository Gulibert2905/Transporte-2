import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LibroDiario() {
  const [transacciones, setTransacciones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    fecha: '',
    descripcion: '',
    referencia: '',
    movimientos: [{ cuentaId: '', monto: '', tipo: 'DEBITO' }]
  });
  const [cuentas, setCuentas] = useState([]);

  useEffect(() => {
    cargarTransacciones(currentPage);
    cargarCuentas();
  }, [currentPage]);

  const cargarTransacciones = async (page) => {
    try {
      const response = await axios.get(`/api/transacciones?page=${page}&limit=10`);
      setTransacciones(response.data.transacciones);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    }
  };

  const cargarCuentas = async () => {
    try {
      const response = await axios.get('/api/cuentas');
      setCuentas(response.data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  };

  const validarBalance = () => {
    const totalDebitos = nuevaTransaccion.movimientos
      .filter(m => m.tipo === 'DEBITO')
      .reduce((sum, m) => sum + parseFloat(m.monto || 0), 0);
    const totalCreditos = nuevaTransaccion.movimientos
      .filter(m => m.tipo === 'CREDITO')
      .reduce((sum, m) => sum + parseFloat(m.monto || 0), 0);

    return totalDebitos.toFixed(2) === totalCreditos.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarBalance()) {
      alert('Los débitos y créditos no están balanceados');
      return;
    }
    try {
      await axios.post('/api/transacciones', nuevaTransaccion);
      cargarTransacciones(currentPage);
      setNuevaTransaccion({
        fecha: '',
        descripcion: '',
        referencia: '',
        movimientos: [{ cuentaId: '', monto: '', tipo: 'DEBITO' }]
      });
    } catch (error) {
      console.error('Error al crear transacción:', error);
      alert(error.response?.data?.message || 'Error al crear la transacción');
    }
  };

  const handleMovimientoChange = (index, field, value) => {
    const nuevosMovimientos = [...nuevaTransaccion.movimientos];
    nuevosMovimientos[index][field] = value;
    setNuevaTransaccion({ ...nuevaTransaccion, movimientos: nuevosMovimientos });
  };

  const agregarMovimiento = () => {
    setNuevaTransaccion({
      ...nuevaTransaccion,
      movimientos: [...nuevaTransaccion.movimientos, { cuentaId: '', monto: '', tipo: 'DEBITO' }]
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <h2>Libro Diario</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={nuevaTransaccion.fecha}
          onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, fecha: e.target.value })}
          required
        />
        <input
          type="text"
          value={nuevaTransaccion.descripcion}
          onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, descripcion: e.target.value })}
          placeholder="Descripción"
          required
        />
        <input
          type="text"
          value={nuevaTransaccion.referencia}
          onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, referencia: e.target.value })}
          placeholder="Referencia"
        />
        {nuevaTransaccion.movimientos.map((movimiento, index) => (
          <div key={index}>
            <select
              value={movimiento.cuentaId}
              onChange={(e) => handleMovimientoChange(index, 'cuentaId', e.target.value)}
              required
            >
              <option value="">Seleccione una cuenta</option>
              {cuentas.map(cuenta => (
                <option key={cuenta.id} value={cuenta.id}>{cuenta.codigo} - {cuenta.nombre}</option>
              ))}
            </select>
            <input
              type="number"
              value={movimiento.monto}
              onChange={(e) => handleMovimientoChange(index, 'monto', e.target.value)}
              placeholder="Monto"
              required
            />
            <select
              value={movimiento.tipo}
              onChange={(e) => handleMovimientoChange(index, 'tipo', e.target.value)}
              required
            >
              <option value="DEBITO">Débito</option>
              <option value="CREDITO">Crédito</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={agregarMovimiento}>Agregar movimiento</button>
        <button type="submit">Guardar Transacción</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Referencia</th>
            <th>Movimientos</th>
          </tr>
        </thead>
        <tbody>
          {transacciones.map(transaccion => (
            <tr key={transaccion.id}>
              <td>{new Date(transaccion.fecha).toLocaleDateString()}</td>
              <td>{transaccion.descripcion}</td>
              <td>{transaccion.referencia}</td>
              <td>
                <ul>
                  {transaccion.movimientos.map(movimiento => (
                    <li key={movimiento.id}>
                      {movimiento.cuenta.nombre}: {movimiento.tipo} {movimiento.monto}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default LibroDiario;