import React, { useState, useEffect } from 'react';
import {
Box,
Typography,
Paper,
CircularProgress,
Alert
} from '@mui/material';
import axiosInstance from '../../utils/axios';
import VerificacionList from './VerificacionList';

function VerificacionTraslados() {
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(null);
const [traslados, setTraslados] = useState([]);

useEffect(() => {
fetchTraslados();
}, []);

const fetchTraslados = async () => {
try {
    setLoading(true);
    const response = await axiosInstance.get('/traslados/pendientes-verificacion');
    setTraslados(response.data);
    setLoading(false);
} catch (err) {
    setError('Error al cargar los traslados pendientes');
    setLoading(false);
    console.error('Error:', err);
}
};

if (loading) return <CircularProgress />;

return (
<Box p={3}>
    <Typography variant="h4" gutterBottom>
    Verificación de Traslados
    </Typography>

    {error && (
    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
        {error}
    </Alert>
    )}

    {success && (
    <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
        {success}
    </Alert>
    )}

    <Paper sx={{ p: 2 }}>
    <VerificacionList 
        traslados={traslados}
        onUpdate={fetchTraslados}
        setError={setError}
        setSuccess={setSuccess}
    />
    </Paper>
</Box>
);
}

export default VerificacionTraslados;