import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Menu, 
  MenuItem,
  IconButton
} from '@mui/material';
import { 
  ArrowDropDown as ArrowDropDownIcon,
  PersonOutline as PersonIcon,
  TransferWithinAStation as TransferIcon,
  AssignmentTurnedIn as VerificationIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
    const { user, logout } = useAuth();
    const isDevelopment = process.env.REACT_APP_ENV === 'development';
    
    // Estados para los menús desplegables
    const [pacientesAnchorEl, setPacientesAnchorEl] = useState(null);
    const [adminAnchorEl, setAdminAnchorEl] = useState(null);
    const [contabilidadAnchorEl, setContabilidadAnchorEl] = useState(null);
  
    // Manejadores para los menús
    const handlePacientesMenuOpen = (event) => setPacientesAnchorEl(event.currentTarget);
    const handleAdminMenuOpen = (event) => setAdminAnchorEl(event.currentTarget);
    const handleContabilidadMenuOpen = (event) => setContabilidadAnchorEl(event.currentTarget);
    
    const handleMenuClose = () => {
      setPacientesAnchorEl(null);
      setAdminAnchorEl(null);
      setContabilidadAnchorEl(null);
    };
  
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            CEMEDIC
          </Typography>
  
          {user && (
            <>
              {/* Menú de Pacientes y Traslados */}
              {(user.rol === 'admin' || user.rol === 'operador' || user.rol === 'auditor') && (
                <>
                  <Button
                    color="inherit"
                    onClick={handlePacientesMenuOpen}
                    endIcon={<ArrowDropDownIcon />}
                    startIcon={<PersonIcon />}
                  >
                    Gestión Pacientes
                  </Button>
                  <Menu
                    anchorEl={pacientesAnchorEl}
                    open={Boolean(pacientesAnchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem 
                      component={Link} 
                      to="/pacientes" 
                      onClick={handleMenuClose}
                    >
                      <PersonIcon sx={{ mr: 1 }} /> Pacientes
                    </MenuItem>
                    
                    {(user.rol === 'admin' || user.rol === 'operador') && (
                      <MenuItem 
                        component={Link} 
                        to="/traslados" 
                        onClick={handleMenuClose}
                      >
                        <TransferIcon sx={{ mr: 1 }} /> Traslados
                      </MenuItem>
                    )}
                    
                    {user.rol === 'auditor' && (
                      <MenuItem 
                        component={Link} 
                        to="/auditor/verificacion" 
                        onClick={handleMenuClose}
                      >
                        <VerificationIcon sx={{ mr: 1 }} /> Verificación
                      </MenuItem>
                    )}
                    
                    {(user.rol === 'admin' || user.rol === 'auditor') && (
                      <MenuItem 
                        component={Link} 
                        to="/reportes/traslados" 
                        onClick={handleMenuClose}
                      >
                        <ReportIcon sx={{ mr: 1 }} /> Reportes
                      </MenuItem>
                    )}
                  </Menu>
                </>
              )}
  
              {/* Menú de Administración */}
              {(user.rol === 'admin' || user.rol === 'contador') && (
                <>
                  <Button
                    color="inherit"
                    onClick={handleAdminMenuOpen}
                    endIcon={<ArrowDropDownIcon />}
                  >
                    Administración
                  </Button>
                  <Menu
                    anchorEl={adminAnchorEl}
                    open={Boolean(adminAnchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem 
                      component={Link} 
                      to="/prestadores" 
                      onClick={handleMenuClose}
                    >
                      Prestadores
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/rutas" 
                      onClick={handleMenuClose}
                    >
                      Rutas
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/tarifas" 
                      onClick={handleMenuClose}
                    >
                      Tarifas
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/viajes" 
                      onClick={handleMenuClose}
                    >
                      Viajes
                    </MenuItem>
                  </Menu>
                </>
              )}
  
              {/* Menú de Contabilidad */}
              {user.rol === 'contador' && (
                <>
                  <Button
                    color="inherit"
                    onClick={handleContabilidadMenuOpen}
                    endIcon={<ArrowDropDownIcon />}
                  >
                    Contabilidad
                  </Button>
                  <Menu
                    anchorEl={contabilidadAnchorEl}
                    open={Boolean(contabilidadAnchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem 
                      component={Link} 
                      to="/contabilidad" 
                      onClick={handleMenuClose}
                    >
                      Módulo Contabilidad
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/dashboard-financiero" 
                      onClick={handleMenuClose}
                    >
                      Dashboard Financiero
                    </MenuItem>
                  </Menu>
                </>
              )}
  
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
  
              {isDevelopment && !user && (
                <Button color="inherit" component={Link} to="/select-user">
                  Seleccionar Usuario (Dev)
                </Button>
              )}
  
              <Button color="inherit" onClick={logout}>
                Cerrar Sesión
              </Button>
            </>
          )}
  
          {!user && (
            <Button color="inherit" component={Link} to="/login">
              Iniciar Sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>
    );
  }

  export default Navigation;