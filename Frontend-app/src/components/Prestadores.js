import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Table, Pagination, Form, Button, Alert } from 'react-bootstrap';
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
  const [editingPrestador, setEditingPrestador] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchPrestadores = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/prestadores?page=${page}&limit=${limit}`);
      setPrestadoresData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los prestadores');
      setLoading(false);
      console.error('Error fetching prestadores:', err);
    }
  }, []);

  useEffect(() => {
    fetchPrestadores();
  }, [fetchPrestadores]);

  const onSubmit = async (data) => {
    try {
      if (editingPrestador) {
        await axios.put(`${process.env.REACT_APP_API_URL}/prestadores/${editingPrestador.nit}`, data);
        setEditingPrestador(null);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/prestadores`, data);
      }
      reset();
      fetchPrestadores();
    } catch (err) {
      setError('Error al guardar el prestador');
      console.error('Error saving prestador:', err);
    }
  };

  const handleEdit = (prestador) => {
    setEditingPrestador(prestador);
    Object.keys(prestador).forEach(key => {
      setValue(key, prestador[key]);
    });
  };

  const handleDelete = async (nit) => {
    if (window.confirm('¿Está seguro de que desea eliminar este prestador?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/prestadores/${nit}`);
        fetchPrestadores();
      } catch (err) {
        setError('Error al eliminar el prestador');
        console.error('Error deleting prestador:', err);
      }
    }
  };

  const handleCancel = () => {
    setEditingPrestador(null);
    reset();
  };

  const handlePageChange = (newPage) => {
    fetchPrestadores(newPage);
  };

  const prestadoresMemo = useMemo(() => prestadoresData.prestadores, [prestadoresData.prestadores]);

  return (
    <div className="prestadores-container">
      <h2>Prestadores de Servicio</h2>
      
      {loading && <Alert variant="info">Cargando...</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="NIT"
            {...register("nit", { required: "NIT es requerido" })}
            disabled={editingPrestador}
          />
          {errors.nit && <Form.Text className="text-danger">{errors.nit.message}</Form.Text>}
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Nombre"
            {...register("nombre", { required: "Nombre es requerido" })}
          />
          {errors.nombre && <Form.Text className="text-danger">{errors.nombre.message}</Form.Text>}
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Contacto"
            {...register("contacto", { required: "Contacto es requerido" })}
          />
          {errors.contacto && <Form.Text className="text-danger">{errors.contacto.message}</Form.Text>}
        </Form.Group>
        <Button type="submit">{editingPrestador ? 'Actualizar' : 'Añadir'} Prestador</Button>
        {editingPrestador && <Button variant="secondary" onClick={handleCancel}>Cancelar</Button>}
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>NIT</th>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prestadoresMemo.map((prestador) => (
            <tr key={prestador.nit}>
              <td>{prestador.nit}</td>
              <td>{prestador.nombre}</td>
              <td>{prestador.contacto}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(prestador)}>Editar</Button>
                <Button variant="danger" onClick={() => handleDelete(prestador.nit)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination>
        <Pagination.Prev
          onClick={() => handlePageChange(prestadoresData.currentPage - 1)}
          disabled={prestadoresData.currentPage === 1}
        />
        <Pagination.Item>{prestadoresData.currentPage}</Pagination.Item>
        <Pagination.Next
          onClick={() => handlePageChange(prestadoresData.currentPage + 1)}
          disabled={prestadoresData.currentPage === prestadoresData.totalPages}
        />
      </Pagination>
    </div>
  );
}

export default Prestadores;