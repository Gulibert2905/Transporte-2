import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Prestadores.css';

function Prestadores() {
  const [prestadoresData, setPrestadoresData] = useState({
    prestadores: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPrestador, setNewPrestador] = useState({ nit: '', nombre: '', contacto: '' });
  const [editingPrestador, setEditingPrestador] = useState(null);

  useEffect(() => {
    fetchPrestadores();
  }, []);

  const fetchPrestadores = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/prestadores?page=${page}&limit=${limit}`);
      setPrestadoresData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los prestadores');
      setLoading(false);
      console.error('Error fetching prestadores:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingPrestador) {
      setEditingPrestador({ ...editingPrestador, [name]: value });
    } else {
      setNewPrestador({ ...newPrestador, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPrestador.nit || !newPrestador.nombre || !newPrestador.contacto) {
      setError('Todos los campos son obligatorios');
      return;
    }
    try {
      if (editingPrestador) {
        await axios.put(`http://localhost:3000/api/prestadores/${editingPrestador.nit}`, editingPrestador);
        setEditingPrestador(null);
      } else {
        await axios.post('http://localhost:3000/api/prestadores', newPrestador);
        setNewPrestador({ nit: '', nombre: '', contacto: '' });
      }
      fetchPrestadores();
    } catch (err) {
      setError('Error al guardar el prestador');
      console.error('Error saving prestador:', err);
    }
  };

  const handleEdit = (prestador) => {
    setEditingPrestador(prestador);
  };

  const handleDelete = async (nit) => {
    if (window.confirm('¿Está seguro de que desea eliminar este prestador?')) {
      try {
        await axios.delete(`http://localhost:3000/api/prestadores/${nit}`);
        fetchPrestadores();
      } catch (err) {
        setError('Error al eliminar el prestador');
        console.error('Error deleting prestador:', err);
      }
    }
  };

  const handleCancel = () => {
    setEditingPrestador(null);
    setNewPrestador({ nit: '', nombre: '', contacto: '' });
  };

  const handlePageChange = (newPage) => {
    fetchPrestadores(newPage);
  };

  return (
    <div className="prestadores-container">
      <h2>Prestadores de Servicio</h2>
      
      {loading && <div>Cargando...</div>}
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nit"
          placeholder="NIT"
          value={editingPrestador ? editingPrestador.nit : newPrestador.nit}
          onChange={handleInputChange}
          required
          disabled={editingPrestador}
        />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={editingPrestador ? editingPrestador.nombre : newPrestador.nombre}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="contacto"
          placeholder="Contacto"
          value={editingPrestador ? editingPrestador.contacto : newPrestador.contacto}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{editingPrestador ? 'Actualizar' : 'Añadir'} Prestador</button>
        {editingPrestador && <button type="button" onClick={handleCancel}>Cancelar</button>}
      </form>

      <table>
        <thead>
          <tr>
            <th>NIT</th>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prestadoresData.prestadores.map((prestador) => (
            <tr key={prestador.nit}>
              <td>{prestador.nit}</td>
              <td>{prestador.nombre}</td>
              <td>{prestador.contacto}</td>
              <td>
                <button onClick={() => handleEdit(prestador)}>Editar</button>
                <button onClick={() => handleDelete(prestador.nit)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(prestadoresData.currentPage - 1)}
          disabled={prestadoresData.currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {prestadoresData.currentPage} de {prestadoresData.totalPages}</span>
        <button 
          onClick={() => handlePageChange(prestadoresData.currentPage + 1)}
          disabled={prestadoresData.currentPage === prestadoresData.totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Prestadores;