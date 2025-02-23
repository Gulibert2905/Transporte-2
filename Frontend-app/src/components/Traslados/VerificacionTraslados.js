import React, { useState, useEffect, useCallback} from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../utils/axios';

const VerificacionTraslados = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [traslados, setTraslados] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: 'todos'
  });
  const [estadisticas, setEstadisticas] = useState({
    totalTraslados: 0,
    pendientesVerificacion: 0,
    verificadosHoy: 0
  });

  const fetchEstadisticas = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/traslados/verificacion/estadisticas');
      setEstadisticas(response.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, []);

  const fetchTraslados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/traslados/verificacion/pendientes', {
        params: {
          fechaInicio: filtros.fechaInicio || undefined,
          fechaFin: filtros.fechaFin || undefined,
          estado: filtros.estado === 'todos' ? undefined : filtros.estado
        }
      });
      
      const trasladosFormateados = Array.isArray(response.data) ? response.data.map(traslado => ({
        id: traslado.id,
        fecha_cita: traslado.fecha_cita || null,
        municipio_origen: traslado.municipio_origen || '',
        municipio_destino: traslado.municipio_destino || '',
        estado: traslado.estado || '',
        verificado_auditor: traslado.verificado_auditor || false,
        Paciente: traslado.Paciente || {},
        paciente_nombre: traslado.Paciente ? 
          `${traslado.Paciente.nombres || ''} ${traslado.Paciente.apellidos || ''}`.trim() : 
          'N/A'
      })) : [];

      setTraslados(trasladosFormateados);
    } catch (err) {
      console.error('Error al cargar traslados:', err);
      setError(err.response?.data?.message || 'Error al cargar los traslados');
      setTraslados([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    const cargarDatos = async () => {
      await fetchTraslados();
      await fetchEstadisticas();
    };
    cargarDatos();
  }, [fetchTraslados, fetchEstadisticas]);

  const handleVerificar = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await axiosInstance.patch(`/traslados/verificacion/${id}`, {
        verificado: true
      });

      setSuccess('Traslado verificado exitosamente');
      await fetchTraslados();
      await fetchEstadisticas();
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error al verificar el traslado');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (event) => {
    setFiltros({
      ...filtros,
      [event.target.name]: event.target.value
    });
  };

  const columns = [
    { 
        field: 'fecha_cita', 
        headerName: 'Fecha', 
        width: 120,
        valueFormatter: (params) => {
            if (!params.value) return 'N/A';
            return new Date(params.value).toLocaleDateString();
        }
    },
    { 
        field: 'paciente_nombre', 
        headerName: 'Paciente', 
        width: 200,
    },
    { 
        field: 'municipio_origen', 
        headerName: 'Origen', 
        width: 150,
    },
    { 
        field: 'municipio_destino', 
        headerName: 'Destino', 
        width: 150,
    },
    { 
        field: 'estado', 
        headerName: 'Estado', 
        width: 120,
    },
    { 
        field: 'actions',
        headerName: 'Acciones',
        width: 120,
        renderCell: (params) => (
            <Button
                variant="contained"
                size="small"
                onClick={() => handleVerificar(params.row.id)}
                disabled={params.row.verificado_auditor}
            >
                Verificar
            </Button>
        )
    }
];


  if (loading && traslados.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

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

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Traslados
              </Typography>
              <Typography variant="h5">
                {estadisticas.totalTraslados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendientes de Verificación
              </Typography>
              <Typography variant="h5">
                {estadisticas.pendientesVerificacion}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Verificados Hoy
              </Typography>
              <Typography variant="h5">
                {estadisticas.verificadosHoy}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              name="fechaInicio"
              label="Fecha Inicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              name="fechaFin"
              label="Fecha Fin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              name="estado"
              label="Estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="pendiente">Pendientes</MenuItem>
              <MenuItem value="verificado">Verificados</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Traslados */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <DataGrid
          rows={traslados}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection={false}
          disableSelectionOnClick
          autoHeight
          loading={loading}
          getRowId={(row) => row.id || Math.random()} // Asegurar ID único
          components={{
            NoRowsOverlay: () => (
              <Box display="flex" justifyContent="center" p={2}>
                <Typography>No hay traslados pendientes</Typography>
              </Box>
            ),
            LoadingOverlay: () => (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
              </Box>
            )
          }}
          componentsProps={{
            toolbar: {
              csvOptions: { allColumns: true }
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default VerificacionTraslados;