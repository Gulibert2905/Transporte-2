import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Prestadores from './pages/Prestadores';
import Rutas from './pages/Rutas';
import Tarifas from './pages/Tarifas';
import Viajes from './components/Viajes';
import Home from './pages/Home';
import Dashboard from './components/Dashboard';
import Unauthorized from './components/Unauthorized';
import SelectUser from './components/SelectUser';
import ModuloContabilidad from './components/ModuloContabilidad';

function Navigation() {
  const { user, logout } = useAuth();
  const isDevelopment = process.env.REACT_APP_ENV === 'development';
  console.log("Navigation - Usuario actual:", user);
  return (
    <nav>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        {user && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            {(user.rol === 'admin' || user.rol === 'contador') && (
              <>
                <li><Link to="/prestadores">Prestadores</Link></li>
                <li><Link to="/rutas">Rutas</Link></li>
                <li><Link to="/tarifas">Tarifas</Link></li>
              </>
            )}
            <li><Link to="/viajes">Viajes</Link></li>
            {user && user.rol === 'contador' && (
            <li><Link to="/contabilidad">Contabilidad</Link></li>
            )}
            {isDevelopment && !user && (
              <li><Link to="/select-user">Seleccionar Usuario (Dev)</Link></li>
            )}
            <li><button onClick={logout}>Cerrar Sesión</button></li>
          </>
        )}
        {!user && (
          <li><Link to="/login">Iniciar Sesión</Link></li>
        )}
      </ul>
    </nav>
  );
}

function AppRoutes() {
  const isDevelopment = process.env.REACT_APP_ENV === 'development';

  return (
    <AuthProvider>
      <Router>
        <div>
          <Navigation />

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

            {/* Unauthorized route */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Private routes */}
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

            {/* Development routes */}
            {isDevelopment && (
              <Route path="/select-user" element={<SelectUser />} />
            )}

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default AppRoutes;

