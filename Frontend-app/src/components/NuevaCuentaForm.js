import React, { useState } from 'react';
import axios from 'axios';

function NuevaCuentaForm({ onCuentaCreada }) {
  const [cuenta, setCuenta] = useState({ codigo: '', nombre: '', tipo: 'ACTIVO' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/contabilidad/cuentas', cuenta);
      onCuentaCreada(res.data);
      setCuenta({ codigo: '', nombre: '', tipo: 'ACTIVO' });
    } catch (error) {
      console.error('Error al crear cuenta:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Código"
        value={cuenta.codigo}
        onChange={(e) => setCuenta({...cuenta, codigo: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Nombre"
        value={cuenta.nombre}
        onChange={(e) => setCuenta({...cuenta, nombre: e.target.value})}
        required
      />
      <select
        value={cuenta.tipo}
        onChange={(e) => setCuenta({...cuenta, tipo: e.target.value})}
      >
        <option value="ACTIVO">Activo</option>
        <option value="PASIVO">Pasivo</option>
        <option value="PATRIMONIO">Patrimonio</option>
        <option value="INGRESO">Ingreso</option>
        <option value="GASTO">Gasto</option>
      </select>
      <button type="submit">Crear Cuenta</button>
    </form>
  );
}

 export default NuevaCuentaForm;