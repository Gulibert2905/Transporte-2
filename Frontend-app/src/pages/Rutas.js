import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Rutas.css';

function Rutas() {
  const [rutasData, setRutasData] = useState({
    rutas: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRuta, setNewRuta] = useState({ origen: '', destino: '', distancia: '' });

  useEffect(() => {
    fetchRutas();
  }, []);

  const fetchRutas = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/rutas?page=${page}&limit=${limit}`);
      setRutasData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las rutas');
      setLoading(false);
      console.error('Error fetching rutas:', err);
    }
  };

  const handleInputChange = (e) => {
    setNewRuta({ ...newRuta, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/rutas', newRuta);
      setNewRuta({ origen: '', destino: '', distancia: '' });
      fetchRutas();
    } catch (err) {
      setError('Error al crear la ruta');
      console.error('Error creating ruta:', err);
    }
  };

  const handlePageChange = (newPage) => {
    fetchRutas(newPage);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="rutas-container">
      <h2>Rutas de Viaje</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="origen"
          placeholder="Origen"
          value={newRuta.origen}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="destino"
          placeholder="Destino"
          value={newRuta.destino}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="distancia"
          placeholder="Distancia (km)"
          value={newRuta.distancia}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Añadir Ruta</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Origen</th>
            <th>Destino</th>
            <th>Distancia (km)</th>
          </tr>
        </thead>
        <tbody>
          {rutasData.rutas.map((ruta) => (
            <tr key={ruta.id}>
              <td>{ruta.origen}</td>
              <td>{ruta.destino}</td>
              <td>{ruta.distancia}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(rutasData.currentPage - 1)}
          disabled={rutasData.currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {rutasData.currentPage} de {rutasData.totalPages}</span>
        <button 
          onClick={() => handlePageChange(rutasData.currentPage + 1)}
          disabled={rutasData.currentPage === rutasData.totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Rutas;