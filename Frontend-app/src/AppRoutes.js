import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './components/Login';
import Unauthorized from './components/Unauthorized';
import SelectUser from './components/SelectUser';
import Home from './pages/Home';
import Dashboard from './components/Dashboard';
import DashboardFinanciero from './components/DashboardFinanciero';
import ModuloContabilidad from './components/ModuloContabilidad';
import UsersManagement from './components/UsersManagement';
import Prestadores from './components/Prestadores';
import Rutas from './pages/Rutas';
import Tarifas from './pages/Tarifas';
import Viajes from './components/Viajes';
import Pacientes from './components/Pacientes/Pacientes';
import Traslados from './components/Traslados/Traslados';
import VerificacionTraslados from './components/Traslados/VerificacionTraslados';
import ReportesTraslados from './components/Traslados/ReportesTraslados';
import Loading from './components/Loading';

function AppRoutes() {
    const { loading } = useAuth();

    if (loading) {
        return <Loading />;  // Muestra un componente de carga mientras se valida el token
    }

    const ProtectedRoute = ({ children, roles = [] }) => {
        const { user } = useAuth();
        
        if (!user) {
            console.log("ProtectedRoute - No hay usuario, redirigiendo a login");
            return <Navigate to="/login" replace />;
        }

        if (roles.length && !roles.includes(user.rol)) {
            console.log("ProtectedRoute - Usuario no autorizado", {
                userRol: user.rol,
                requiredRoles: roles
            });
            return <Navigate to="/unauthorized" replace />;
        }

        return <DashboardLayout>{children}</DashboardLayout>;
    };


return (
    
         <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

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
                {/* Nuevas rutas para el módulo de pacientes */}
                <Route
                    path="/pacientes"
                    element={
                        <ProtectedRoute roles={['admin', 'operador', 'auditor']}>
                            <Pacientes />
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path="/traslados"
                    element={
                        <ProtectedRoute roles={['admin', 'operador']}>
                            <Traslados />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/auditor/verificacion"
                    element={
                        <ProtectedRoute roles={['auditor']}>
                            <VerificacionTraslados />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reportes/traslados"
                    element={
                        <ProtectedRoute roles={['admin', 'auditor']}>
                            <ReportesTraslados />
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
    
);
}

export default AppRoutes;
