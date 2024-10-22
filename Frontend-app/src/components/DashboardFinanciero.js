import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, Paper, CircularProgress } from '@mui/material';

function DashboardFinanciero() {
  const [balanceGeneral, setBalanceGeneral] = useState(null);
  const [estadoResultados, setEstadoResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDatosFinancieros = async () => {
    try {
      setLoading(true);
      setError(null);
      const fechaActual = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const [balanceRes, estadoRes] = await Promise.all([
        axios.get(`/api/contabilidad/balance-general?fecha=${fechaActual}`),
        axios.get(`/api/contabilidad/estado-resultados?fechaInicio=${inicioMes}&fechaFin=${fechaActual}`)
      ]);

      console.log('Balance General:', balanceRes.data);
      console.log('Estado de Resultados:', estadoRes.data);

      setBalanceGeneral(balanceRes.data);
      setEstadoResultados(estadoRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener datos financieros:', error);
      setError('Error al cargar los datos financieros');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatosFinancieros();
    const intervalId = setInterval(fetchDatosFinancieros, 60000); // Actualiza cada minuto
    return () => clearInterval(intervalId);
  }, []);

  const formatNumber = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    } else if (typeof value === 'string') {
      return parseFloat(value).toFixed(2);
    }
    return '0.00';
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard Financiero
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">Balance General</Typography>
            {balanceGeneral && (
              <>
                <Typography>Activos: ${formatNumber(balanceGeneral.activos)}</Typography>
                <Typography>Pasivos: ${formatNumber(balanceGeneral.pasivos)}</Typography>
                <Typography>Patrimonio: ${formatNumber(balanceGeneral.patrimonio)}</Typography>
              </>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">Estado de Resultados</Typography>
            {estadoResultados && (
              <>
                <Typography>Ingresos: ${formatNumber(estadoResultados.ingresos)}</Typography>
                <Typography>Gastos: ${formatNumber(estadoResultados.gastos)}</Typography>
                <Typography>Utilidad: ${formatNumber(estadoResultados.utilidad)}</Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DashboardFinanciero;