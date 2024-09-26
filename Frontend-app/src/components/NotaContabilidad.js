import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Grid,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function NotaContabilidad() {
  const [notas, setNotas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState({
    numero: '',
    fecha: '',
    concepto: '',
    detalles: []
  });
  const [nuevoDetalle, setNuevoDetalle] = useState({
    cuenta_id: '',
    descripcion: '',
    debito: '',
    credito: ''
  });

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    const res = await axios.get('/api/notas-contabilidad');
    setNotas(res.data);
  };

  const handleInputChange = (e) => {
    setNuevaNota({ ...nuevaNota, [e.target.name]: e.target.value });
  };

  const handleDetalleChange = (e) => {
    setNuevoDetalle({ ...nuevoDetalle, [e.target.name]: e.target.value });
  };

  const agregarDetalle = () => {
    setNuevaNota({
      ...nuevaNota,
      detalles: [...nuevaNota.detalles, nuevoDetalle]
    });
    setNuevoDetalle({
      cuenta_id: '',
      descripcion: '',
      debito: '',
      credito: ''
    });
  };

  const removerDetalle = (index) => {
    const nuevosDetalles = nuevaNota.detalles.filter((_, i) => i !== index);
    setNuevaNota({ ...nuevaNota, detalles: nuevosDetalles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/notas-contabilidad', nuevaNota);
    fetchNotas();
    setNuevaNota({
      numero: '',
      fecha: '',
      concepto: '',
      detalles: []
    });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Notas de Contabilidad</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Número"
              name="numero"
              value={nuevaNota.numero}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha"
              name="fecha"
              type="date"
              value={nuevaNota.fecha}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Concepto"
              name="concepto"
              multiline
              rows={4}
              value={nuevaNota.concepto}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Detalles</Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="ID Cuenta"
                  name="cuenta_id"
                  value={nuevoDetalle.cuenta_id}
                  onChange={handleDetalleChange}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={nuevoDetalle.descripcion}
                  onChange={handleDetalleChange}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  label="Débito"
                  name="debito"
                  type="number"
                  value={nuevoDetalle.debito}
                  onChange={handleDetalleChange}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  label="Crédito"
                  name="credito"
                  type="number"
                  value={nuevoDetalle.credito}
                  onChange={handleDetalleChange}
                />
              </Grid>
              <Grid item xs={2}>
                <Button onClick={agregarDetalle} variant="contained" color="secondary">
                  Agregar Detalle
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID Cuenta</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Débito</TableCell>
                    <TableCell>Crédito</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nuevaNota.detalles.map((detalle, index) => (
                    <TableRow key={index}>
                      <TableCell>{detalle.cuenta_id}</TableCell>
                      <TableCell>{detalle.descripcion}</TableCell>
                      <TableCell>{detalle.debito}</TableCell>
                      <TableCell>{detalle.credito}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => removerDetalle(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Crear Nota de Contabilidad
            </Button>
          </Grid>
        </Grid>
      </form>
      <Typography variant="h5" style={{ marginTop: '20px' }}>Notas de Contabilidad Existentes</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Concepto</TableCell>
              <TableCell>Total Débito</TableCell>
              <TableCell>Total Crédito</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notas.map((nota) => (
              <TableRow key={nota.id}>
                <TableCell>{nota.numero}</TableCell>
                <TableCell>{new Date(nota.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{nota.concepto}</TableCell>
                <TableCell>{nota.total_debito}</TableCell>
                <TableCell>{nota.total_credito}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default NotaContabilidad;