import React, { useState } from 'react';
import {
Box,
Typography,
Paper,
Grid,
TextField,
Button,
FormControl,
InputLabel,
Select,
MenuItem,
Alert
} from '@mui/material';
import axiosInstance from '../../utils/axios';

function ReportesTraslados() {
const [filtros, setFiltros] = useState({
fechaInicio: '',
fechaFin: '',
tipo: 'todos',
estado: 'todos'
});
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setFiltros({
    ...filtros,
    [e.target.name]: e.target.value
});
};

const generarReporte = async () => {
try {
    setLoading(true);
    const response = await axiosInstance.get('/traslados/reporte', {
    params: filtros,
    responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte-traslados.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setLoading(false);
} catch (err) {
    setError('Error al generar el reporte');
    setLoading(false);
    console.error('Error:', err);
}
};

return (
<Box p={3}>
    <Typography variant="h4" gutterBottom>
    Reportes de Traslados
    </Typography>

    {error && (
    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
        {error}
    </Alert>
    )}

    <Paper sx={{ p: 2 }}>
    <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
        <TextField
            fullWidth
            type="date"
            name="fechaInicio"
            label="Fecha Inicio"
            value={filtros.fechaInicio}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
        />
        </Grid>
        <Grid item xs={12} md={6}>
        <TextField
            fullWidth
            type="date"
            name="fechaFin"
            label="Fecha Fin"
            value={filtros.fechaFin}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
        />
        </Grid>
        <Grid item xs={12} md={6}>
        <FormControl fullWidth>
            <InputLabel>Tipo de Reporte</InputLabel>
            <Select
            name="tipo"
            value={filtros.tipo}
            onChange={handleChange}
            >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="paciente">Por Paciente</MenuItem>
            <MenuItem value="operador">Por Operador</MenuItem>
            <MenuItem value="ruta">Por Ruta</MenuItem>
            </Select>
        </FormControl>
        </Grid>
        <Grid item xs={12}>
        <Button
            variant="contained"
            onClick={generarReporte}
            disabled={loading}
            fullWidth
        >
            {loading ? 'Generando...' : 'Generar Reporte'}
        </Button>
        </Grid>
    </Grid>
    </Paper>
</Box>
);
}

export default ReportesTraslados;