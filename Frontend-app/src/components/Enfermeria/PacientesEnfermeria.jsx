import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Button 
} from '@mui/material';
import axiosInstance from '../../utils/axios';

const PacientesEnfermeria = () => {
    const [pacientes, setPacientes] = useState([]);

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await axiosInstance.get('/api/enfermeria/pacientes');
                setPacientes(response.data.data);
            } catch (error) {
                console.error('Error al cargar pacientes:', error);
            }
        };

        fetchPacientes();
    }, []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Pacientes Asignados
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Último Control</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pacientes.map((paciente) => (
                            <TableRow key={paciente.id}>
                                <TableCell>{`${paciente.nombre} ${paciente.apellido}`}</TableCell>
                                <TableCell>{paciente.ultimo_control}</TableCell>
                                <TableCell>{paciente.estado}</TableCell>
                                <TableCell>
                                    <Button variant="contained" size="small">
                                        Registrar Signos
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PacientesEnfermeria;