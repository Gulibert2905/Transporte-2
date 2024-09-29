import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function NuevaTransaccionForm() {
  const [transaccion, setTransaccion] = useState({
    fecha: '',
    descripcion: '',
    movimientos: [{ monto: '', tipo: 'DEBITO', cuentaId: '' }]
  });
  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    try {
      const response = await axios.get('/api/cuenta');
      setCuentas(response.data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      setError('Error al cargar las cuentas');
    }
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      const newMovimientos = [...transaccion.movimientos];
      newMovimientos[index] = { ...newMovimientos[index], [name]: value };
      setTransaccion({ ...transaccion, movimientos: newMovimientos });
    } else {
      setTransaccion({ ...transaccion, [name]: value });
    }
  };

  const agregarMovimiento = () => {
    setTransaccion({
      ...transaccion,
      movimientos: [...transaccion.movimientos, { monto: '', tipo: 'DEBITO', cuentaId: '' }]
    });
  };

  const eliminarMovimiento = (index) => {
    const newMovimientos = transaccion.movimientos.filter((_, i) => i !== index);
    setTransaccion({ ...transaccion, movimientos: newMovimientos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/transacciones', transaccion);
      // Limpiar el formulario o redirigir según sea necesario
      setTransaccion({
        fecha: '',
        descripcion: '',
        movimientos: [{ monto: '', tipo: 'DEBITO', cuentaId: '' }]
      });
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error al crear transacción:', error);
      setError('Error al crear la transacción');
    }
  };

  return (
    <Container>
      <Typography variant="h4">Nueva Transacción</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              name="fecha"
              value={transaccion.fecha}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={transaccion.descripcion}
              onChange={handleInputChange}
            />
          </Grid>
          {transaccion.movimientos.map((movimiento, index) => (
            <Grid container item spacing={2} key={index}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Monto"
                  type="number"
                  name="monto"
                  value={movimiento.monto}
                  onChange={(e) => handleInputChange(e, index)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Select
                  fullWidth
                  name="tipo"
                  value={movimiento.tipo}
                  onChange={(e) => handleInputChange(e, index)}
                >
                  <MenuItem value="DEBITO">Débito</MenuItem>
                  <MenuItem value="CREDITO">Crédito</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Select
                  fullWidth
                  name="cuentaId"
                  value={movimiento.cuentaId}
                  onChange={(e) => handleInputChange(e, index)}
                >
                  {cuentas.map(cuenta => (
                    <MenuItem key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={2}>
                <IconButton onClick={() => eliminarMovimiento(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button onClick={agregarMovimiento} startIcon={<AddIcon />}>
              Agregar Movimiento
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Crear Transacción
            </Button>
          </Grid>
        </Grid>
      </form>
      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}

export default NuevaTransaccionForm;