import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NuevaTransaccionForm({ onTransaccionCreada }) {
  const [transaccion, setTransaccion] = useState({
    fecha: '', descripcion: '', monto: '', tipo: 'DEBITO', cuentaId: ''
  });
  const [cuentas, setCuentas] = useState([]);

  useEffect(() => {
    const fetchCuentas = async () => {
      const res = await axios.get('/api/contabilidad/cuentas');
      setCuentas(res.data);
    };
    fetchCuentas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/contabilidad/transacciones', transaccion);
      onTransaccionCreada(res.data);
      setTransaccion({ fecha: '', descripcion: '', monto: '', tipo: 'DEBITO', cuentaId: '' });
    } catch (error) {
      console.error('Error al crear transacción:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        value={transaccion.fecha}
        onChange={(e) => setTransaccion({...transaccion, fecha: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Descripción"
        value={transaccion.descripcion}
        onChange={(e) => setTransaccion({...transaccion, descripcion: e.target.value})}
        required
      />
      <input
        type="number"
        placeholder="Monto"
        value={transaccion.monto}
        onChange={(e) => setTransaccion({...transaccion, monto: e.target.value})}
        required
      />
      <select
        value={transaccion.tipo}
        onChange={(e) => setTransaccion({...transaccion, tipo: e.target.value})}
      >
        <option value="DEBITO">Débito</option>
        <option value="CREDITO">Crédito</option>
      </select>
      <select
        value={transaccion.cuentaId}
        onChange={(e) => setTransaccion({...transaccion, cuentaId: e.target.value})}
        required
      >
        <option value="">Seleccione una cuenta</option>
        {cuentas.map(cuenta => (
          <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
        ))}
      </select>
      <button type="submit">Crear Transacción</button>
    </form>
  );
}

export default NuevaTransaccionForm;