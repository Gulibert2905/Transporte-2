import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Paper, Grid, CircularProgress } from '@mui/material';

function EstadoResultados() {
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/contabilidad/estado-resultados');
        setResultados(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resultados:', error);
        setError('Error al cargar el estado de resultados');
        setLoading(false);
      }
    };
    fetchResultados();
  }, []);

  const exportPDF = () => {
    window.open('/api/contabilidad/estado-resultados/pdf', '_blank');
  };

  const exportExcel = () => {
    window.open('/api/contabilidad/estado-resultados/excel', '_blank');
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Estado de Resultados
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Ingresos: ${resultados.ingresos?.toFixed(2) || '0.00'}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Gastos: ${resultados.gastos?.toFixed(2) || '0.00'}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Utilidad: ${resultados.utilidad?.toFixed(2) || '0.00'}</Typography>
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