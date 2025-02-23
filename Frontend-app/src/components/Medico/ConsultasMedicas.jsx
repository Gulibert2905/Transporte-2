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

const ConsultasMedicas = () => {
    const [consultas, setConsultas] = useState([]);

    useEffect(() => {
        const fetchConsultas = async () => {
            try {
                const response = await axiosInstance.get('/api/medico/consultas');
                setConsultas(response.data.data);
            } catch (error) {
                console.error('Error al cargar consultas:', error);
            }
        };

        fetchConsultas();
    }, []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Consultas Médicas
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Paciente</TableCell>
                            <TableCell>Motivo</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {consultas.map((consulta) => (
                            <TableRow key={consulta.id}>
                                <TableCell>{new Date(consulta.fecha).toLocaleDateString()}</TableCell>
                                <TableCell>{`${consulta.paciente.nombre} ${consulta.paciente.apellido}`}</TableCell>
                                <TableCell>{consulta.motivo}</TableCell>
                                <TableCell>{consulta.estado}</TableCell>
                                <TableCell>
                                    <Button variant="contained" size="small">
                                        Ver Detalle
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

export default ConsultasMedicas;