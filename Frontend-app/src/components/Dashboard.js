import React, { useState, useEffect } from 'react';
import axiosInstance, { api } from '../axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import './Dashboard.css';


function Dashboard() {
  const [stats, setStats] = useState({
    totalViajes: 0,
    promedioTarifa: 0,
    viajesPorMes: [],
    tarifasPorPrestador: [],
    viajesPorRuta: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  if (error) return <Box m={3}><Alert severity="error">{error}</Alert></Box>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Viajes y Tarifas
      </Typography>

      {/* Estadísticas Generales */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6">Total de Viajes</Typography>
            <Typography variant="h4">{stats.totalViajes}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6">Tarifa Promedio</Typography>
            <Typography variant="h4">${stats.promedioTarifa.toFixed(2)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráfico de Viajes por Mes */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6">Viajes por Mes</Typography>
            <LineChart width={500} height={300} data={stats.viajesPorMes}>
              <XAxis dataKey="mes" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="viajes" stroke="#8884d8" />
            </LineChart>
          </Paper>
        </Grid>

        {/* Gráfico de Tarifas por Prestador */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6">Tarifas por Prestador</Typography>
            <BarChart width={500} height={300} data={stats.tarifasPorPrestador}>
              <XAxis dataKey="nombre" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Bar dataKey="tarifaPromedio" fill="#82ca9d" />
            </BarChart>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráfico de Distribución de Viajes por Ruta */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6">Distribución de Viajes por Ruta</Typography>
            <PieChart width={400} height={400}>
              <Pie
                data={stats.viajesPorRuta}
                cx={200}
                cy={200}
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="viajes"
              >
                {
                  stats.viajesPorRuta.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))
                }
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
