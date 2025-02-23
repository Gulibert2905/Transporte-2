import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper,
    TextField,
    Button,
    Grid 
} from '@mui/material';
import axiosInstance from '../../utils/axios';

const SignosVitales = () => {
    const [formData, setFormData] = useState({
        presion_arterial: '',
        frecuencia_cardiaca: '',
        temperatura: '',
        saturacion: '',
        observaciones: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/enfermeria/signos-vitales', formData);
            // Manejar éxito
        } catch (error) {
            console.error('Error al guardar signos vitales:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Registro de Signos Vitales
            </Typography>
            <Paper sx={{ p: 2 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Presión Arterial"
                                value={formData.presion_arterial}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    presion_arterial: e.target.value
                                })}
                            />
                        </Grid>
                        {/* Agregar más campos según necesidad */}
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained">
                                Guardar
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default SignosVitales;