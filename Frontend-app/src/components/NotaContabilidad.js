import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios'; 
import { 
  Container, Typography, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Select, 
  MenuItem, Snackbar, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const NotaContabilidad = () => {
  const [cuentas, setCuentas] = useState([]);
  const [notaContabilidad, setNotaContabilidad] = useState({
    numero: '',
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    detalles: []
  });
  const [nuevoDetalle, setNuevoDetalle] = useState({
    cuenta_id: '',
    descripcion: '',
    debito: '',
    credito: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    try {
      const response = await axiosInstance.get('/api/cuenta');
      setCuentas(response.data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  };

  const handleInputChange = (e) => {
    setNotaContabilidad({ ...notaContabilidad, [e.target.name]: e.target.value });
  };

  const handleDetalleChange = (e) => {
    setNuevoDetalle({ ...nuevoDetalle, [e.target.name]: e.target.value });
  };

  const agregarDetalle = () => {
    if (!nuevoDetalle.cuenta_id) {
      setSnackbar({ open: true, message: 'Por favor, seleccione una cuenta', severity: 'error' });
      return;
    }
    if (!nuevoDetalle.debito && !nuevoDetalle.credito) {
      setSnackbar({ open: true, message: 'Por favor, ingrese un valor para débito o crédito', severity: 'error' });
      return;
    }
    setNotaContabilidad({
      ...notaContabilidad,
      detalles: [...notaContabilidad.detalles, nuevoDetalle]
    });
    setNuevoDetalle({ cuenta_id: '', descripcion: '', debito: '', credito: '' });
  };

  const eliminarDetalle = (index) => {
    const nuevosDetalles = notaContabilidad.detalles.filter((_, i) => i !== index);
    setNotaContabilidad({ ...notaContabilidad, detalles: nuevosDetalles });
  };

  const calcularTotales = () => {
    return notaContabilidad.detalles.reduce(
      (totales, detalle) => ({
        totalDebito: totales.totalDebito + parseFloat(detalle.debito || 0),
        totalCredito: totales.totalCredito + parseFloat(detalle.credito || 0)
      }),
      { totalDebito: 0, totalCredito: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { totalDebito, totalCredito } = calcularTotales();
  
    if (notaContabilidad.detalles.length < 2) {
      setSnackbar({ open: true, message: 'Debe haber al menos dos movimientos', severity: 'error' });
      return;
    }
  
    if (Math.abs(totalDebito - totalCredito) > 0.001) {
      setSnackbar({ 
        open: true, 
        message: `El total de débitos (${totalDebito.toFixed(2)}) debe ser igual al total de créditos (${totalCredito.toFixed(2)})`, 
        severity: 'error' 
      });
      return;
    }
  
    try {
      console.log('Enviando nota de contabilidad:', notaContabilidad);
      const response = await axiosInstance.post('/api/notas-contabilidad', notaContabilidad);
      console.log('Respuesta del servidor:', response.data);
      setSnackbar({ open: true, message: 'Nota de contabilidad creada con éxito', severity: 'success' });
      setNotaContabilidad({ numero: '', fecha: new Date().toISOString().split('T')[0], concepto: '', detalles: [] });
    } catch (error) {
      console.error('Error al crear la nota de contabilidad:', error.response?.data || error.message);
      setSnackbar({ open: true, message: `Error al crear la nota de contabilidad: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

  const { totalDebito, totalCredito } = calcularTotales();
  const balanceado = totalDebito === totalCredito;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Crear Nota de Contabilidad</Typography>
      <form onSubmit={handleSubmit}>
        
        <TextField
          name="fecha"
          label="Fecha"
          type="date"
          value={notaContabilidad.fecha}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          name="concepto"
          label="Concepto"
          value={notaContabilidad.concepto}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />
        <Typography variant="h6" gutterBottom>Agregar Detalle</Typography>
        <Select
  name="cuenta_id"
  value={nuevoDetalle.cuenta_id}
  onChange={handleDetalleChange}
  fullWidth
  margin="normal"
>
  {cuentas.map((cuenta) => (
    <MenuItem key={cuenta.id} value={cuenta.id}>
      {cuenta.codigo} - {cuenta.nombre}
    </MenuItem>
  ))}
</Select>
<TextField
  name="descripcion"
  label="Descripción"
  value={nuevoDetalle.descripcion}
  onChange={handleDetalleChange}
  fullWidth
  margin="normal"
/>
<TextField
  name="debito"
  label="Débito"
  type="number"
  value={nuevoDetalle.debito}
  onChange={handleDetalleChange}
  fullWidth
  margin="normal"
/>
<TextField
  name="credito"
  label="Crédito"
  type="number"
  value={nuevoDetalle.credito}
  onChange={handleDetalleChange}
  fullWidth
  margin="normal"
/>
        <Button onClick={agregarDetalle} variant="contained" color="secondary">
          Agregar Detalle
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cuenta</TableCell>
                <TableCell>Débito</TableCell>
                <TableCell>Crédito</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notaContabilidad.detalles.map((detalle, index) => (
                <TableRow key={index}>
                  <TableCell>{cuentas.find(c => c.id === detalle.CuentaId)?.nombre}</TableCell>
                  <TableCell>{detalle.debito}</TableCell>
                  <TableCell>{detalle.credito}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => eliminarDetalle(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="h6" style={{ color: balanceado ? 'green' : 'red' }}>
          Total Débito: {totalDebito.toFixed(2)} | Total Crédito: {totalCredito.toFixed(2)}
        </Typography>
        <Button type="submit" variant="contained" color="primary" disabled={!balanceado}>
          Crear Nota de Contabilidad
        </Button>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default NotaContabilidad;