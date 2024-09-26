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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Pagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function LibroDiario() {
  const [transacciones, setTransacciones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    fecha: '',
    descripcion: '',
    referencia: '',
    movimientos: [{ cuentaId: '', monto: '', tipo: 'DEBITO' }]
  });
  const [cuentas, setCuentas] = useState([]);

  useEffect(() => {
    cargarTransacciones(currentPage);
    cargarCuentas();
  }, [currentPage]);

  const cargarTransacciones = async (page) => {
    try {
      const response = await axios.get(`/api/transacciones?page=${page}&limit=10`);
      setTransacciones(response.data.transacciones);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    }
  };

  const cargarCuentas = async () => {
    try {
      const response = await axios.get('/api/cuentas');
      setCuentas(response.data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  };

  const validarBalance = () => {
    const totalDebitos = nuevaTransaccion.movimientos
      .filter(m => m.tipo === 'DEBITO')
      .reduce((sum, m) => sum + parseFloat(m.monto || 0), 0);
    const totalCreditos = nuevaTransaccion.movimientos
      .filter(m => m.tipo === 'CREDITO')
      .reduce((sum, m) => sum + parseFloat(m.monto || 0), 0);

    return totalDebitos.toFixed(2) === totalCreditos.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarBalance()) {
      alert('Los débitos y créditos no están balanceados');
      return;
    }
    try {
      await axios.post('/api/transacciones', nuevaTransaccion);
      cargarTransacciones(currentPage);
      setNuevaTransaccion({
        fecha: '',
        descripcion: '',
        referencia: '',
        movimientos: [{ cuentaId: '', monto: '', tipo: 'DEBITO' }]
      });
    } catch (error) {
      console.error('Error al crear transacción:', error);
      alert(error.response?.data?.message || 'Error al crear la transacción');
    }
  };

  const handleMovimientoChange = (index, field, value) => {
    const nuevosMovimientos = [...nuevaTransaccion.movimientos];
    nuevosMovimientos[index][field] = value;
    setNuevaTransaccion({ ...nuevaTransaccion, movimientos: nuevosMovimientos });
  };

  const agregarMovimiento = () => {
    setNuevaTransaccion({
      ...nuevaTransaccion,
      movimientos: [...nuevaTransaccion.movimientos, { cuentaId: '', monto: '', tipo: 'DEBITO' }]
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Libro Diario
      </Typography>
      
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha"
                value={nuevaTransaccion.fecha}
                onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, fecha: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Descripción"
                value={nuevaTransaccion.descripcion}
                onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, descripcion: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Referencia"
                value={nuevaTransaccion.referencia}
                onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, referencia: e.target.value })}
              />
            </Grid>
          </Grid>
          
          {nuevaTransaccion.movimientos.map((movimiento, index) => (
            <Grid container spacing={3} key={index} style={{ marginTop: '10px' }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Cuenta</InputLabel>
                  <Select
                    value={movimiento.cuentaId}
                    onChange={(e) => handleMovimientoChange(index, 'cuentaId', e.target.value)}
                    required
                  >
                    <MenuItem value="">Seleccione una cuenta</MenuItem>
                    {cuentas.map(cuenta => (
                      <MenuItem key={cuenta.id} value={cuenta.id}>{cuenta.codigo} - {cuenta.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Monto"
                  value={movimiento.monto}
                  onChange={(e) => handleMovimientoChange(index, 'monto', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={movimiento.tipo}
                    onChange={(e) => handleMovimientoChange(index, 'tipo', e.target.value)}
                    required
                  >
                    <MenuItem value="DEBITO">Débito</MenuItem>
                    <MenuItem value="CREDITO">Crédito</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          ))}
          
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={agregarMovimiento}
            style={{ marginTop: '20px' }}
          >
            Agregar movimiento
          </Button>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            style={{ marginTop: '20px', marginLeft: '10px' }}
          >
            Guardar Transacción
          </Button>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell>Movimientos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transacciones.map(transaccion => (
              <TableRow key={transaccion.id}>
                <TableCell>{new Date(transaccion.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{transaccion.descripcion}</TableCell>
                <TableCell>{transaccion.referencia}</TableCell>
                <TableCell>
                  <ul>
                    {transaccion.movimientos.map(movimiento => (
                      <li key={movimiento.id}>
                        {movimiento.cuenta.nombre}: {movimiento.tipo} {movimiento.monto}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination 
        count={totalPages} 
        page={currentPage} 
        onChange={(event, value) => handlePageChange(value)}
        style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
}

export default LibroDiario;