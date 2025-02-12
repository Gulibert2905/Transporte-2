// src/components/Nomina.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios'; 
import { 
  Container, Typography, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Grid 
} from '@mui/material';

function Nomina() {
  const [nominas, setNominas] = useState([]);
  const [nuevaNomina, setNuevaNomina] = useState({
    empleado_id: '',
    periodo: '',
    salario_base: '',
    deducciones: '',
    bonificaciones: ''
  });

  useEffect(() => {
    fetchNominas();
  }, []);

  const fetchNominas = async () => {
    const res = await axiosInstance.get('/api/nominas');
    setNominas(res.data);
  };

  const handleInputChange = (e) => {
    setNuevaNomina({ ...nuevaNomina, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(nuevaNomina);  // Para verificar el contenido
    try {
      await axiosInstance.post('/api/nominas', nuevaNomina);
      fetchNominas();
      setNuevaNomina({
        empleado_id: '',
        periodo: '',
        salario_base: '',
        deducciones: '',
        bonificaciones: ''
      });
    } catch (err) {
      console.error('Error al crear la nómina:', err);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Nómina</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ID del Empleado"
              name="empleado_id"
              value={nuevaNomina.empleado_id}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Periodo"
              name="periodo"
              type="date"
              value={nuevaNomina.periodo}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Salario Base"
              name="salario_base"
              type="number"
              value={nuevaNomina.salario_base}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Deducciones"
              name="deducciones"
              type="number"
              value={nuevaNomina.deducciones}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Bonificaciones"
              name="bonificaciones"
              type="number"
              value={nuevaNomina.bonificaciones}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Crear Nómina
            </Button>
          </Grid>
        </Grid>
      </form>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Empleado</TableCell>
              <TableCell>Periodo</TableCell>
              <TableCell>Salario Base</TableCell>
              <TableCell>Deducciones</TableCell>
              <TableCell>Bonificaciones</TableCell>
              <TableCell>Total a Pagar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nominas.map((nomina) => (
              <TableRow key={nomina.id}>
                <TableCell>{nomina.empleado_id}</TableCell>
                <TableCell>{new Date(nomina.periodo).toLocaleDateString()}</TableCell>
                <TableCell>{nomina.salario_base}</TableCell>
                <TableCell>{nomina.deducciones}</TableCell>
                <TableCell>{nomina.bonificaciones}</TableCell>
                <TableCell>{nomina.total_pagar}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Nomina;