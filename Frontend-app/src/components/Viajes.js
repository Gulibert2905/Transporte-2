import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import './Viajes.css';

function Viajes() {
  const [viajesData, setViajesData] = useState({
    viajes: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [prestadores, setPrestadores] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newViaje, setNewViaje] = useState({
    prestador_nit: '',
    ruta_id: '',
    fecha_viaje: '',
    tarifa_aplicada: '',
  });
  const [tarifaCargada, setTarifaCargada] = useState(false);
  const [filters, setFilters] = useState({
    prestador: '',
    ruta: '',
    fechaDesde: '',
    fechaHasta: '',
    tarifaMinima: '',
    tarifaMaxima: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchViajes();
    fetchPrestadores();
    fetchRutas();
  }, []);

  const fetchViajes = async (page = 1) => {
    try {
      setLoading(true);
      let url = `http://localhost:3000/api/viajes?page=${page}&limit=10`;

      if (searchTerm) url += `&search=${searchTerm}`;
      if (filters.prestador) url += `&prestador=${filters.prestador}`;
      if (filters.ruta) url += `&ruta=${filters.ruta}`;
      if (filters.fechaDesde) url += `&fechaDesde=${filters.fechaDesde}`;
      if (filters.fechaHasta) url += `&fechaHasta=${filters.fechaHasta}`;
      if (filters.tarifaMinima) url += `&tarifaMinima=${filters.tarifaMinima}`;
      if (filters.tarifaMaxima) url += `&tarifaMaxima=${filters.tarifaMaxima}`;

      const response = await axios.get(url);
      setViajesData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los viajes');
      setLoading(false);
      console.error('Error fetching viajes:', err);
    }
  };

  const fetchPrestadores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/prestadores');
      setPrestadores(response.data.prestadores);
    } catch (err) {
      console.error('Error fetching prestadores:', err);
    }
  };

  const fetchRutas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rutas');
      setRutas(response.data.rutas);
    } catch (err) {
      console.error('Error fetching rutas:', err);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setNewViaje((prev) => ({ ...prev, [name]: value }));

    if (name === 'prestador_nit' || name === 'ruta_id') {
      const updatedViaje = { ...newViaje, [name]: value };
      if (updatedViaje.prestador_nit && updatedViaje.ruta_id) {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/tarifas/by-prestador-ruta`,
            {
              params: {
                prestador_nit: updatedViaje.prestador_nit,
                ruta_id: updatedViaje.ruta_id,
              },
            }
          );
          if (response.data && response.data.tarifa) {
            setNewViaje((prev) => ({
              ...prev,
              [name]: value,
              tarifa_aplicada: response.data.tarifa,
            }));
            setTarifaCargada(true);
            setError(null);
          } else {
            setNewViaje((prev) => ({ ...prev, [name]: value, tarifa_aplicada: '' }));
            setTarifaCargada(false);
            setError('No se encontró una tarifa para este prestador y ruta');
          }
        } catch (error) {
          console.error('Error al obtener la tarifa:', error);
          setNewViaje((prev) => ({ ...prev, [name]: value, tarifa_aplicada: '' }));
          setTarifaCargada(false);
          setError('Error al obtener la tarifa. Por favor, intente de nuevo.');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newViaje.prestador_nit || !newViaje.ruta_id) {
      setError('Por favor, seleccione un prestador y una ruta');
      return;
    }

    if (!tarifaCargada || !newViaje.tarifa_aplicada) {
      setError(
        'La tarifa no se ha cargado correctamente. Por favor, seleccione un prestador y una ruta válidos'
      );
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/viajes', newViaje);
      setNewViaje({
        prestador_nit: '',
        ruta_id: '',
        fecha_viaje: '',
        tarifa_aplicada: '',
      });
      setTarifaCargada(false);
      fetchViajes(1);
      setSuccess('Viaje añadido exitosamente');
      setError(null);
    } catch (err) {
      console.error('Error creating viaje:', err);
      setError('Error al crear el viaje: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePageChange = (event, newPage) => {
    fetchViajes(newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const applyFilters = () => {
    fetchViajes(1);
  };

  const resetFilters = () => {
    setFilters({
      prestador: '',
      ruta: '',
      fechaDesde: '',
      fechaHasta: '',
      tarifaMinima: '',
      tarifaMaxima: '',
    });
    setSearchTerm('');
    fetchViajes(1);
  };

  const exportCSV = async () => {
    try {
      let url = `http://localhost:3000/api/viajes/export/csv?`;
      if (searchTerm) url += `&search=${searchTerm}`;
      Object.keys(filters).forEach((key) => {
        if (filters[key]) url += `&${key}=${filters[key]}`;
      });

      const response = await axios.get(url, { responseType: 'blob' });
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'viajes.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Error al exportar CSV');
    }
  };

  const exportExcel = async () => {
    try {
      let url = `http://localhost:3000/api/viajes/export/excel?`;
      if (searchTerm) url += `&search=${searchTerm}`;
      Object.keys(filters).forEach((key) => {
        if (filters[key]) url += `&${key}=${filters[key]}`;
      });

      const response = await axios.get(url, { responseType: 'blob' });
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'viajes.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError('Error al exportar Excel');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Viajes
      </Typography>

      {/* Búsqueda y filtros */}
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <TextField
          variant="outlined"
          label="Buscar viajes"
          value={searchTerm}
          onChange={handleSearch}
        />
        <FormControl variant="outlined" fullWidth>
          <InputLabel>Prestador</InputLabel>
          <Select
            name="prestador"
            value={filters.prestador}
            onChange={handleFilterChange}
            label="Prestador"
          >
            <MenuItem value="">
              <em>Todos los prestadores</em>
            </MenuItem>
            {prestadores.map((p) => (
              <MenuItem key={p.nit} value={p.nit}>
                {p.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" fullWidth>
          <InputLabel>Ruta</InputLabel>
          <Select name="ruta" value={filters.ruta} onChange={handleFilterChange} label="Ruta">
            <MenuItem value="">
              <em>Todas las rutas</em>
            </MenuItem>
            {rutas.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.origen} - {r.destino}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          variant="outlined"
          type="date"
          name="fechaDesde"
          label="Fecha desde"
          InputLabelProps={{ shrink: true }}
          value={filters.fechaDesde}
          onChange={handleFilterChange}
        />
        <TextField
          variant="outlined"
          type="date"
          name="fechaHasta"
          label="Fecha hasta"
          InputLabelProps={{ shrink: true }}
          value={filters.fechaHasta}
          onChange={handleFilterChange}
        />

        <Box display="flex" gap={2}>
          <TextField
            variant="outlined"
            name="tarifaMinima"
            label="Tarifa mínima"
            value={filters.tarifaMinima}
            onChange={handleFilterChange}
            fullWidth
          />
          <TextField
            variant="outlined"
            name="tarifaMaxima"
            label="Tarifa máxima"
            value={filters.tarifaMaxima}
            onChange={handleFilterChange}
            fullWidth
          />
        </Box>
        <Button variant="contained" color="primary" onClick={applyFilters}>
          Aplicar Filtros
        </Button>
        <Button variant="outlined" onClick={resetFilters}>
          Resetear Filtros
        </Button>
      </Box>

      {/* Botones de exportación */}
      <Box mb={3}>
        <Button variant="contained" color="primary" onClick={exportCSV} sx={{ mr: 2 }}>
          Exportar CSV
        </Button>
        <Button variant="contained" color="secondary" onClick={exportExcel}>
          Exportar Excel
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Seleccione un prestador</InputLabel>
          <Select
            name="prestador_nit"
            value={newViaje.prestador_nit}
            onChange={handleInputChange}
            label="Seleccione un prestador"
            required
          >
            <MenuItem value="">
              <em>Seleccione un prestador</em>
            </MenuItem>
            {prestadores.map((prestador) => (
              <MenuItem key={prestador.nit} value={prestador.nit}>
                {prestador.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Seleccione una ruta</InputLabel>
          <Select
            name="ruta_id"
            value={newViaje.ruta_id}
            onChange={handleInputChange}
            label="Seleccione una ruta"
            required
          >
            <MenuItem value="">
              <em>Seleccione una ruta</em>
            </MenuItem>
            {rutas.map((ruta) => (
              <MenuItem key={ruta.id} value={ruta.id}>
                {ruta.origen} - {ruta.destino}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          variant="outlined"
          type="date"
          name="fecha_viaje"
          label="Fecha de viaje"
          InputLabelProps={{ shrink: true }}
          value={newViaje.fecha_viaje}
          onChange={handleInputChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          variant="outlined"
          type="number"
          name="tarifa_aplicada"
          label="Tarifa aplicada"
          value={newViaje.tarifa_aplicada}
          InputProps={{
            readOnly: true,
          }}
          required
        />
        {tarifaCargada && <Typography color="success">Tarifa cargada correctamente</Typography>}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Añadir Viaje
        </Button>
      </form>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Prestador</TableCell>
              <TableCell>Ruta</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Tarifa Aplicada</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {viajesData.viajes.map((viaje) => (
              <TableRow key={viaje.id}>
                <TableCell>{viaje.Prestador?.nombre || 'N/A'}</TableCell>
                <TableCell>
                  {viaje.Ruta ? `${viaje.Ruta.origen} - ${viaje.Ruta.destino}` : 'N/A'}
                </TableCell>
                <TableCell>{new Date(viaje.fecha_viaje).toLocaleDateString()}</TableCell>
                <TableCell>${viaje.tarifa_aplicada}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={viajesData.totalPages}
          page={viajesData.currentPage}
          onChange={handlePageChange}
        />
      </Box>
    </Box>
  );
}

export default Viajes;
