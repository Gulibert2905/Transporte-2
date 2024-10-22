import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';

function BalanceGeneral() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const fechaActual = new Date().toISOString().split('T')[0];
      const res = await axios.get(`/api/contabilidad/balance-general/generar?fecha=${fechaActual}`);
      console.log('Respuesta del servidor (Balance General):', res.data);

      // Procesar los datos recibidos
      const balanceData = {
        activos: parseFloat(res.data.activos || res.data.totalActivos || 0),
        pasivos: parseFloat(res.data.pasivos || res.data.totalPasivos || 0),
        patrimonio: parseFloat(res.data.patrimonio || res.data.totalPatrimonio || 0)
      };

      console.log('Balance procesado:', balanceData);
      setBalance(balanceData);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener balance:', error);
      setError('Error al cargar el balance general: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    const intervalId = setInterval(fetchBalance, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(intervalId);
  }, []);

  const formatNumber = (value) => {
    const numero = parseFloat(value);
    return isNaN(numero) ? '0.00' : numero.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!balance) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No hay datos de Balance General disponibles.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Balance General
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Activos:
            </Typography>
            <Typography variant="h6" color={balance.activos >= 0 ? 'primary' : 'error'}>
              ${formatNumber(balance.activos)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Pasivos:
            </Typography>
            <Typography variant="h6" color={balance.pasivos >= 0 ? 'primary' : 'error'}>
              ${formatNumber(balance.pasivos)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Patrimonio:
            </Typography>
            <Typography variant="h6" color={balance.patrimonio >= 0 ? 'primary' : 'error'}>
              ${formatNumber(balance.patrimonio)}
            </Typography>
          </Grid>
        </Grid>

        {/* Mostrar la fecha del balance */}
        <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'right' }}>
          Fecha: {new Date().toLocaleDateString()}
        </Typography>
      </Paper>
    </Box>
  );
}

export default BalanceGeneral;