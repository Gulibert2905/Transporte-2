// components/HistoriaClinica/ListadoHistoriasClinicas.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    TextField,
    Grid,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { 
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    FileDownload as FileDownloadIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

import dayjs from 'dayjs';

const ListadoHistoriasClinicas = () => {
    const navigate = useNavigate();
    const [historias, setHistorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        fechaInicio: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        fechaFin: dayjs().format('YYYY-MM-DD'),
        paciente: ''
    });

    const fetchHistorias = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/historia-clinica', { // Cambiar a la ruta correcta
                params: {
                    fechaInicio: filtros.fechaInicio,
                    fechaFin: filtros.fechaFin,
                    paciente: filtros.paciente || undefined
                }
            });
            setHistorias(response.data.data);
        } catch (err) {
            setError('Error al cargar las historias clínicas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistorias();
    }, []);

    const handleFiltroChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value
        });
    };

    const aplicarFiltros = () => {
        fetchHistorias();
    };

    const handleVerHistoria = (id) => {
        navigate(`/historias-clinicas/${id}`);
    };

    const handleEditarHistoria = (id) => {
        navigate(`/historias-clinicas/${id}/editar`);
    };

    const handleDescargarPDF = async (id) => {
        try {
            const response = await axiosInstance.get(`/historias-clinicas/${id}/pdf`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `historia-clinica-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Error al descargar el PDF');
            console.error(err);
        }
    };

    if (loading && historias.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom>
                Historias Clínicas
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha Inicio"
                            name="fechaInicio"
                            value={filtros.fechaInicio}
                            onChange={handleFiltroChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha Fin"
                            name="fechaFin"
                            value={filtros.fechaFin}
                            onChange={handleFiltroChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Buscar por paciente"
                            name="paciente"
                            value={filtros.paciente}
                            onChange={handleFiltroChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={aplicarFiltros}
                        >
                            Buscar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabla de Historias Clínicas */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Paciente</TableCell>
                            <TableCell>Médico</TableCell>
                            <TableCell>Motivo</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {historias.map((historia) => (
                            <TableRow key={historia.id}>
                                <TableCell>
                                    {dayjs(historia.fecha_registro).format('DD/MM/YYYY HH:mm')}
                                </TableCell>
                                <TableCell>
                                    {`${historia.Traslado.Paciente.nombres} ${historia.Traslado.Paciente.apellidos}`}
                                </TableCell>
                                <TableCell>
                                    {historia.Medico?.nombre_completo || 'No asignado'}
                                </TableCell>
                                <TableCell>
                                    {historia.motivo_traslado}
                                </TableCell>
                                <TableCell>
                                    {historia.Traslado.estado}
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Ver Detalle">
                                        <IconButton 
                                            onClick={() => handleVerHistoria(historia.id)}
                                            color="primary"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {historia.Traslado.estado !== 'FINALIZADO' && (
                                        <Tooltip title="Editar">
                                            <IconButton
                                                onClick={() => handleEditarHistoria(historia.id)}
                                                color="secondary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Descargar PDF">
                                        <IconButton
                                            onClick={() => handleDescargarPDF(historia.id)}
                                        >
                                            <FileDownloadIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ListadoHistoriasClinicas;