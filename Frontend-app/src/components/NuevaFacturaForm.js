import React, { useState } from 'react';
import axios from 'axios';

function NuevaFacturaForm({ onFacturaCreada }) {
  const [factura, setFactura] = useState({
    numero: '', fecha: '', cliente: '', total: '', estado: 'PENDIENTE'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/contabilidad/facturas', factura);
      onFacturaCreada(res.data);
      setFactura({ numero: '', fecha: '', cliente: '', total: '', estado: 'PENDIENTE' });
    } catch (error) {
      console.error('Error al crear factura:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Número de factura"
        value={factura.numero}
        onChange={(e) => setFactura({...factura, numero: e.target.value})}
        required
      />
      <input
        type="date"
        value={factura.fecha}
        onChange={(e) => setFactura({...factura, fecha: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Cliente"
        value={factura.cliente}
        onChange={(e) => setFactura({...factura, cliente: e.target.value})}
        required
      />
      <input
        type="number"
        placeholder="Total"
        value={factura.total}
        onChange={(e) => setFactura({...factura, total: e.target.value})}
        required
      />
      <select
        value={factura.estado}
        onChange={(e) => setFactura({...factura, estado: e.target.value})}
      >
        <option value="PENDIENTE">Pendiente</option>
        <option value="PAGADA">Pagada</option>
        <option value="ANULADA">Anulada</option>
      </select>
      <button type="submit">Crear Factura</button>
    </form>
  );
}

export default NuevaFacturaForm;