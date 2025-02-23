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

const PacientesMedico = () => {
    const [pacientes, setPacientes] = useState([]);

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await axiosInstance.get('/api/medico/pacientes');
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
                Mis Pacientes
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Documento</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pacientes.map((paciente) => (
                            <TableRow key={paciente.id}>
                                <TableCell>{`${paciente.nombre} ${paciente.apellido}`}</TableCell>
                                <TableCell>{paciente.documento}</TableCell>
                                <TableCell>{paciente.telefono}</TableCell>
                                <TableCell>
                                    <Button variant="contained" size="small">
                                        Ver Historia
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

export default PacientesMedico;