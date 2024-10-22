import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Paper, Grid, CircularProgress, TextField } from '@mui/material';

function EstadoResultados() {
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/contabilidad/estado-resultados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        console.log('Datos recibidos:', res.data);
        setResultados(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resultados:', error);
        setError('Error al cargar el estado de resultados: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };
    fetchResultados();
  }, [fechaInicio, fechaFin]);

  const exportPDF = () => {
    window.open(`/api/contabilidad/estado-resultados/pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, '_blank');
  };

  const exportExcel = () => {
    window.open(`/api/contabilidad/estado-resultados/excel?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, '_blank');
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  
  if (!resultados) {
    return <Typography>No hay datos disponibles</Typography>;
  }

  // Función para formatear números
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return typeof value === 'number' ? value.toFixed(2) : parseFloat(value).toFixed(2) || '0.00';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Estado de Resultados
      </Typography>

      <Box mb={3}>
        <TextField
          label="Fecha de inicio"
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Fecha de fin"
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Ingresos: ${formatNumber(resultados.ingresos)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Gastos: ${formatNumber(resultados.gastos)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Utilidad: ${formatNumber(resultados.utilidad)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="space-between">
        <Button variant="contained" color="primary" onClick={exportPDF}>
          Exportar a PDF
        </Button>
        <Button variant="contained" color="secondary" onClick={exportExcel}>
          Exportar a Excel
        </Button>
      </Box>
    </Box>
  );
}

export default EstadoResultados;