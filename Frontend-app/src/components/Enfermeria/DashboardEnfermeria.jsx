import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import axiosInstance from '../../utils/axios';

const DashboardEnfermeria = () => {
    const [stats, setStats] = useState({
        pacientesActivos: 0,
        signosVitalesHoy: 0,
        pendientes: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosInstance.get('/api/enfermeria/dashboard');
                setStats(response.data.data);
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard Enfermería
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Pacientes Activos</Typography>
                        <Typography variant="h3">{stats.pacientesActivos}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Signos Vitales Hoy</Typography>
                        <Typography variant="h3">{stats.signosVitalesHoy}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Pendientes</Typography>
                        <Typography variant="h3">{stats.pendientes}</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardEnfermeria;