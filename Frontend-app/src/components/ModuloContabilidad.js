import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Divider
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BookIcon from '@mui/icons-material/Book';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import MoneyIcon from '@mui/icons-material/Money';
import NoteIcon from '@mui/icons-material/Note';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';

import PlanCuentas from './PlanCuentas';
import LibroDiario from './LibroDiario';
import NuevaCuentaForm from './NuevaCuentaForm';
import NuevaTransaccionForm from './NuevaTransaccionForm';
import BalanceGeneral from './BalanceGeneral';
import EstadoResultados from './EstadoResultados';
import Nomina from './Nomina';
import ComprobanteEgreso from './ComprobanteEgreso';
import ReciboCaja from './ReciboCaja';
import FacturaVenta from './FacturaVenta';
import NotaContabilidad from './NotaContabilidad';
import NotaDebitoCredito from './NotaDebitoCredito';
import FacturaCompra from './FacturaCompra';

const drawerWidth = 240;

function ModuloContabilidad() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  if (user.rol !== 'contador') {
    return <Navigate to="/unauthorized" />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleListItemClick = (index) => {
    setSelectedIndex(index);
    setMobileOpen(false);
  };

  const menuItems = [
    { text: 'Balance General', icon: <AccountBalanceIcon />, component: <BalanceGeneral /> },
    { text: 'Estado de Resultados', icon: <AssessmentIcon />, component: <EstadoResultados /> },
    { text: 'Plan de Cuentas', icon: <ListAltIcon />, component: <><NuevaCuentaForm /><PlanCuentas /></> },
    { text: 'Libro Diario', icon: <BookIcon />, component: <><NuevaTransaccionForm /><LibroDiario /></> },
    { text: 'Factura de Venta', icon: <ReceiptIcon />, component: <FacturaVenta /> },
    { text: 'Informes Financieros', icon: <BarChartIcon />, component: <><BalanceGeneral /><EstadoResultados /></> },
    { text: 'Nómina', icon: <PeopleIcon />, component: <Nomina /> },
    { text: 'Comprobante de Egreso', icon: <PaymentIcon />, component: <ComprobanteEgreso /> },
    { text: 'Recibo de Caja', icon: <MoneyIcon />, component: <ReciboCaja /> },
    { text: 'Notas de Contabilidad', icon: <NoteIcon />, component: <NotaContabilidad /> },
    { text: 'Notas Débito y Crédito', icon: <SwapHorizIcon />, component: <NotaDebitoCredito /> },
    { text: 'Factura de Compra', icon: <ShoppingBasketIcon />, component: <FacturaCompra /> },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem 
            button 
            key={item.text} 
            selected={selectedIndex === index}
            onClick={() => handleListItemClick(index)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Módulo de Contabilidad
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {menuItems[selectedIndex].component}
      </Box>
    </Box>
  );
}

export default ModuloContabilidad;