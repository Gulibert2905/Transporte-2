import React, { useState, useEffect, useCallback } from 'react';
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
    const [prestadores, setPrestadores] = useState([]);
    const [selectedPrestador, setSelectedPrestador] = useState("");

    const [rutas, setRutas] = useState([]);
    const [selectedRuta, setSelectedRuta] = useState("");

    const [tarifa, setTarifa] = useState(0);

    const [formData, setFormData] = useState({
        paciente_id: '',
        documento_paciente: '',
        fecha_solicitud: '',
        fecha_cita: '',
        hora_cita: '',
        tipo_atencion: '', // Nuevo campo
        tipo_traslado: '', // MUNICIPAL o TICKET
        prioridad: 'MEDIA', // ALTA, MEDIA, BAJA
        tipo_servicio: '',
        // Acompañante
        requiere_acompanante: false,
        acompanante_tipo_doc: '',
        acompanante_documento: '',
        acompanante_nombres: '',
        
        // Ubicaciones
        direccion_origen: '',
        municipio_origen: '',
        direccion_destino: '',
        municipio_destino: '',
        
        // Traslado principal
        num_pasajeros: 1,
        num_traslados: 1,
        valor_traslado: '',
        
        // Traslado urbano
        requiere_urbano: false,
        num_traslados_urbano: 0,
        valor_urbano: 0,
        
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

    useEffect(() => {
        const fetchPrestadores = async () => {
            try {
                const response = await axiosInstance.get('/prestadores');
                setPrestadores(response.data.prestadores); // guardamos la lista de prestadores
            } catch (error) {
                console.error('Error al cargar prestadores:', error);
            }
        };
        fetchPrestadores();
    }, []);

    useEffect(() => {
        const fetchRutas = async () => {
            if (!selectedPrestador) return; // Si no hay prestador seleccionado, no cargamos rutas
            try {
                const response = await axiosInstance.get(`/rutas?prestador_id=${selectedPrestador}`);
                setRutas(response.data.rutas); // Guardamos la lista de rutas
            } catch (error) {
                console.error('Error al cargar rutas:', error);
            }
        };
        fetchRutas();
    }, [selectedPrestador]); //
    
    useEffect(() => {
        const fetchTarifa = async () => {
            if (!selectedPrestador || !selectedRuta) return; // Si faltan datos, no cargamos la tarifa
            try {
                const response = await axiosInstance.get(`/tarifas/by-prestador-ruta`, {
                    params: {
                        prestador_nit: selectedPrestador,
                        ruta_id: selectedRuta
                    }
                });
                setTarifa(response.data.tarifa); // Guardamos el valor de la tarifa
            } catch (error) {
                console.error('Error al cargar tarifa:', error);
            }
        };
        fetchTarifa();
    }, [selectedPrestador, selectedRuta]);

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
            if (!selectedRuta || !selectedPrestador) {
                setError('Debe seleccionar un prestador y una ruta');
                return;
            }
    
            const rutaSeleccionada = rutas.find(r => r.id === selectedRuta);
            if (!rutaSeleccionada) {
                setError('No se encontró la ruta seleccionada');
                return;
            }
    
            const dataToSend = {
                paciente_id: pacienteSeleccionado.id,
                fecha_solicitud: formData.fecha_solicitud,
                fecha_cita: formData.fecha_cita,
                hora_cita: formData.hora_cita,
                direccion_origen: formData.direccion_origen,
                direccion_destino: formData.direccion_destino,
                prestador_id: selectedPrestador,
                ruta_id: selectedRuta,
                municipio_origen: rutaSeleccionada.origen,
                municipio_destino: rutaSeleccionada.destino,
                num_pasajeros: parseInt(formData.num_pasajeros) || 1,
                num_traslados: parseInt(formData.num_traslados) || 1,
                tipo_traslado: 'MUNICIPAL', // Asegúrate de que esto coincida con los valores permitidos en tu modelo
                tipo_transporte: formData.tipo_transporte || 'URBANO',
                tipo_servicio: formData.tipo_servicio,
                valor_traslado: parseFloat(tarifa) || 0,
                valor_total: parseFloat(tarifa) * parseInt(formData.num_traslados)
            };
    
            console.log('Datos a enviar:', dataToSend);
    
            const response = await axiosInstance.post('/traslados', dataToSend);
    
            if (response.data.success) {
                onSuccess('Traslado creado exitosamente');
                // Resetear formulario...
            }
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
                                required
                                fullWidth
                                type="date"
                                name="fecha_solicitud"
                                label="Fecha de Solicitud"
                                value={formData.fecha_solicitud}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!formData.fecha_solicitud}
                                helperText={!formData.fecha_solicitud ? "Este campo es requerido" : ""}
                            />

                            <TextField
                                required
                                fullWidth
                                type="date"
                                name="fecha_cita"
                                label="Fecha de Cita"
                                value={formData.fecha_cita}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!formData.fecha_cita}
                                helperText={!formData.fecha_cita ? "Este campo es requerido" : ""}
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
    
                                
                                    
                                
                            </Box>
                            <FormControl fullWidth required>
                                <InputLabel>Prestador</InputLabel>
                                <Select
                                    value={selectedPrestador || ''}
                                    onChange={(e) => setSelectedPrestador(e.target.value)}
                                    label="Prestador"
                                >
                                    <MenuItem value="">Seleccione un prestador</MenuItem> {/* Opción vacía */}
                                    {prestadores.map((prestador) => (
                                        <MenuItem key={prestador.id} value={prestador.nit}>
                                            {prestador.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth required>
                                <InputLabel>Ruta</InputLabel>
                                <Select
                                    value={selectedRuta || ''}
                                    onChange={(e) => setSelectedRuta(e.target.value)}
                                    label="Ruta"
                                >
                                    <MenuItem value="">Seleccione una ruta</MenuItem> {/* Opción vacía */}
                                    {rutas.map((ruta) => (
                                        <MenuItem key={ruta.id} value={ruta.id}>
                                            {ruta.origen} - {ruta.destino}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                                    label="Tarifa"
                                    value={tarifa}
                                    InputProps={{ readOnly: true }}
                                    disabled
                                />
                            </Box>
                            <FormControl fullWidth required>
                    <InputLabel>Tipo de Atención</InputLabel>
                    <Select
                        name="tipo_atencion"
                        value={formData.tipo_atencion}
                        onChange={handleChange}
                    >
                        <MenuItem key="consulta" value="CONSULTA">Consulta</MenuItem>
                        <MenuItem key="examen" value="EXAMEN">Examen</MenuItem>
                        <MenuItem key="terapia" value="TERAPIA">Terapia</MenuItem>
                        <MenuItem key="control" value="CONTROL">Control</MenuItem>
                    </Select>
                </FormControl>

                {/* Tipo de Traslado */}
                <FormControl fullWidth required>
                    <InputLabel>Tipo de Traslado</InputLabel>
                    <Select
                        name="tipo_traslado"
                        value={formData.tipo_traslado}
                        onChange={handleChange}
                    >
                        <MenuItem value="MUNICIPAL">Municipal</MenuItem>
                        <MenuItem value="TICKET">Ticket</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth required>
                    <InputLabel>Tipo de Servicio</InputLabel>
                    <Select
                        name="tipo_servicio"
                        value={formData.tipo_servicio}
                        onChange={handleChange}
                    >
                        <MenuItem key="basico" value="BASICO">Básico</MenuItem>
                        <MenuItem key="ambulancia" value="AMBULANCIA">Ambulancia</MenuItem>
                        <MenuItem key="especial" value="ESPECIAL">Especial</MenuItem>
                    </Select>
                </FormControl>

                {/* Prioridad */}
                <FormControl fullWidth>
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                        name="prioridad"
                        value={formData.prioridad}
                        onChange={handleChange}
                    >
                        <MenuItem value="ALTA">Alta</MenuItem>
                        <MenuItem value="MEDIA">Media</MenuItem>
                        <MenuItem value="BAJA">Baja</MenuItem>
                    </Select>
                </FormControl>

                {/* Transporte Urbano */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.requiere_urbano}
                            onChange={handleChange}
                            name="requiere_urbano"
                        />
                    }
                    label="Requiere Transporte Urbano"
                />

                {formData.requiere_urbano && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            type="number"
                            name="num_traslados_urbano"
                            label="Número de Traslados Urbanos"
                            value={formData.num_traslados_urbano}
                            onChange={handleChange}
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            name="valor_urbano"
                            label="Valor Traslado Urbano"
                            value={formData.valor_urbano}
                            onChange={handleChange}
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                    </Box>
                )}

                {/* Observaciones */}
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="observaciones"
                    label="Observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Ingrese cualquier observación relevante"
                />
                
                {/* Mostrar Resumen de Costos */}
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                        Resumen de Costos
                    </Typography>
                    <Stack spacing={1}>
                        <Typography>
                            Traslado Principal: {formatearMoneda(formData.valor_traslado * formData.num_traslados)}
                        </Typography>
                        {formData.requiere_urbano && (
                            <Typography>
                                Traslado Urbano: {formatearMoneda(formData.valor_urbano * formData.num_traslados_urbano)}
                            </Typography>
                        )}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Total: {formatearMoneda(
                                (formData.valor_traslado * formData.num_traslados) +
                                (formData.requiere_urbano ? formData.valor_urbano * formData.num_traslados_urbano : 0)
                            )}
                        </Typography>
                    </Stack>
                </Paper>
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
// Función auxiliar para formatear moneda
const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor || 0);
};
export default TrasladoForm;