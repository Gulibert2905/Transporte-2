import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Grid,
  Snackbar,
  Alert,
  Pagination
} from '@mui/material';

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

  const handlePageChange = (event, newPage) => {
    fetchRutas(newPage);
  };

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Rutas de Viaje</Typography>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="origen"
                label="Origen"
                value={newRuta.origen}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="destino"
                label="Destino"
                value={newRuta.destino}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                name="distancia"
                label="Distancia (km)"
                value={newRuta.distancia}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Añadir Ruta
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Distancia (km)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rutasData.rutas.map((ruta) => (
              <TableRow key={ruta.id}>
                <TableCell>{ruta.origen}</TableCell>
                <TableCell>{ruta.destino}</TableCell>
                <TableCell>{ruta.distancia}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination 
        count={rutasData.totalPages}
        page={rutasData.currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
}

export default Rutas;