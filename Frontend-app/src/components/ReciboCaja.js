import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios'; 
import { 
  Container, Typography, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

function ReciboCaja() {
  const [recibos, setRecibos] = useState([]);
  const [nuevoRecibo, setNuevoRecibo] = useState({
    numero: '',
    fecha: '',
    cliente: '',
    concepto: '',
    monto: ''
  });
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    fetchRecibos();
  }, []);

  const fetchRecibos = async () => {
    try {
      const res = await axiosInstance.get('/api/recibos-caja');
      setRecibos(res.data);
    } catch (error) {
      console.error('Error al obtener recibos:', error);
      setError('Error al cargar los recibos');
    }
  };

  const handleInputChange = (e) => {
    setNuevoRecibo({ ...nuevoRecibo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/recibos-caja', nuevoRecibo);
      fetchRecibos();
      setNuevoRecibo({
        numero: '',
        fecha: '',
        cliente: '',
        concepto: '',
        monto: ''
      });
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error al crear recibo:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Error al crear el recibo');
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Recibos de Caja</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Número"
              name="numero"
              value={nuevoRecibo.numero}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha"
              name="fecha"
              type="date"
              value={nuevoRecibo.fecha}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cliente"
              name="cliente"
              value={nuevoRecibo.cliente}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Concepto"
              name="concepto"
              value={nuevoRecibo.concepto}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Monto"
              name="monto"
              type="number"
              value={nuevoRecibo.monto}
              onChange={handleInputChange}
              required
            />
          </Grid>
          {/* Añade más campos según sea necesario */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Crear Recibo
            </Button>
          </Grid>
        </Grid>
      </form>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Concepto</TableCell>
              <TableCell>Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recibos.map((recibo) => (
              <TableRow key={recibo.id}>
                <TableCell>{recibo.numero}</TableCell>
                <TableCell>{new Date(recibo.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{recibo.cliente}</TableCell>
                <TableCell>{recibo.concepto}</TableCell>
                <TableCell>{recibo.monto}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">
          Recibo creado exitosamente
        </MuiAlert>
      </Snackbar>
      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}

export default ReciboCaja;