import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Pagination,
  Tooltip
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as xlsx from 'xlsx';

function Rutas() {
  const [rutasData, setRutasData] = useState({
    rutas: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRuta, setNewRuta] = useState({ origen: '', destino: '', distancia: '' });
  const [importSuccess, setImportSuccess] = useState(null);

  useEffect(() => {
    fetchRutas();
  }, []);

  const fetchRutas = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/rutas?page=${page}&limit=${limit}`);
      setRutasData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las rutas');
      setLoading(false);
      console.error('Error fetching rutas:', err);
    }
  };

  const handleInputChange = (e) => {
    setNewRuta({ ...newRuta, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/rutas', newRuta);
      setNewRuta({ origen: '', destino: '', distancia: '' });
      fetchRutas();
    } catch (err) {
      setError('Error al crear la ruta');
      console.error('Error creating ruta:', err);
    }
  };

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
      const response = await axios.post('http://localhost:3000/api/rutas/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setImportSuccess(`${response.data.message}`);
      fetchRutas();
    } catch (err) {
      console.error('Error completo:', err);
      const errorMessage = err.response?.data?.message || 'Error al importar el archivo';
      if (err.response?.data?.columnasEncontradas) {
        setError(`${errorMessage}. Columnas encontradas: ${err.response.data.columnasEncontradas.join(', ')}`);
      } else {
        setError(errorMessage);
      }
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        origen: 'Ciudad Origen',
        destino: 'Ciudad Destino',
        distancia: 'Distancia en km'
      }
    ];
    
    const ws = xlsx.utils.json_to_sheet(template);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Rutas');
    xlsx.writeFile(wb, 'plantilla_rutas.xlsx');
  };

  const handlePageChange = (event, newPage) => {
    fetchRutas(newPage);
  };

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Rutas de Viaje</Typography>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

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

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="origen"
                label="Origen"
                value={newRuta.origen}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="destino"
                label="Destino"
                value={newRuta.destino}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                name="distancia"
                label="Distancia (km)"
                value={newRuta.distancia}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Añadir Ruta
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Importar Rutas desde Excel</Typography>
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Distancia (km)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rutasData.rutas.map((ruta) => (
              <TableRow key={ruta.id}>
                <TableCell>{ruta.origen}</TableCell>
                <TableCell>{ruta.destino}</TableCell>
                <TableCell>{ruta.distancia}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination 
        count={rutasData.totalPages}
        page={rutasData.currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
}

export default Rutas;