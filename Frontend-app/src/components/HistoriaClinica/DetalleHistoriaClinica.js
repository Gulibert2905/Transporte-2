import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Divider,
    CircularProgress,
    Alert,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    FileDownload as FileDownloadIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import dayjs from 'dayjs';

const DetalleHistoriaClinica = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [historia, setHistoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistoria = async () => {
            try {
                const response = await axiosInstance.get(`/historia-clinica/${id}`);
                setHistoria(response.data.data);
            } catch (err) {
                setError('Error al cargar la historia clínica');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoria();
    }, [id]);

    const handleDescargarPDF = async () => {
        try {
            const response = await axiosInstance.get(`/api/historias-clinicas/${id}/pdf`, {
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!historia) {
        return (
            <Box p={3}>
                <Alert severity="info">No se encontró la historia clínica</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3 }}>
                {/* Encabezado */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                    >
                        Volver
                    </Button>
                    <Typography variant="h5">
                        Historia Clínica #{historia.id}
                    </Typography>
                    <Box>
                        {historia.Traslado.estado !== 'FINALIZADO' && (
                            <Tooltip title="Editar">
                                <IconButton
                                    onClick={() => navigate(`/historias-clinicas/${id}/editar`)}
                                    color="primary"
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Descargar PDF">
                            <IconButton onClick={handleDescargarPDF}>
                                <FileDownloadIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Información del Paciente */}
                <Typography variant="h6" gutterBottom>
                    Datos del Paciente
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Typography>
                            <strong>Nombre:</strong> {historia.Traslado.Paciente.nombres} {historia.Traslado.Paciente.apellidos}
                        </Typography>
                        <Typography>
                            <strong>Documento:</strong> {historia.Traslado.Paciente.documento}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography>
                            <strong>Fecha:</strong> {dayjs(historia.fecha_registro).format('DD/MM/YYYY HH:mm')}
                        </Typography>
                        <Typography>
                            <strong>Médico:</strong> {historia.Medico?.nombre_completo || 'No asignado'}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Signos Vitales */}
                <Typography variant="h6" gutterBottom>
                    Signos Vitales
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Typography>
                            <strong>Presión Arterial:</strong> {historia.presion_arterial}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography>
                            <strong>Frecuencia Cardíaca:</strong> {historia.frecuencia_cardiaca}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography>
                            <strong>Saturación O2:</strong> {historia.saturacion_oxigeno}%
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography>
                            <strong>Temperatura:</strong> {historia.temperatura}°C
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography>
                            <strong>Glasgow:</strong> {historia.glasgow}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Información Clínica */}
                <Typography variant="h6" gutterBottom>
                    Información Clínica
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography>
                            <strong>Motivo del Traslado:</strong>
                        </Typography>
                        <Typography paragraph>
                            {historia.motivo_traslado}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            <strong>Condición Actual:</strong>
                        </Typography>
                        <Typography paragraph>
                            {historia.condicion_actual}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            <strong>Antecedentes:</strong>
                        </Typography>
                        <Typography paragraph>
                            {historia.antecedentes || 'No registrados'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            <strong>Medicamentos Actuales:</strong>
                        </Typography>
                        <Typography paragraph>
                            {historia.medicamentos_actuales || 'No registrados'}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Oxigenoterapia */}
                <Typography variant="h6" gutterBottom>
                    Oxigenoterapia
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Typography>
                            <strong>Requiere O2:</strong> {historia.oxigeno_suplementario ? 'Sí' : 'No'}
                        </Typography>
                    </Grid>
                    {historia.oxigeno_suplementario && (
                        <>
                            <Grid item xs={12} md={4}>
                                <Typography>
                                    <strong>Dispositivo:</strong> {historia.tipo_dispositivo_o2.replace('_', ' ')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography>
                                    <strong>Flujo:</strong> {historia.flujo_oxigeno}
                                </Typography>
                            </Grid>
                        </>
                    )}
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Procedimientos y Complicaciones */}
                <Typography variant="h6" gutterBottom>
                    Procedimientos y Evolución
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography>
                            <strong>Procedimientos Realizados:</strong>
                        </Typography>
                        <Typography paragraph>
                            {historia.procedimientos_realizados || 'No se realizaron procedimientos'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            <strong>Complicaciones:</strong>
                        </Typography>
                        <Typography paragraph>
                            {historia.complicaciones || 'Sin complicaciones'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            <strong>Estado al Llegar:</strong>
                        </Typography>
                        <Typography paragraph>
                            {historia.estado_llegada || 'No registrado'}
                        </Typography>
                    </Grid>
                </Grid>

                {/* Firmas y Responsables */}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                    Responsables
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography>
                            <strong>Médico Responsable:</strong> {historia.Medico?.nombre_completo || 'No asignado'}
                        </Typography>
                    </Grid>
                    {historia.Enfermero && (
                        <Grid item xs={12} md={6}>
                            <Typography>
                                <strong>Enfermero:</strong> {historia.Enfermero.nombre_completo}
                            </Typography>
                        </Grid>
                    )}
                </Grid>

                {/* Botones de Acción */}
                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDescargarPDF}
                        startIcon={<FileDownloadIcon />}
                    >
                        Descargar PDF
                    </Button>
                    {historia.Traslado.estado !== 'FINALIZADO' && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate(`/historias-clinicas/${id}/editar`)}
                            startIcon={<EditIcon />}
                        >
                            Editar
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default DetalleHistoriaClinica;