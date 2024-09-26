import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, Button, Typography, Alert, Pagination, CircularProgress 
} from '@mui/material';

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

  const handlePageChange = (event, newPage) => {
    fetchPrestadores(newPage);
  };

  const prestadoresMemo = useMemo(() => prestadoresData.prestadores, [prestadoresData.prestadores]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Prestadores de Servicio</Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mb={2}>
          <TextField
            fullWidth
            label="NIT"
            {...register("nit", { required: "NIT es requerido" })}
            disabled={editingPrestador}
            error={!!errors.nit}
            helperText={errors.nit?.message}
          />
        </Box>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Nombre"
            {...register("nombre", { required: "Nombre es requerido" })}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
          />
        </Box>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Contacto"
            {...register("contacto", { required: "Contacto es requerido" })}
            error={!!errors.contacto}
            helperText={errors.contacto?.message}
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          {editingPrestador ? 'Actualizar' : 'Añadir'} Prestador
        </Button>
        {editingPrestador && (
          <Button variant="outlined" onClick={handleCancel} sx={{ ml: 2 }}>
            Cancelar
          </Button>
        )}
      </form>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>NIT</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prestadoresMemo.map((prestador) => (
              <TableRow key={prestador.nit}>
                <TableCell>{prestador.nit}</TableCell>
                <TableCell>{prestador.nombre}</TableCell>
                <TableCell>{prestador.contacto}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleEdit(prestador)}>Editar</Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(prestador.nit)} sx={{ ml: 2 }}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} display="flex" justifyContent="center">
        <Pagination 
          count={prestadoresData.totalPages} 
          page={prestadoresData.currentPage} 
          onChange={handlePageChange}
        />
      </Box>
    </Box>
  );
}

export default Prestadores;
