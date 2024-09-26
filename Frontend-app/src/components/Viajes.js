import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Viajes.css';

function Viajes() {
  const [viajesData, setViajesData] = useState({
    viajes: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [prestadores, setPrestadores] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newViaje, setNewViaje] = useState({ 
    prestador_nit: '', 
    ruta_id: '', 
    fecha_viaje: '', 
    tarifa_aplicada: '' 
  });
  const [tarifaCargada, setTarifaCargada] = useState(false);
  const [filters, setFilters] = useState({
    prestador: '',
    ruta: '',
    fechaDesde: '',
    fechaHasta: '',
    tarifaMinima: '',
    tarifaMaxima: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchViajes();
    fetchPrestadores();
    fetchRutas();
  }, []);

  const fetchViajes = async (page = 1) => {
    try {
      setLoading(true);
      let url = `http://localhost:3000/api/viajes?page=${page}&limit=10`;
      
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filters.prestador) url += `&prestador=${filters.prestador}`;
      if (filters.ruta) url += `&ruta=${filters.ruta}`;
      if (filters.fechaDesde) url += `&fechaDesde=${filters.fechaDesde}`;
      if (filters.fechaHasta) url += `&fechaHasta=${filters.fechaHasta}`;
      if (filters.tarifaMinima) url += `&tarifaMinima=${filters.tarifaMinima}`;
      if (filters.tarifaMaxima) url += `&tarifaMaxima=${filters.tarifaMaxima}`;

      const response = await axios.get(url);
      setViajesData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los viajes');
      setLoading(false);
      console.error('Error fetching viajes:', err);
    }
  };

  const fetchPrestadores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/prestadores');
      setPrestadores(response.data.prestadores);
    } catch (err) {
      console.error('Error fetching prestadores:', err);
    }
  };

  const fetchRutas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rutas');
      setRutas(response.data.rutas);
    } catch (err) {
      console.error('Error fetching rutas:', err);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setNewViaje(prev => ({ ...prev, [name]: value }));

    if (name === 'prestador_nit' || name === 'ruta_id') {
      const updatedViaje = { ...newViaje, [name]: value };
      if (updatedViaje.prestador_nit && updatedViaje.ruta_id) {
        try {
          const response = await axios.get(`http://localhost:3000/api/tarifas/by-prestador-ruta`, {
            params: {
              prestador_nit: updatedViaje.prestador_nit,
              ruta_id: updatedViaje.ruta_id
            }
          });
          if (response.data && response.data.tarifa) {
            setNewViaje(prev => ({ ...prev, [name]: value, tarifa_aplicada: response.data.tarifa }));
            setTarifaCargada(true);
            setError(null);
          } else {
            setNewViaje(prev => ({ ...prev, [name]: value, tarifa_aplicada: '' }));
            setTarifaCargada(false);
            setError('No se encontró una tarifa para este prestador y ruta');
          }
        } catch (error) {
          console.error('Error al obtener la tarifa:', error);
          setNewViaje(prev => ({ ...prev, [name]: value, tarifa_aplicada: '' }));
          setTarifaCargada(false);
          setError('Error al obtener la tarifa. Por favor, intente de nuevo.');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newViaje.prestador_nit || !newViaje.ruta_id) {
      setError("Por favor, seleccione un prestador y una ruta");
      return;
    }

    if (!tarifaCargada || !newViaje.tarifa_aplicada) {
      setError("La tarifa no se ha cargado correctamente. Por favor, seleccione un prestador y una ruta válidos");
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/viajes', newViaje);
      setNewViaje({ prestador_nit: '', ruta_id: '', fecha_viaje: '', tarifa_aplicada: '' });
      setTarifaCargada(false);
      fetchViajes(1);
      setSuccess('Viaje añadido exitosamente');
      setError(null);
    } catch (err) {
      console.error('Error creating viaje:', err);
      setError('Error al crear el viaje: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePageChange = (newPage) => {
    fetchViajes(newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const applyFilters = () => {
    fetchViajes(1);
  };

  const resetFilters = () => {
    setFilters({
      prestador: '',
      ruta: '',
      fechaDesde: '',
      fechaHasta: '',
      tarifaMinima: '',
      tarifaMaxima: ''
    });
    setSearchTerm('');
    fetchViajes(1);
  };

  const exportCSV = async () => {
    try {
      let url = `http://localhost:3000/api/viajes/export/csv?`;
      if (searchTerm) url += `&search=${searchTerm}`;
      Object.keys(filters).forEach(key => {
        if (filters[key]) url += `&${key}=${filters[key]}`;
      });
      
      const response = await axios.get(url, { responseType: 'blob' });
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'viajes.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Error al exportar CSV');
    }
  };

  const exportExcel = async () => {
    try {
      let url = `http://localhost:3000/api/viajes/export/excel?`;
      if (searchTerm) url += `&search=${searchTerm}`;
      Object.keys(filters).forEach(key => {
        if (filters[key]) url += `&${key}=${filters[key]}`;
      });
      
      const response = await axios.get(url, { responseType: 'blob' });
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'viajes.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError('Error al exportar Excel');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="viajes-container">
      <h2>Viajes</h2>
      
      {/* Búsqueda y filtros */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Buscar viajes..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <select
          name="prestador"
          value={filters.prestador}
          onChange={handleFilterChange}
        >
          <option value="">Todos los prestadores</option>
          {prestadores.map(p => (
            <option key={p.nit} value={p.nit}>{p.nombre}</option>
          ))}
        </select>
        <select
          name="ruta"
          value={filters.ruta}
          onChange={handleFilterChange}
        >
          <option value="">Todas las rutas</option>
          {rutas.map(r => (
            <option key={r.id} value={r.id}>{r.origen} - {r.destino}</option>
          ))}
        </select>
        <input
          type="date"
          name="fechaDesde"
          value={filters.fechaDesde}
          onChange={handleFilterChange}
          placeholder="Fecha desde"
        />
        <input
          type="date"
          name="fechaHasta"
          value={filters.fechaHasta}
          onChange={handleFilterChange}
          placeholder="Fecha hasta"
        />
        <input
          type="number"
          name="tarifaMinima"
          value={filters.tarifaMinima}
          onChange={handleFilterChange}
          placeholder="Tarifa mínima"
        />
        <input
          type="number"
          name="tarifaMaxima"
          value={filters.tarifaMaxima}
          onChange={handleFilterChange}
          placeholder="Tarifa máxima"
        />
        <button onClick={applyFilters}>Aplicar Filtros</button>
        <button onClick={resetFilters}>Resetear Filtros</button>
      </div>

      {/* Botones de exportación */}
      <div className="export-buttons">
        <button onClick={exportCSV}>Exportar CSV</button>
        <button onClick={exportExcel}>Exportar Excel</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <select
          name="prestador_nit"
          value={newViaje.prestador_nit}
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
          value={newViaje.ruta_id}
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
          type="date"
          name="fecha_viaje"
          value={newViaje.fecha_viaje}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="tarifa_aplicada"
          placeholder="Tarifa aplicada"
          value={newViaje.tarifa_aplicada}
          readOnly
          required
        />
        {tarifaCargada && <span className="tarifa-loaded">Tarifa cargada correctamente</span>}
        <button type="submit">Añadir Viaje</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Prestador</th>
            <th>Ruta</th>
            <th>Fecha</th>
            <th>Tarifa Aplicada</th>
          </tr>
        </thead>
        <tbody>
          {viajesData.viajes.map((viaje) => (
            <tr key={viaje.id}>
              <td>{viaje.Prestador?.nombre || 'N/A'}</td>
              <td>{viaje.Ruta ? `${viaje.Ruta.origen} - ${viaje.Ruta.destino}` : 'N/A'}</td>
              <td>{new Date(viaje.fecha_viaje).toLocaleDateString()}</td>
              <td>${viaje.tarifa_aplicada}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(viajesData.currentPage - 1)}
          disabled={viajesData.currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {viajesData.currentPage} de {viajesData.totalPages}</span>
        <button 
          onClick={() => handlePageChange(viajesData.currentPage + 1)}
          disabled={viajesData.currentPage === viajesData.totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Viajes;