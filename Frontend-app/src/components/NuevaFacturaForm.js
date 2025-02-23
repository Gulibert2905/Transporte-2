import React, { useState } from 'react';
import axiosInstance from '../utils/axios'; 
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Grid,
  Snackbar,
  Alert
} from '@mui/material';

function NuevaFacturaForm({ onFacturaCreada }) {
  const [factura, setFactura] = useState({
    numero: '', 
    fecha: '', 
    cliente: '', 
    total: '', 
    estado: 'PENDIENTE'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/api/contabilidad/facturas', factura);
      onFacturaCreada(res.data);
      setFactura({ numero: '', fecha: '', cliente: '', total: '', estado: 'PENDIENTE' });
      setSuccess('Factura creada exitosamente');
    } catch (error) {
      console.error('Error al crear factura:', error);
      setError('Error al crear la factura');
    }
  };

  const handleChange = (e) => {
    setFactura({ ...factura, [e.target.name]: e.target.value });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6" gutterBottom>
        Nueva Factura
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="numero"
            label="Número de factura"
            value={factura.numero}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="fecha"
            label="Fecha"
            type="date"
            value={factura.fecha}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="cliente"
            label="Cliente"
            value={factura.cliente}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="total"
            label="Total"
            type="number"
            value={factura.total}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={factura.estado}
              onChange={handleChange}
            >
              <MenuItem value="PENDIENTE">Pendiente</MenuItem>
              <MenuItem value="PAGADA">Pagada</MenuItem>
              <MenuItem value="ANULADA">Anulada</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Crear Factura
      </Button>

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
    </Box>
  );
}

export default NuevaFacturaForm;