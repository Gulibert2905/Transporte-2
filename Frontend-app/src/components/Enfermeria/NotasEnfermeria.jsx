import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText 
} from '@mui/material';
import axiosInstance from '../../utils/axios';

const NotasEnfermeria = () => {
    const [notas, setNotas] = useState([]);
    const [nuevaNota, setNuevaNota] = useState('');

    useEffect(() => {
        const fetchNotas = async () => {
            try {
                const response = await axiosInstance.get('/api/enfermeria/notas');
                setNotas(response.data.data);
            } catch (error) {
                console.error('Error al cargar notas:', error);
            }
        };

        fetchNotas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/enfermeria/notas', { nota: nuevaNota });
            setNuevaNota('');
            // Recargar notas
        } catch (error) {
            console.error('Error al guardar nota:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Notas de Enfermería
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Nueva Nota"
                        value={nuevaNota}
                        onChange={(e) => setNuevaNota(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained">
                        Guardar Nota
                    </Button>
                </form>
            </Paper>
            <List>
                {notas.map((nota) => (
                    <ListItem key={nota.id} component={Paper} sx={{ mb: 1 }}>
                        <ListItemText
                            primary={nota.texto}
                            secondary={new Date(nota.fecha).toLocaleString()}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default NotasEnfermeria;