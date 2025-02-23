import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import axiosInstance from '../../utils/axios';

const tiposDocumento = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' }
];

const categorias = [
  { value: 'FIJO', label: 'Fijo' },
  { value: 'TICKET', label: 'Ticket' },
  { value: 'URBANO', label: 'Urbano' }
];

function PacienteForm({ onSuccess, setError }) {
  const [formData, setFormData] = useState({
    tipo_documento: '',
    documento: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    regimen: '',
    categoria: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/pacientes', formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el paciente');
      console.error('Error:', err);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                required
              >
                {tiposDocumento.map(tipo => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="documento"
              label="Número de Documento"
              value={formData.documento}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="nombres"
              label="Nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="apellidos"
              label="Apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="telefono"
              label="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="regimen"
              label="Régimen"
              value={formData.regimen}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                {categorias.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Registrar Paciente
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}

export default PacienteForm;