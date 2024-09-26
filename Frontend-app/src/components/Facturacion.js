import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Facturacion() {
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    const fetchFacturas = async () => {
      const res = await axios.get('/api/contabilidad/facturas');
      setFacturas(res.data);
    };
    fetchFacturas();
  }, []);

  return (
    <div>
      <h2>Facturación</h2>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map(f => (
            <tr key={f.id}>
              <td>{f.numero}</td>
              <td>{new Date(f.fecha).toLocaleDateString()}</td>
              <td>{f.cliente}</td>
              <td>{f.total}</td>
              <td>{f.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Facturacion;