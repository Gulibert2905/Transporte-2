import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, TextField, Button, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';

const GestionCuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [nuevaCuenta, setNuevaCuenta] = useState({ codigo: '', nombre: '', tipo: '' });

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    try {
      const response = await axios.get('/api/cuenta');
      setCuentas(response.data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  };

  const handleInputChange = (e) => {
    setNuevaCuenta({ ...nuevaCuenta, [e.target.name]: e.target.value });
  };

  const crearCuenta = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/cuenta', nuevaCuenta);
      setNuevaCuenta({ codigo: '', nombre: '', tipo: '' });
      cargarCuentas();
    } catch (error) {
      console.error('Error al crear cuenta:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Gestión de Cuentas</Typography>
      <form onSubmit={crearCuenta}>
        <TextField
          name="codigo"
          label="Código"
          value={nuevaCuenta.codigo}
          onChange={handleInputChange}
          required
        />
        <TextField
          name="nombre"
          label="Nombre"
          value={nuevaCuenta.nombre}
          onChange={handleInputChange}
          required
        />
        <TextField
          name="tipo"
          label="Tipo"
          value={nuevaCuenta.tipo}
          onChange={handleInputChange}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Crear Cuenta
        </Button>
      </form>
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
            {cuentas.map((cuenta) => (
              <TableRow key={cuenta.id}>
                <TableCell>{cuenta.codigo}</TableCell>
                <TableCell>{cuenta.nombre}</TableCell>
                <TableCell>{cuenta.tipo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default GestionCuentas;