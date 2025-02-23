// components/HistoriaClinica/HistoriasClinicas.jsx
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
    Button,
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

const HistoriasClinicas = () => {
    const [historias, setHistorias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistorias();
    }, []);

    const fetchHistorias = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/historia-clinica');
            setHistorias(response.data.data);
        } catch (error) {
            console.error('Error al cargar historias clínicas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/historias-clinicas/buscar?q=${busqueda}`);
            setHistorias(response.data.data);
        } catch (error) {
            console.error('Error en la búsqueda:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerDetalle = (id) => {
        navigate(`/historias-clinicas/${id}`);
    };

    const handleNuevaHistoria = () => {
        navigate('/historias-clinicas/nueva');
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">
                    Historias Clínicas
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleNuevaHistoria}
                >
                    Nueva Historia Clínica
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por nombre, documento o número de historia..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleSearch}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nº Historia</TableCell>
                            <TableCell>Paciente</TableCell>
                            <TableCell>Documento</TableCell>
                            <TableCell>Fecha Creación</TableCell>
                            <TableCell>Última Actualización</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {historias.map((historia) => (
                            <TableRow key={historia.id}>
                                <TableCell>{historia.numero_historia}</TableCell>
                                <TableCell>
                                    {`${historia.paciente.nombre} ${historia.paciente.apellido}`}
                                </TableCell>
                                <TableCell>{historia.paciente.documento}</TableCell>
                                <TableCell>
                                    {new Date(historia.fecha_creacion).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {new Date(historia.ultima_actualizacion).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{historia.estado}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleVerDetalle(historia.id)}
                                    >
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

export default HistoriasClinicas;