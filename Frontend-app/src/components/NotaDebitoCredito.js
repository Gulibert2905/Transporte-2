import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios'; 
import { 
  Container, Typography, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Grid, 
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

function NotaDebitoCredito() {
  const [notas, setNotas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState({
    numero: '',
    fecha: '',
    tipo: 'DEBITO',
    concepto: '',
    monto: '',
    factura_compra_id: ''
  });

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    const res = await axiosInstance.get('/api/notas-debito-credito');
    setNotas(res.data);
  };

  const handleInputChange = (e) => {
    setNuevaNota({ ...nuevaNota, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axiosInstance.post('/api/notas-debito-credito', nuevaNota);
    fetchNotas();
    setNuevaNota({
      numero: '',
      fecha: '',
      tipo: 'DEBITO',
      concepto: '',
      monto: '',
      factura_compra_id: ''
    });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Notas Débito y Crédito</Typography>
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                name="tipo"
                value={nuevaNota.tipo}
                onChange={handleInputChange}
              >
                <MenuItem value="DEBITO">Débito</MenuItem>
                <MenuItem value="CREDITO">Crédito</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Monto"
              name="monto"
              type="number"
              value={nuevaNota.monto}
              onChange={handleInputChange}
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
            <TextField
              fullWidth
              label="ID de Factura de Compra"
              name="factura_compra_id"
              value={nuevaNota.factura_compra_id}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Crear Nota
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
              <TableCell>Tipo</TableCell>
              <TableCell>Concepto</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>ID Factura</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notas.map((nota) => (
              <TableRow key={nota.id}>
                <TableCell>{nota.numero}</TableCell>
                <TableCell>{new Date(nota.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{nota.tipo}</TableCell>
                <TableCell>{nota.concepto}</TableCell>
                <TableCell>{nota.monto}</TableCell>
                <TableCell>{nota.factura_compra_id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default NotaDebitoCredito;