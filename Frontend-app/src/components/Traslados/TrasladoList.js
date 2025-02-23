import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalHospital as LocalHospitalIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

function TrasladoList({ traslados, onUpdate, setError, setSuccess }) {
  const navigate = useNavigate();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTraslado, setSelectedTraslado] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este traslado?')) {
      try {
        await axiosInstance.delete(`/traslados/${id}`);
        setSuccess('Traslado eliminado exitosamente');
        onUpdate();
      } catch (err) {
        setError('Error al eliminar el traslado');
        console.error('Error:', err);
      }
    }
  };

  const handleCrearHistoria = async (trasladoId) => {
    try {
        // Primero verificamos si ya existe una historia
        const response = await axiosInstance.get(`/api/historia-clinica/verificar/${trasladoId}`);
        
        if (response.data.exists) {
            setError('Ya existe una historia clínica para este traslado');
            return;
        }
        
        // Si no existe, navegamos al formulario de creación
        navigate(`/historia-clinica/crear/${trasladoId}`);
    } catch (error) {
        console.error('Error al redireccionar:', error);
        setError('Error al intentar crear historia clínica');
    }
};

  const getEstadoColor = (estado) => {
    const colors = {
      'PENDIENTE': 'warning',
      'EN_PROCESO': 'info',
      'COMPLETADO': 'success',
      'CANCELADO': 'error'
    };
    return colors[estado] || 'default';
  };

  const handleDetailClick = (traslado) => {
    setSelectedTraslado(traslado);
    setDetailOpen(true);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>Fecha Cita</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Verificado</TableCell>
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
                <TableCell>{traslado.municipio_origen}</TableCell>
                <TableCell>{traslado.municipio_destino}</TableCell>
                <TableCell>
                  <Chip 
                    label={traslado.tipo_servicio}
                    color={traslado.tipo_servicio === 'AMBULANCIA' ? "error" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={traslado.estado}
                    color={getEstadoColor(traslado.estado)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={traslado.verificado_auditor ? "Verificado" : "Pendiente"}
                    color={traslado.verificado_auditor ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver Detalles">
                    <IconButton 
                      onClick={() => handleDetailClick(traslado)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {traslado.tipo_servicio === 'AMBULANCIA' && !traslado.HistoriaClinica && (
                    <Tooltip title="Crear Historia Clínica">
                      <IconButton
                        color="success"
                        onClick={() => handleCrearHistoria(traslado.id)}
                      >
                        <LocalHospitalIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Eliminar">
                    <IconButton 
                      color="error"
                      onClick={() => handleDelete(traslado.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTraslado && (
          <>
            <DialogTitle>
              Detalles del Traslado
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                {/* Detalles del traslado */}
                <Grid item xs={12} md={6}>
                  <strong>Paciente:</strong> {selectedTraslado.Paciente?.nombres} {selectedTraslado.Paciente?.apellidos}
                </Grid>
                <Grid item xs={12} md={6}>
                  <strong>Tipo de Servicio:</strong> {selectedTraslado.tipo_servicio}
                </Grid>
                {/* Agregar más detalles según necesites */}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOpen(false)}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default TrasladoList;