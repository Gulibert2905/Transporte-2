import React from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PlanCuentas from './PlanCuentas';
import LibroDiario from './LibroDiario';
import Facturacion from './Facturacion';
import NuevaCuentaForm from './NuevaCuentaForm';
import NuevaTransaccionForm from './NuevaTransaccionForm';
import NuevaFacturaForm from './NuevaFacturaForm';
import BalanceGeneral from './BalanceGeneral';
import EstadoResultados from './EstadoResultados';

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

function ModuloContabilidad() {
  const [value, setValue] = React.useState(0);
  const { user } = useAuth();

  console.log("Renderizando ModuloContabilidad");
  console.log("ModuloContabilidad - Usuario actual:", user);

  if (user.rol !== 'contador') {
    console.log("Usuario no autorizado, redirigiendo...");
    return <Navigate to="/unauthorized" />;
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  console.log("Renderizando contenido de ModuloContabilidad");
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Módulo de Contabilidad
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="contabilidad tabs">
          <Tab label="Balance General" />
          <Tab label="Estado de Resultados" />
          <Tab label="Plan de Cuentas" />
          <Tab label="Libro Diario" />
          <Tab label="Facturación" />
          <Tab label="Informes Financieros" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <BalanceGeneral />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <EstadoResultados />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <NuevaCuentaForm />
        <PlanCuentas />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <NuevaTransaccionForm />
        <LibroDiario />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <NuevaFacturaForm />
        <Facturacion />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <BalanceGeneral />
        <EstadoResultados />
      </TabPanel>
    </Box>
  );
}

export default ModuloContabilidad;