import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Snackbar,
  Alert,
  Pagination
} from '@mui/material';


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
      const response = await axiosInstance.get(`/tarifas`, {
        params: { page, limit }
      });
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
      const response = await axiosInstance.get('/prestadores');
      setPrestadores(response.data.prestadores);
    } catch (err) {
      console.error('Error fetching prestadores:', err);
      setError('Error al cargar los prestadores');
    }
  };

  const fetchRutas = async () => {
    try {
      const response = await axiosInstance.get('/rutas');
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
      await axiosInstance.post('/tarifas', newTarifa);
      setNewTarifa({ prestador_nit: '', ruta_id: '', tarifa: '' });
      fetchTarifas(1);
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
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Tarifas</Typography>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Prestador</InputLabel>
                <Select
                  name="prestador_nit"
                  value={newTarifa.prestador_nit}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="">Seleccione un prestador</MenuItem>
                  {prestadores.map((prestador) => (
                    <MenuItem key={prestador.nit} value={prestador.nit}>
                      {prestador.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Ruta</InputLabel>
                <Select
                  name="ruta_id"
                  value={newTarifa.ruta_id}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="">Seleccione una ruta</MenuItem>
                  {rutas.map((ruta) => (
                    <MenuItem key={ruta.id} value={ruta.id}>
                      {ruta.origen} - {ruta.destino}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                name="tarifa"
                label="Tarifa"
                value={newTarifa.tarifa}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Añadir Tarifa
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Prestador</TableCell>
              <TableCell>Ruta</TableCell>
              <TableCell>Tarifa</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tarifasData.tarifas.map((tarifa) => (
              <TableRow key={tarifa.id}>
                <TableCell>{tarifa.prestador_nombre || tarifa.Prestador?.nombre || 'N/A'}</TableCell>
                <TableCell>
                  {(tarifa.origen && tarifa.destino) 
                    ? `${tarifa.origen} - ${tarifa.destino}` 
                    : (tarifa.Ruta ? `${tarifa.Ruta.origen} - ${tarifa.Ruta.destino}` : 'N/A')}
                </TableCell>
                <TableCell>${tarifa.tarifa}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination 
        count={tarifasData.totalPages}
        page={tarifasData.currentPage}
        onChange={(event, value) => handlePageChange(value)}
        color="primary"
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
}

export default Tarifas;