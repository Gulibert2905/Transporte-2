    import React, { useState, useEffect, useCallback } from 'react';
    import {
        Box,
        Paper,
        Typography,
        Button,
        Table,
        TableBody,
        TableCell,
        TableContainer,
        TableHead,
        TableRow,
        IconButton,
        Tooltip,
        CircularProgress,
        Alert
    } from '@mui/material';
    import {
        Add as AddIcon,
        Visibility as VisibilityIcon,
        Edit as EditIcon,
    } from '@mui/icons-material';
    import { useNavigate } from 'react-router-dom';
    import axiosInstance from '../../utils/axios';

    const HistoriasClinicasList = ({ traslados = [], onUpdate, setError, setSuccess }) => {
        const navigate = useNavigate();
        const [historiasClinicas, setHistoriasClinicas] = useState([]);
        const [loading, setLoading] = useState(false);

        const fetchHistoriasClinicas = useCallback(async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/historia-clinica', {
                    params: {
                        tipo: 'TRASLADO'
                    }
                });
                
                if (response.data.success) {
                    setHistoriasClinicas(Array.isArray(response.data.data) ? response.data.data : []);
                } else {
                    setError(response.data.message || 'Error al cargar historias clínicas');
                }
            } catch (err) {
                console.error('Error al cargar historias clínicas:', err);
                setError(err.response?.data?.message || 'Error al cargar las historias clínicas');
                setHistoriasClinicas([]);
            } finally {
                setLoading(false);
            }
        }, [setError]);

        useEffect(() => {
            // Cargar siempre, sin depender de traslados
            fetchHistoriasClinicas();
        }, [fetchHistoriasClinicas]); 

        const handleCrearHistoria = async (trasladoId) => {
            try {
                // Verificar primero si ya existe una historia clínica
                const response = await axiosInstance.get(`/api/historia-clinica/verificar/${trasladoId}`);
                
                if (response.data.exists) {
                    setError('Ya existe una historia clínica para este traslado');
                    return;
                }
                
                // Si no existe, navegar al formulario de creación
                navigate(`/historia-clinica/crear/${trasladoId}`);
            } catch (error) {
                console.error('Error:', error);
                setError('Error al verificar historia clínica');
            }
        };

        const handleVerHistoria = (historiaId) => {
            navigate(`/historia-clinica/${historiaId}`);
        };

        const handleEditarHistoria = (historiaId) => {
            navigate(`/historia-clinica/${historiaId}/editar`);
        };

        if (loading) {
            return (
                <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                </Box>
            );
        }

        const trasladosAmbulancia = traslados.filter(t => t.tipo_servicio === 'AMBULANCIA');

        if (trasladosAmbulancia.length === 0) {
            return (
                <Alert severity="info" sx={{ m: 2 }}>
                    No hay traslados en ambulancia disponibles
                </Alert>
            );
        }

        return (
            <Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Paciente</TableCell>
                                <TableCell>Tipo Traslado</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Historia Clínica</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trasladosAmbulancia.map((traslado) => {
                                const historiaClinica = Array.isArray(historiasClinicas) ? 
                                    historiasClinicas.find(h => h.traslado_id === traslado.id) : 
                                    null;

                                return (
                                    <TableRow key={traslado.id}>
                                        <TableCell>
                                            {traslado.fecha_traslado ? 
                                                new Date(traslado.fecha_traslado).toLocaleDateString() : 
                                                new Date(traslado.fecha_cita).toLocaleDateString()
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {`${traslado.Paciente?.nombres || ''} ${traslado.Paciente?.apellidos || ''}`}
                                        </TableCell>
                                        <TableCell>{traslado.tipo_servicio}</TableCell>
                                        <TableCell>{traslado.estado}</TableCell>
                                        <TableCell>
                                            {historiaClinica ? (
                                                <Typography color="success.main">
                                                    Registrada
                                                </Typography>
                                            ) : (
                                                <Typography color="error.main">
                                                    Pendiente
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {historiaClinica ? (
                                                <>
                                                    <Tooltip title="Ver Historia Clínica">
                                                        <IconButton
                                                            onClick={() => handleVerHistoria(historiaClinica.id)}
                                                            color="primary"
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {traslado.estado !== 'FINALIZADO' && (
                                                        <Tooltip title="Editar Historia Clínica">
                                                            <IconButton
                                                                onClick={() => handleEditarHistoria(historiaClinica.id)}
                                                                color="secondary"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            ) : (
                                                <Button
                                                    startIcon={<AddIcon />}
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleCrearHistoria(traslado.id)}
                                                    disabled={traslado.estado === 'FINALIZADO'}
                                                >
                                                    Crear Historia
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    export default HistoriasClinicasList;