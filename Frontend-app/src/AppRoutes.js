import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import UsersManagement from './components/UsersManagement';
import Prestadores from './components/Prestadores';
import Rutas from './pages/Rutas';
import Tarifas from './pages/Tarifas';
import Viajes from './components/Viajes';
import Home from './pages/Home';
import Dashboard from './components/Dashboard';
import DashboardFinanciero from './components/DashboardFinanciero';
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
            {(user.rol === 'admin' || user.rol === 'contador') && (
              <>
                <Button color="inherit" component={Link} to="/prestadores">Prestadores</Button>
                <Button color="inherit" component={Link} to="/rutas">Rutas</Button>
                <Button color="inherit" component={Link} to="/tarifas">Tarifas</Button>
              </>
            )}
            <Button color="inherit" component={Link} to="/viajes">Viajes</Button>
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
            {user.rol === 'contador' && (
              <>
                <Button color="inherit" component={Link} to="/contabilidad">Contabilidad</Button>
                <Button color="inherit" component={Link} to="/dashboard-financiero">Dashboard Financiero</Button>
              </>
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

  // Componente de ruta protegida con layout
  const ProtectedRoute = ({ children, roles = [] }) => {
      const { user } = useAuth();
      
      if (!user) {
          return <Navigate to="/login" />;
      }

      if (roles.length && !roles.includes(user.rol)) {
          return <Navigate to="/unauthorized" />;
      }

      return <DashboardLayout>{children}</DashboardLayout>;
  };

  return (
      <AuthProvider>
          <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              {isDevelopment && (
                  <Route path="/select-user" element={<SelectUser />} />
              )}

              {/* Ruta principal */}
              <Route
                  path="/"
                  element={
                      <ProtectedRoute>
                          <Home />
                      </ProtectedRoute>
                  }
              />

              {/* Dashboard general */}
              <Route
                  path="/dashboard"
                  element={
                      <ProtectedRoute>
                          <Dashboard />
                      </ProtectedRoute>
                  }
              />

              {/* Rutas para admin y contador */}
              <Route
                  path="/prestadores"
                  element={
                      <ProtectedRoute roles={['admin', 'contador']}>
                          <Prestadores />
                      </ProtectedRoute>
                  }
              />

              <Route
                  path="/rutas"
                  element={
                      <ProtectedRoute roles={['admin', 'contador']}>
                          <Rutas />
                      </ProtectedRoute>
                  }
              />

              <Route
                  path="/tarifas"
                  element={
                      <ProtectedRoute roles={['admin', 'contador']}>
                          <Tarifas />
                      </ProtectedRoute>
                  }
              />

              {/* Rutas para todos los usuarios autenticados */}
              <Route 
                    path="/viajes" 
                    element={
                        <ProtectedRoute roles={['admin', 'contador', 'operador']}>
                            <Viajes />
                        </ProtectedRoute>
                    } 
                />

              {/* Rutas exclusivas para contador */}
              <Route
                  path="/contabilidad"
                  element={
                      <ProtectedRoute roles={['contador']}>
                          <ModuloContabilidad />
                      </ProtectedRoute>
                  }
              />

              <Route
                  path="/dashboard-financiero"
                  element={
                      <ProtectedRoute roles={['contador']}>
                          <DashboardFinanciero />
                      </ProtectedRoute>
                  }
              />

              {/* Rutas exclusivas para admin */}
              <Route
                  path="/users"
                  element={
                      <ProtectedRoute roles={['admin']}>
                          <UsersManagement />
                      </ProtectedRoute>
                  }
              />

              {/* Ruta para cualquier otra URL no definida */}
              <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </AuthProvider>
  );
}

export default AppRoutes;
