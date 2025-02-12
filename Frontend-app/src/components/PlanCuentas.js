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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';

function PlanCuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [nuevaCuenta, setNuevaCuenta] = useState({ codigo: '', nombre: '', tipo: 'ACTIVO' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    try {
      const response = await axiosInstance.get('/api/cuenta');
      setCuentas(response.data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      setError('Error al cargar las cuentas');
    }
  };

  const handleInputChange = (e) => {
    setNuevaCuenta({ ...nuevaCuenta, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/cuenta', nuevaCuenta);
      cargarCuentas();
      setNuevaCuenta({ codigo: '', nombre: '', tipo: 'ACTIVO' });
      setSuccess('Cuenta creada exitosamente');
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      setError('Error al crear la cuenta');
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Plan de Cuentas
      </Typography>
      
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="codigo"
                label="Código"
                value={nuevaCuenta.codigo}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="nombre"
                label="Nombre"
                value={nuevaCuenta.nombre}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="tipo"
                  value={nuevaCuenta.tipo}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="PASIVO">Pasivo</MenuItem>
                  <MenuItem value="PATRIMONIO">Patrimonio</MenuItem>
                  <MenuItem value="INGRESO">Ingreso</MenuItem>
                  <MenuItem value="GASTO">Gasto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Crear Cuenta
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cuentas.map(cuenta => (
              <TableRow key={cuenta.id}>
                <TableCell>{cuenta.codigo}</TableCell>
                <TableCell>{cuenta.nombre}</TableCell>
                <TableCell>{cuenta.tipo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Container>
  );
}

export default PlanCuentas;