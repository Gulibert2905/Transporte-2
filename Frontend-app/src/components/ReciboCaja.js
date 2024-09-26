// src/components/ReciboCaja.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Grid 
} from '@mui/material';

function ReciboCaja() {
  const [recibos, setRecibos] = useState([]);
  const [nuevoRecibo, setNuevoRecibo] = useState({
    numero: '',
    fecha: '',
    cliente: '',
    concepto: '',
    monto: ''
  });

  useEffect(() => {
    fetchRecibos();
  }, []);

  const fetchRecibos = async () => {
    const res = await axios.get('/api/recibos-caja');
    setRecibos(res.data);
  };

  const handleInputChange = (e) => {
    setNuevoRecibo({ ...nuevoRecibo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/recibos-caja', nuevoRecibo);
    fetchRecibos();
    setNuevoRecibo({
      numero: '',
      fecha: '',
      cliente: '',
      concepto: '',
      monto: ''
    });
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
    </Container>
  );
}

export default ReciboCaja;