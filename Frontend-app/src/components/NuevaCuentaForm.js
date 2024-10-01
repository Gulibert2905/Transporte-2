import React, { useState } from 'react';
import axios from 'axios';
import { TextField, MenuItem, Button, Grid, Paper, Typography } from '@mui/material';

function NuevaCuentaForm({ onCuentaCreada }) {
  const [cuenta, setCuenta] = useState({ codigo: '', nombre: '', tipo: 'ACTIVO' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/cuenta', cuenta);
      onCuentaCreada(res.data);
      setCuenta({ codigo: '', nombre: '', tipo: 'ACTIVO' });
    } catch (error) {
      console.error('Error al crear cuenta:', error);
    }
  };

  return (
    <Paper elevation={3} style={{ padding: 16, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Crear Nueva Cuenta
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Código"
              value={cuenta.codigo}
              onChange={(e) => setCuenta({ ...cuenta, codigo: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre"
              value={cuenta.nombre}
              onChange={(e) => setCuenta({ ...cuenta, nombre: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Tipo de Cuenta"
              value={cuenta.tipo}
              onChange={(e) => setCuenta({ ...cuenta, tipo: e.target.value })}
            >
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="PASIVO">Pasivo</MenuItem>
              <MenuItem value="PATRIMONIO">Patrimonio</MenuItem>
              <MenuItem value="INGRESO">Ingreso</MenuItem>
              <MenuItem value="GASTO">Gasto</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Crear Cuenta
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}

export default NuevaCuentaForm;
