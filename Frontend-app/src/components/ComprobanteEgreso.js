// src/components/ComprobanteEgreso.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Grid 
} from '@mui/material';

function ComprobanteEgreso() {
  const [comprobantes, setComprobantes] = useState([]);
  const [nuevoComprobante, setNuevoComprobante] = useState({
    numero: '',
    fecha: '',
    beneficiario: '',
    concepto: '',
    monto: '',
    nomina_id: '',
    factura_compra_id: ''
  });

  useEffect(() => {
    fetchComprobantes();
  }, []);

  const fetchComprobantes = async () => {
    const res = await axios.get('/api/comprobantes-egreso');
    setComprobantes(res.data);
  };

  const handleInputChange = (e) => {
    setNuevoComprobante({ ...nuevoComprobante, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/comprobantes-egreso', nuevoComprobante);
    fetchComprobantes();
    setNuevoComprobante({
      numero: '',
      fecha: '',
      beneficiario: '',
      concepto: '',
      monto: '',
      nomina_id: '',
      factura_compra_id: ''
    });
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
            />
          </Grid>
          {/* Añade más campos según sea necesario */}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default ComprobanteEgreso;