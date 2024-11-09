import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import {
Box,
TextField,
Button,
Stack,
FormControl,
InputLabel,
Select,
MenuItem,
Paper,
FormControlLabel,
Switch,
CircularProgress,
Typography,

} from '@mui/material';
import axiosInstance from '../../utils/axios';

function TrasladoForm({ onSuccess, setError }) {
    const [formData, setFormData] = useState({
        paciente_id: '',
        documento_paciente: '',
        fecha_solicitud: '',
        fecha_cita: '',
        hora_cita: '',
        requiere_acompanante: false,
        acompanante_tipo_doc: '',
        acompanante_documento: '',
        acompanante_nombres: '',
        direccion_origen: '',
        municipio_origen: '',
        direccion_destino: '',
        municipio_destino: '',
        num_pasajeros: 1,
        num_traslados: 1,
        tipo_transporte: '',
        valor_traslado: '',
        observaciones: ''
    });

    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [buscandoPaciente, setBuscandoPaciente] = useState(false);

    // Función para buscar paciente
    const buscarPacientePorDocumento = async (documento) => {
    if (!documento || documento.length < 3) return;
    
    try {
        setBuscandoPaciente(true);
        const response = await axiosInstance.get(`/pacientes/buscar/${documento}`);
        if (response.data.paciente) {
        setPacienteSeleccionado(response.data.paciente);
        setFormData(prev => ({
            ...prev,
            paciente_id: response.data.paciente.id
        }));
        } else {
        setError('Paciente no encontrado');
        setPacienteSeleccionado(null);
        }
    } catch (err) {
        console.error('Error buscando paciente:', err);
        setError('Error al buscar paciente');
        setPacienteSeleccionado(null);
    } finally {
        setBuscandoPaciente(false);
    }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
    };
    console.log(formData.paciente_id);
    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                valor_total: Number(formData.valor_traslado) * Number(formData.num_traslados)
            };

            console.log('Datos enviados:', dataToSend);

            await axiosInstance.post('/traslados', dataToSend);
            onSuccess('Traslado creado exitosamente');
            // Resetear formulario
            setFormData({
                paciente_id: '',
                documento_paciente: '',
                fecha_solicitud: '',
                fecha_cita: '',
                hora_cita: '',
                requiere_acompanante: false,
                acompanante_tipo_doc: '',
                acompanante_documento: '',
                acompanante_nombres: '',
                direccion_origen: '',
                municipio_origen: '',
                direccion_destino: '',
                municipio_destino: '',
                num_pasajeros: 1,
                num_traslados: 1,
                tipo_transporte: '',
                valor_traslado: '',
                observaciones: ''
            });
            setPacienteSeleccionado(null);
            onSuccess();
        } catch (err) {
            console.error('Error al crear traslado:', err);
            setError(err.response?.data?.message || 'Error al crear el traslado');
        }
    };

    const debouncedSearch = useCallback(
    debounce((documento) => buscarPacientePorDocumento(documento), 500),
    []
    );

    return (
        <Paper sx={{ p: 2 }}>
            <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    {/* Buscador de Paciente */}
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Documento del Paciente"
                            name="documento_paciente"
                            value={formData.documento_paciente}
                            onChange={(e) => {
                                const documento = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    documento_paciente: documento
                                }));
                                debouncedSearch(documento);
                            }}
                            placeholder="Ingrese el documento del paciente"
                            required
                        />
                        {buscandoPaciente && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                <Typography variant="body2">Buscando paciente...</Typography>
                            </Box>
                        )}
                    </Box>
    
                    {/* Información del Paciente si fue encontrado */}
                    {pacienteSeleccionado && (
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(0, 150, 136, 0.1)',
                            borderRadius: 1,
                            border: '1px solid #009688',
                            mb: 2 
                        }}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                Paciente Encontrado
                            </Typography>
                            <Typography variant="h6">
                                {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    <strong>Documento:</strong> {pacienteSeleccionado.tipo_documento} {pacienteSeleccionado.documento}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Teléfono:</strong> {pacienteSeleccionado.telefono}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Categoría:</strong> {pacienteSeleccionado.categoria}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Régimen:</strong> {pacienteSeleccionado.regimen}
                                </Typography>
                            </Box>
                        </Box>
                    )}
    
                    {/* Formulario de Traslado - Solo se muestra si hay paciente seleccionado */}
                    {pacienteSeleccionado ? (
                        <>
                            {/* Fechas */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="fecha_solicitud"
                                    label="Fecha de Solicitud"
                                    value={formData.fecha_solicitud}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="fecha_cita"
                                    label="Fecha de Cita"
                                    value={formData.fecha_cita}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    type="time"
                                    name="hora_cita"
                                    label="Hora de Cita"
                                    value={formData.hora_cita}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Box>
    
                            {/* Acompañante Switch */}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.requiere_acompanante}
                                        onChange={handleChange}
                                        name="requiere_acompanante"
                                    />
                                }
                                label="Requiere Acompañante"
                            />
    
                            {/* Campos de Acompañante */}
                            {formData.requiere_acompanante && (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo Documento Acompañante</InputLabel>
                                        <Select
                                            name="acompanante_tipo_doc"
                                            value={formData.acompanante_tipo_doc}
                                            onChange={handleChange}
                                            label="Tipo Documento Acompañante"
                                        >
                                            <MenuItem value="CC">Cédula de Ciudadanía</MenuItem>
                                            <MenuItem value="TI">Tarjeta de Identidad</MenuItem>
                                            <MenuItem value="CE">Cédula de Extranjería</MenuItem>
                                            <MenuItem value="PA">Pasaporte</MenuItem>
                                        </Select>
                                    </FormControl>
    
                                    <TextField
                                        fullWidth
                                        name="acompanante_documento"
                                        label="Documento Acompañante"
                                        value={formData.acompanante_documento}
                                        onChange={handleChange}
                                    />
    
                                    <TextField
                                        fullWidth
                                        name="acompanante_nombres"
                                        label="Nombres Acompañante"
                                        value={formData.acompanante_nombres}
                                        onChange={handleChange}
                                    />
                                </Box>
                            )}
    
                            {/* Direcciones */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    name="direccion_origen"
                                    label="Dirección Origen"
                                    value={formData.direccion_origen}
                                    onChange={handleChange}
                                    required
                                />
    
                                <TextField
                                    fullWidth
                                    name="municipio_origen"
                                    label="Municipio Origen"
                                    value={formData.municipio_origen}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>
    
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    name="direccion_destino"
                                    label="Dirección Destino"
                                    value={formData.direccion_destino}
                                    onChange={handleChange}
                                    required
                                />
    
                                <TextField
                                    fullWidth
                                    name="municipio_destino"
                                    label="Municipio Destino"
                                    value={formData.municipio_destino}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>
    
                            {/* Valores y cantidades */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    name="num_pasajeros"
                                    label="Número de Pasajeros"
                                    value={formData.num_pasajeros}
                                    onChange={handleChange}
                                    required
                                    InputProps={{ inputProps: { min: 1 } }}
                                />
    
                                <TextField
                                    fullWidth
                                    type="number"
                                    name="num_traslados"
                                    label="Número de Traslados"
                                    value={formData.num_traslados}
                                    onChange={handleChange}
                                    required
                                    InputProps={{ inputProps: { min: 1 } }}
                                />
    
                                <TextField
                                    fullWidth
                                    type="number"
                                    name="valor_traslado"
                                    label="Valor por Traslado"
                                    value={formData.valor_traslado}
                                    onChange={handleChange}
                                    required
                                    InputProps={{ inputProps: { min: 0 } }}
                                />
                            </Box>
                            <FormControl fullWidth required>
                                <InputLabel>Tipo de Transporte</InputLabel>
                                <Select
                                    name="tipo_transporte"
                                    value={formData.tipo_transporte}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="URBANO">Urbano</MenuItem>
                                    <MenuItem value="RURAL">Rural</MenuItem>
                                    <MenuItem value="OTRO">Otro</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                            >
                                Crear Traslado
                            </Button>
                        </>
                    ) : (
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'grey.100', 
                            borderRadius: 1,
                            textAlign: 'center'
                        }}>
                            <Typography color="text.secondary">
                                Ingrese el documento del paciente para continuar
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </form>
        </Paper>
    );
}

export default TrasladoForm;