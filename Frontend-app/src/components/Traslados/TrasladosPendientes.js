// components/Traslados/TrasladosPendientes.js
import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography
} from '@mui/material';
import axiosInstance from '../../utils/axios';

function TrasladosPendientes({ traslados, onVerificar, setError, setSuccess }) {
  const handleVerificar = async (id) => {
    try {
      await axiosInstance.put(`/traslados/${id}/verificar`);
      setSuccess('Traslado verificado exitosamente');
      onVerificar();
    } catch (err) {
      setError('Error al verificar el traslado');
      console.error('Error:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Traslados Pendientes de Verificación
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Origen - Destino</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {traslados.map((traslado) => (
              <TableRow key={traslado.id}>
                <TableCell>
                  {traslado.Paciente?.nombres} {traslado.Paciente?.apellidos}
                </TableCell>
                <TableCell>
                  {new Date(traslado.fecha_cita).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {`${traslado.municipio_origen} - ${traslado.municipio_destino}`}
                </TableCell>
                <TableCell>{traslado.estado}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleVerificar(traslado.id)}
                  >
                    Verificar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TrasladosPendientes;