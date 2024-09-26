import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Prestadores from './components/Prestadores';
import Rutas from './pages/Rutas';
import Tarifas from './pages/Tarifas';
import Viajes from './components/Viajes';
import Home from './pages/Home';
import Dashboard from './components/Dashboard';
import Unauthorized from './components/Unauthorized';
import SelectUser from './components/SelectUser';
import ModuloContabilidad from './components/ModuloContabilidad';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

function Navigation() {
  const { user, logout } = useAuth();
  const isDevelopment = process.env.REACT_APP_ENV === 'development';
  console.log("Navigation - Usuario actual:", user);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Inicio
        </Typography>
        {user ? (
          <>
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
            {(user.rol === 'admin' || user.rol === 'contador') && (
              <>
                <Button color="inherit" component={Link} to="/prestadores">Prestadores</Button>
                <Button color="inherit" component={Link} to="/rutas">Rutas</Button>
                <Button color="inherit" component={Link} to="/tarifas">Tarifas</Button>
              </>
            )}
            <Button color="inherit" component={Link} to="/viajes">Viajes</Button>
            {user.rol === 'contador' && (
              <Button color="inherit" component={Link} to="/contabilidad">Contabilidad</Button>
            )}
            {isDevelopment && !user && (
              <Button color="inherit" component={Link} to="/select-user">Seleccionar Usuario (Dev)</Button>
            )}
            <Button color="inherit" onClick={logout}>Cerrar Sesión</Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login">Iniciar Sesión</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

function AppRoutes() {
  const isDevelopment = process.env.REACT_APP_ENV === 'development';

  return (
    <AuthProvider>
      <Box sx={{ flexGrow: 1 }}>
        <Navigation />
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/select-user" element={<SelectUser />} />

            <Route
              path="/contabilidad"
              element={
                <ProtectedRoute roles={['contador']}>
                  <ModuloContabilidad />
                </ProtectedRoute>
              }
            />

            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/prestadores" element={
              <PrivateRoute allowedRoles={['admin', 'contador']}>
                <Prestadores />
              </PrivateRoute>
            } />
            <Route path="/rutas" element={
              <PrivateRoute allowedRoles={['admin', 'contador']}>
                <Rutas />
              </PrivateRoute>
            } />
            <Route path="/tarifas" element={
              <PrivateRoute allowedRoles={['admin', 'contador']}>
                <Tarifas />
              </PrivateRoute>
            } />
            <Route path="/viajes" element={<PrivateRoute><Viajes /></PrivateRoute>} />

            {isDevelopment && (
              <Route path="/select-user" element={<SelectUser />} />
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
      </Box>
    </AuthProvider>
  );
}

export default AppRoutes;

