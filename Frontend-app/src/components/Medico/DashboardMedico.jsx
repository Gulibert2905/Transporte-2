import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    CircularProgress,
    Alert,
    Snackbar 
} from '@mui/material';
import axiosInstance from '../../utils/axios';
import ListadoHistoriasClinicas from '../HistoriaClinica/ListadoHistoriasClinicas';

const DashboardMedico = () => {
    const [stats, setStats] = useState({
        totalPacientes: 0,
        consultasHoy: 0,
        pendientes: 0
    });
    const [trasladosPendientes, setTrasladosPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);   

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/medico/dashboard');
                if (response.data.success) {
                    setStats(response.data.data.stats);
                    setTrasladosPendientes(response.data.data.trasladosPendientes);
                } else {
                    setError('Error al cargar datos');
                }
            } catch (error) {
                console.error('Error detallado:', error);
                setError(error.response?.data?.message || 'Error al cargar datos del dashboard');
            } finally {
                setLoading(false);
            }
        };
    
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Snackbar 
                    open={Boolean(success)} 
                    autoHideDuration={6000} 
                    onClose={() => setSuccess(null)}
                >
                    <Alert severity="success" onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                </Snackbar>
            )}

            <Typography variant="h4" gutterBottom>
                Dashboard Médico
            </Typography>

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Total Pacientes</Typography>
                        <Typography variant="h3">{stats.totalPacientes}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Consultas Hoy</Typography>
                        <Typography variant="h3">{stats.consultasHoy}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Historias Pendientes</Typography>
                        <Typography variant="h3">{stats.pendientes}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom>
                Traslados Pendientes de Historia Clínica
            </Typography>

            <ListadoHistoriasClinicas 
                traslados={trasladosPendientes}
                setError={setError}
                setSuccess={setSuccess}
            />
        </Box>
    );
};

export default DashboardMedico;