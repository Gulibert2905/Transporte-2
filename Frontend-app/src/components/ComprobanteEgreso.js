import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios'; 
import {
  Container, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Snackbar,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

function ComprobanteEgreso() {
  const [comprobantes, setComprobantes] = useState([]);
  const [nuevoComprobante, setNuevoComprobante] = useState({
    numero: '',
    fecha: '',
    beneficiario: '',
    concepto: '',
    monto: '',
    tipoEgreso: '',
    nomina_id: '',
    factura_compra_id: ''
  });
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchComprobantes();
  }, []);

  const fetchComprobantes = async () => {
    try {
      const res = await axiosInstance.get('/api/comprobantes-egreso');
      setComprobantes(res.data);
    } catch (error) {
      console.error('Error al obtener comprobantes:', error);
      setError('Error al cargar los comprobantes');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoComprobante(prev => ({ ...prev, [name]: value }));
    
    // Limpiar campos relacionados cuando se cambia el tipo de egreso
    if (name === 'tipoEgreso') {
      setNuevoComprobante(prev => ({
        ...prev,
        [name]: value,
        nomina_id: '',
        factura_compra_id: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/comprobantes-egreso', nuevoComprobante);
      fetchComprobantes();
      setNuevoComprobante({
        numero: '',
        fecha: '',
        beneficiario: '',
        concepto: '',
        monto: '',
        tipoEgreso: '',
        nomina_id: '',
        factura_compra_id: ''
      });
      setSnackbarMessage('Comprobante creado exitosamente');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error al crear comprobante:', error.response?.data || error.message);
      setSnackbarMessage(error.response?.data?.message || 'Error al crear el comprobante');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
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
      <Typography variant="h4" gutterBottom>Comprobantes de Egreso</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Número"
              name="numero"
              value={nuevoComprobante.numero}
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
              value={nuevoComprobante.fecha}
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
              label="Beneficiario"
              name="beneficiario"
              value={nuevoComprobante.beneficiario}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Concepto"
              name="concepto"
              value={nuevoComprobante.concepto}
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
              value={nuevoComprobante.monto}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Egreso</InputLabel>
              <Select
                name="tipoEgreso"
                value={nuevoComprobante.tipoEgreso}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="NOMINA">Nómina</MenuItem>
                <MenuItem value="FACTURA_COMPRA">Factura de Compra</MenuItem>
                <MenuItem value="OTRO">Otro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {nuevoComprobante.tipoEgreso === 'NOMINA' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID de Nómina"
                name="nomina_id"
                type="number"
                value={nuevoComprobante.nomina_id}
                onChange={handleInputChange}
                required
              />
            </Grid>
          )}
          {nuevoComprobante.tipoEgreso === 'FACTURA_COMPRA' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID de Factura de Compra"
                name="factura_compra_id"
                type="number"
                value={nuevoComprobante.factura_compra_id}
                onChange={handleInputChange}
                required
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Crear Comprobante
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
              <TableCell>Beneficiario</TableCell>
              <TableCell>Concepto</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Tipo de Egreso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comprobantes.map((comprobante) => (
              <TableRow key={comprobante.id}>
                <TableCell>{comprobante.numero}</TableCell>
                <TableCell>{new Date(comprobante.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{comprobante.beneficiario}</TableCell>
                <TableCell>{comprobante.concepto}</TableCell>
                <TableCell>{comprobante.monto}</TableCell>
                <TableCell>{comprobante.tipoEgreso}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}

export default ComprobanteEgreso;