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
      
      // Obtener fecha actual y primer día del mes
      const hoy = new Date();
      const fechaActual = hoy.toISOString().split('T')[0];
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];

      // Realizar las peticiones
      const [balanceRes, estadoRes] = await Promise.all([
        axios.get(`/api/contabilidad/balance-general/generar?fecha=${fechaActual}`),
        axios.get(`/api/contabilidad/estado-resultados/generar?fechaInicio=${inicioMes}&fechaFin=${fechaActual}`)
      ]);

      console.log('Balance General recibido:', balanceRes.data);
      console.log('Estado de Resultados recibido:', estadoRes.data);

      // Validar y procesar datos del Balance General
      const balanceData = {
        activos: parseFloat(balanceRes.data.totalActivos || 0),
        pasivos: parseFloat(balanceRes.data.totalPasivos || 0),
        patrimonio: parseFloat(balanceRes.data.totalPatrimonio || 0)
      };

      // Validar y procesar datos del Estado de Resultados
      const estadoData = {
        ingresos: parseFloat(estadoRes.data.totalIngresos || 0),
        gastos: parseFloat(estadoRes.data.totalGastos || 0),
        utilidad: parseFloat(estadoRes.data.utilidad || 0)
      };

      setBalanceGeneral(balanceData);
      setEstadoResultados(estadoData);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener datos financieros:', error);
      setError(error.response?.data?.message || 'Error al cargar los datos financieros');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatosFinancieros();
    const intervalId = setInterval(fetchDatosFinancieros, 5000); // Actualizar cada 5 segundos
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
      <Container style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard Financiero
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Balance General</Typography>
            <Typography>Activos: ${formatNumber(balanceGeneral?.activos)}</Typography>
            <Typography>Pasivos: ${formatNumber(balanceGeneral?.pasivos)}</Typography>
            <Typography>Patrimonio: ${formatNumber(balanceGeneral?.patrimonio)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Estado de Resultados</Typography>
            <Typography>Ingresos: ${formatNumber(estadoResultados?.ingresos)}</Typography>
            <Typography>Gastos: ${formatNumber(estadoResultados?.gastos)}</Typography>
            <Typography>Utilidad: ${formatNumber(estadoResultados?.utilidad)}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DashboardFinanciero;