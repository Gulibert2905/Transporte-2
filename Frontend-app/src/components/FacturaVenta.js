import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios'; 
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function FacturaVenta() {
  const [facturas, setFacturas] = useState([]);
  const [nuevaFactura, setNuevaFactura] = useState({
    numero: '',
    fecha: '',
    cliente: '',
    items: [],
    subtotal: 0,
    iva: 0,
    total: 0
  });
  const [nuevoItem, setNuevoItem] = useState({
    descripcion: '',
    cantidad: 0,
    precioUnitario: 0
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    try {
      const response = await axiosInstance.get('/api/factura-venta');
      setFacturas(response.data);
    } catch (error) {
      console.error('Error al obtener las facturas:', error);
    }
  };

  const handleInputChange = (e) => {
    setNuevaFactura({ ...nuevaFactura, [e.target.name]: e.target.value });
  };

  const handleItemChange = (e) => {
    setNuevoItem({ ...nuevoItem, [e.target.name]: e.target.value });
  };

  const agregarItem = () => {
    const itemConTotal = {
      ...nuevoItem,
      total: nuevoItem.cantidad * nuevoItem.precioUnitario
    };
    setNuevaFactura({
      ...nuevaFactura,
      items: [...nuevaFactura.items, itemConTotal]
    });
    setNuevoItem({ descripcion: '', cantidad: 0, precioUnitario: 0 });
    calcularTotales([...nuevaFactura.items, itemConTotal]);
  };

  const eliminarItem = (index) => {
    const nuevosItems = nuevaFactura.items.filter((_, i) => i !== index);
    setNuevaFactura({
      ...nuevaFactura,
      items: nuevosItems
    });
    calcularTotales(nuevosItems);
  };

  const calcularTotales = (items) => {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const iva = subtotal * 0.19; // Asumiendo un IVA del 19%
    const total = subtotal + iva;

    setNuevaFactura(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      total: total.toFixed(2)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevaFactura.items.length === 0) {
      alert('La factura debe tener al menos un item');
      return;
    }
    if (!nuevaFactura.numero || !nuevaFactura.fecha || !nuevaFactura.cliente) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }
    try {
      const facturaData = {
        ...nuevaFactura,
        items: nuevaFactura.items.map(item => ({
          descripcion: item.descripcion,
          cantidad: parseInt(item.cantidad),
          precioUnitario: parseFloat(item.precioUnitario),
          total: parseFloat(item.total)
        })),
        impuestosAplicados: [] // Si no estás manejando impuestos, envía un array vacío
      };
      await axiosInstance.post('/api/factura-venta', facturaData);
      fetchFacturas();
      setNuevaFactura({
        numero: '',
        fecha: '',
        cliente: '',
        items: [],
        subtotal: 0,
        iva: 0,
        total: 0
      });
      setTabValue(1);
    } catch (error) {
      console.error('Error al crear la factura:', error.response?.data?.message || error.message);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Facturas de Venta
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="facturas de venta tabs">
        <Tab label="Crear Nueva Factura" />
        <Tab label="Lista de Facturas" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número de Factura"
                name="numero"
                value={nuevaFactura.numero}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fecha"
                name="fecha"
                type="date"
                value={nuevaFactura.fecha}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Cliente"
                name="cliente"
                value={nuevaFactura.cliente}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Agregar Item
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={nuevoItem.descripcion}
                onChange={handleItemChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Cantidad"
                name="cantidad"
                type="number"
                value={nuevoItem.cantidad}
                onChange={handleItemChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Precio Unitario"
                name="precioUnitario"
                type="number"
                value={nuevoItem.precioUnitario}
                onChange={handleItemChange}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={agregarItem}
                style={{ marginTop: '10px' }}
              >
                Agregar
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Unitario</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nuevaFactura.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.descripcion}</TableCell>
                    <TableCell align="right">{item.cantidad}</TableCell>
                    <TableCell align="right">{item.precioUnitario}</TableCell>
                    <TableCell align="right">{item.total}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => eliminarItem(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={2} style={{ marginTop: '20px' }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Subtotal"
                name="subtotal"
                value={nuevaFactura.subtotal}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="IVA"
                name="iva"
                value={nuevaFactura.iva}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total"
                name="total"
                value={nuevaFactura.total}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: '20px' }}
          >
            Crear Factura
          </Button>
        </form>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facturas.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell>{factura.numero}</TableCell>
                  <TableCell>{factura.fecha}</TableCell>
                  <TableCell>{factura.cliente}</TableCell>
                  <TableCell align="right">{factura.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Container>
  );
}

export default FacturaVenta;