import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tarifas.css';

function Tarifas() {
  const [tarifasData, setTarifasData] = useState({
    tarifas: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [prestadores, setPrestadores] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newTarifa, setNewTarifa] = useState({ prestador_nit: '', ruta_id: '', tarifa: '' });

  useEffect(() => {
    fetchTarifas();
    fetchPrestadores();
    fetchRutas();
  }, []);

  const fetchTarifas = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/tarifas?page=${page}&limit=${limit}`);
      setTarifasData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las tarifas');
      setLoading(false);
      console.error('Error fetching tarifas:', err);
    }
  };

  const fetchPrestadores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/prestadores');
      setPrestadores(response.data.prestadores);
    } catch (err) {
      console.error('Error fetching prestadores:', err);
      setError('Error al cargar los prestadores');
    }
  };

  const fetchRutas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rutas');
      setRutas(response.data.rutas);
    } catch (err) {
      console.error('Error fetching rutas:', err);
      setError('Error al cargar las rutas');
    }
  };

  const handleInputChange = (e) => {
    setNewTarifa({ ...newTarifa, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/tarifas', newTarifa);
      setNewTarifa({ prestador_nit: '', ruta_id: '', tarifa: '' });
      fetchTarifas(1); // Refetch first page after adding new tarifa
      setSuccess('Tarifa añadida exitosamente');
      setError(null);
    } catch (err) {
      console.error('Error creating tarifa:', err);
      if (err.response && err.response.status === 400) {
        setError('Ya existe una tarifa para este prestador y ruta');
      } else {
        setError('Error al crear la tarifa');
      }
      setSuccess(null);
    }
  };

  const handlePageChange = (newPage) => {
    fetchTarifas(newPage);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="tarifas-container">
      <h2>Tarifas</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <select
          name="prestador_nit"
          value={newTarifa.prestador_nit}
          onChange={handleInputChange}
          required
        >
          <option value="">Seleccione un prestador</option>
          {prestadores.map((prestador) => (
            <option key={prestador.nit} value={prestador.nit}>
              {prestador.nombre}
            </option>
          ))}
        </select>
        <select
          name="ruta_id"
          value={newTarifa.ruta_id}
          onChange={handleInputChange}
          required
        >
          <option value="">Seleccione una ruta</option>
          {rutas.map((ruta) => (
            <option key={ruta.id} value={ruta.id}>
              {ruta.origen} - {ruta.destino}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="tarifa"
          placeholder="Tarifa"
          value={newTarifa.tarifa}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Añadir Tarifa</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Prestador</th>
            <th>Ruta</th>
            <th>Tarifa</th>
          </tr>
        </thead>
        <tbody>
          {tarifasData.tarifas.map((tarifa) => (
            <tr key={tarifa.id}>
              <td>{tarifa.prestador_nombre || tarifa.Prestador?.nombre || 'N/A'}</td>
              <td>{(tarifa.origen && tarifa.destino) ? `${tarifa.origen} - ${tarifa.destino}` : 
                  (tarifa.Ruta ? `${tarifa.Ruta.origen} - ${tarifa.Ruta.destino}` : 'N/A')}</td>
              <td>${tarifa.tarifa}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(tarifasData.currentPage - 1)}
          disabled={tarifasData.currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {tarifasData.currentPage} de {tarifasData.totalPages}</span>
        <button 
          onClick={() => handlePageChange(tarifasData.currentPage + 1)}
          disabled={tarifasData.currentPage === tarifasData.totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Tarifas;