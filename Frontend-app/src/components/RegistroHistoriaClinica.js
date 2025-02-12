import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    Typography,
    FormControlLabel,
    Switch,
    MenuItem,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

const RegistroHistoriaClinica = () => {
    const { trasladoId } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [traslado, setTraslado] = useState(null);
    const [personalMedico, setPersonalMedico] = useState([]);

    const [formData, setFormData] = useState({
        presion_arterial: '',
        frecuencia_cardiaca: '',
        frecuencia_respiratoria: '',
        temperatura: '',
        saturacion_oxigeno: '',
        glasgow: '',
        motivo_traslado: '',
        antecedentes: '',
        condicion_actual: '',
        medicamentos_actuales: '',
        procedimientos_realizados: '',
        oxigeno_suplementario: false,
        tipo_dispositivo_o2: 'NINGUNO',
        flujo_oxigeno: '',
        medico_id: '',
        enfermero_id: '',
        estado_llegada: '',
        complicaciones: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trasladoRes, personalRes] = await Promise.all([
                    axiosInstance.get(`/traslados/${trasladoId}`),
                    axiosInstance.get('/usuarios/personal-medico')
                ]);
                setTraslado(trasladoRes.data);
                setPersonalMedico(personalRes.data);
            } catch (err) {
                setError('Error cargando datos necesarios');
                console.error(err);
            }
        };
        fetchData();
    }, [trasladoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.post(`/historias-clinicas/${trasladoId}`, formData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar la historia clínica');
        } finally {
            setLoading(false);
        }
    };

    if (!traslado) {
        return <CircularProgress />;
    }

    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Historia Clínica - Traslado #{trasladoId}
                </Typography>
                
                <Box mt={2} mb={3}>
                    <Typography variant="subtitle1">
                        Paciente: {traslado.Paciente?.nombres} {traslado.Paciente?.apellidos}
                    </Typography>
                    <Typography variant="body2">
                        Documento: {traslado.Paciente?.documento}
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Signos Vitales */}
                        <Grid item xs={12}>
                            <Typography variant="h6">Signos Vitales</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Presión Arterial"
                                        name="presion_arterial"
                                        value={formData.presion_arterial}
                                        onChange={handleChange}
                                        placeholder="120/80"
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Frecuencia Cardíaca"
                                        name="frecuencia_cardiaca"
                                        type="number"
                                        value={formData.frecuencia_cardiaca}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Saturación O2"
                                        name="saturacion_oxigeno"
                                        type="number"
                                        value={formData.saturacion_oxigeno}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Información Clínica */}
                        <Grid item xs={12}>
                            <Typography variant="h6">Información Clínica</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Motivo del Traslado"
                                        name="motivo_traslado"
                                        required
                                        value={formData.motivo_traslado}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Condición Actual"
                                        name="condicion_actual"
                                        required
                                        value={formData.condicion_actual}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Oxigenoterapia */}
                        <Grid item xs={12}>
                            <Typography variant="h6">Oxigenoterapia</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.oxigeno_suplementario}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    oxigeno_suplementario: e.target.checked
                                                }))}
                                            />
                                        }
                                        label="Requiere Oxígeno Suplementario"
                                    />
                                </Grid>
                                {formData.oxigeno_suplementario && (
                                    <>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                select
                                                label="Dispositivo O2"
                                                name="tipo_dispositivo_o2"
                                                value={formData.tipo_dispositivo_o2}
                                                onChange={handleChange}
                                            >
                                                <MenuItem value="CANULA_NASAL">Cánula Nasal</MenuItem>
                                                <MenuItem value="MASCARA_SIMPLE">Máscara Simple</MenuItem>
                                                <MenuItem value="MASCARA_RESERVORIO">Máscara Reservorio</MenuItem>
                                                <MenuItem value="VENTILADOR">Ventilador</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Flujo de Oxígeno"
                                                name="flujo_oxigeno"
                                                value={formData.flujo_oxigeno}
                                                onChange={handleChange}
                                                placeholder="2 L/min"
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar Historia Clínica'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Historia clínica guardada exitosamente
                    </Alert>
                )}
            </Paper>
        </Box>
    );
};

export default RegistroHistoriaClinica;