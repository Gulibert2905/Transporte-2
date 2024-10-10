import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Paper, Grid, CircularProgress } from '@mui/material';

function BalanceGeneral() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const res = await axios.get(`/api/contabilidad/balance-general?fecha=${fechaActual}`);
        console.log('Respuesta del servidor:', res.data); // Para depuración
        setBalance(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('Error al cargar el balance general: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!balance) {
    return <Typography>No hay datos de Balance General disponibles para la fecha seleccionada.</Typography>;
  }

   // Función para formatear números
   const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Balance General
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Activos: ${formatNumber(balance.activos)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Pasivos: ${formatNumber(balance.pasivos)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Patrimonio: ${formatNumber(balance.patrimonio)}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default BalanceGeneral;
