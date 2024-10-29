import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, Button, Typography, Alert, Pagination,Snackbar, CircularProgress,
  Grid, Tooltip 
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as xlsx from 'xlsx';

function Prestadores() {
  const [prestadoresData, setPrestadoresData] = useState({
    prestadores: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPrestador, setEditingPrestador] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const cellPhonePattern = {
    value: /^3\d{9}$/,
    message: "Debe ser un número de celular válido (10 dígitos comenzando con 3)"
  };
  const fetchPrestadores = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/prestadores?page=${page}&limit=${limit}`);
      setPrestadoresData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los prestadores');
      setLoading(false);
      console.error('Error fetching prestadores:', err);
    }
  }, []);

  useEffect(() => {
    fetchPrestadores();
  }, [fetchPrestadores]);

  const onSubmit = async (data) => {
    try {
      if (editingPrestador) {
        await axios.put(`${process.env.REACT_APP_API_URL}/prestadores/${editingPrestador.nit}`, data);
        setEditingPrestador(null);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/prestadores`, data);
      }
      reset();
      fetchPrestadores();
    } catch (err) {
      setError('Error al guardar el prestador');
      console.error('Error saving prestador:', err);
    }
  };

  const handleEdit = (prestador) => {
    setEditingPrestador(prestador);
    Object.keys(prestador).forEach(key => {
      setValue(key, prestador[key]);
    });
  };

  const handleDelete = async (nit) => {
    if (window.confirm('¿Está seguro de que desea eliminar este prestador?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/prestadores/${nit}`);
        fetchPrestadores();
      } catch (err) {
        setError('Error al eliminar el prestador');
        console.error('Error deleting prestador:', err);
      }
    }
  };

  const handleCancel = () => {
    setEditingPrestador(null);
    reset();
  };

  const handlePageChange = (event, newPage) => {
    fetchPrestadores(newPage);
  };

  const prestadoresMemo = useMemo(() => prestadoresData.prestadores, [prestadoresData.prestadores]);
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Archivo seleccionado:', {
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size
    });

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      setError('Por favor, seleccione un archivo Excel (.xlsx o .xls)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/prestadores/import`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setImportSuccess(`${response.data.message}`);
      fetchPrestadores();
    } catch (err) {
      console.error('Error completo:', err);
      const errorMessage = err.response?.data?.message || 'Error al importar el archivo';
      if (err.response?.data?.nitsExistentes) {
        setError(`${errorMessage}. NITs existentes: ${err.response.data.nitsExistentes.join(', ')}`);
      } else if (err.response?.data?.nitsDuplicados) {
        setError(`${errorMessage}. NITs duplicados: ${err.response.data.nitsDuplicados.join(', ')}`);
      } else {
        setError(errorMessage);
      }
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        nit: '123456789',
        nombre: 'Nombre Prestador',
        contacto: 'Información de contacto'
      }
    ];
    
    const ws = xlsx.utils.json_to_sheet(template);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Prestadores');
    xlsx.writeFile(wb, 'plantilla_prestadores.xlsx');
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Prestadores de Servicio</Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mb={2}>
          <TextField
            fullWidth
            label="NIT"
            {...register("nit", { required: "NIT es requerido" })}
            disabled={editingPrestador}
            error={!!errors.nit}
            helperText={errors.nit?.message}
          />
        </Box>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Nombre"
            {...register("nombre", { required: "Nombre es requerido" })}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
          />
        </Box>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Contacto (Celular)"
            {...register("contacto", { 
              required: "Contacto es requerido",
              pattern: cellPhonePattern
            })}
            error={!!errors.contacto}
            helperText={errors.contacto?.message}
            inputProps={{ 
              inputMode: 'numeric',
              pattern: '3[0-9]{9}'
            }}
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          {editingPrestador ? 'Actualizar' : 'Añadir'} Prestador
        </Button>
        {editingPrestador && (
          <Button variant="outlined" onClick={handleCancel} sx={{ ml: 2 }}>
            Cancelar
          </Button>
        )}
      </form>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>NIT</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prestadoresMemo.map((prestador) => (
              <TableRow key={prestador.nit}>
                <TableCell>{prestador.nit}</TableCell>
                <TableCell>{prestador.nombre}</TableCell>
                <TableCell>{prestador.contacto}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleEdit(prestador)}>Editar</Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(prestador.nit)} sx={{ ml: 2 }}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar 
        open={!!importSuccess} 
        autoHideDuration={6000} 
        onClose={() => setImportSuccess(null)}
      >
        <Alert 
          onClose={() => setImportSuccess(null)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {importSuccess}
        </Alert>
      </Snackbar>

      {/* Componente de importación */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Importar Prestadores desde Excel</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              Importar Excel
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Tooltip title="Descargar plantilla">
              <Button
                variant="outlined"
                onClick={downloadTemplate}
                startIcon={<FileDownloadIcon />}
                fullWidth
              >
                Descargar Plantilla
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>        
      <Box mt={3} display="flex" justifyContent="center">
        <Pagination 
          count={prestadoresData.totalPages} 
          page={prestadoresData.currentPage} 
          onChange={handlePageChange}
        />
      </Box>
    </Box>
  );
}

export default Prestadores;
