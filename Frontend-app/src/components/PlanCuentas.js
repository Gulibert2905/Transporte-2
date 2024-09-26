import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PlanCuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [nuevaCuenta, setNuevaCuenta] = useState({ codigo: '', nombre: '', tipo: 'ACTIVO' });

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    try {
      const response = await axios.get('/api/cuentas');
      setCuentas(response.data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/cuentas', nuevaCuenta);
      cargarCuentas();
      setNuevaCuenta({ codigo: '', nombre: '', tipo: 'ACTIVO' });
    } catch (error) {
      console.error('Error al crear cuenta:', error);
    }
  };

  return (
    <div>
      <h2>Plan de Cuentas</h2>
      <form onSubmit={handleSubmit}>
        {/* Implementa aquí los campos del formulario */}
      </form>
      <ul>
        {cuentas.map(cuenta => (
          <li key={cuenta.id}>{cuenta.codigo} - {cuenta.nombre} ({cuenta.tipo})</li>
        ))}
      </ul>
    </div>
  );
}

export default PlanCuentas;