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
        const res = await axios.get('/api/contabilidad/balance-general');
        setBalance(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('Error al cargar el balance general');
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const exportPDF = () => {
    window.open('/api/contabilidad/balance-general/pdf', '_blank');
  };

  const exportExcel = () => {
    window.open('/api/contabilidad/balance-general/excel', '_blank');
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!balance) {
    return <Typography>No hay datos disponibles</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Balance General
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Activos: ${balance.activos?.toFixed(2) || '0.00'}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Pasivos: ${balance.pasivos?.toFixed(2) || '0.00'}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Patrimonio: ${balance.patrimonio?.toFixed(2) || '0.00'}</Typography>
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

export default BalanceGeneral;
