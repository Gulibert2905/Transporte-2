import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './components/Login';
import Unauthorized from './components/Unauthorized';
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
import RegistroHistoriaClinica from './components/HistoriaClinica/RegistroHistoriaClinica';
import ListadoHistoriasClinicas from './components/HistoriaClinica/ListadoHistoriasClinicas';
import DetalleHistoriaClinica from './components/HistoriaClinica/DetalleHistoriaClinica';
import DashboardMedico from './components/Medico/DashboardMedico';
import PacientesMedico from './components/Medico/PacientesMedico';
import ConsultasMedicas from './components/Medico/ConsultasMedicas';
import DashboardEnfermeria from './components/Enfermeria/DashboardEnfermeria';
import PacientesEnfermeria from './components/Enfermeria/PacientesEnfermeria';
import SignosVitales from './components/Enfermeria/SignosVitales';
import NotasEnfermeria from './components/Enfermeria/NotasEnfermeria';
import HistoriasClinicas from './components/HistoriaClinica/HistoriasClinicas';

function AppRoutes() {
    const { loading } = useAuth();

    if (loading) {
        return <Loading />;
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
                    <ProtectedRoute roles={['admin', 'medico', 'enfermero', 'contador']}>
                        <Home />
                    </ProtectedRoute>
                }
            />

            {/* Dashboard general */}
            {/* Dashboard general - solo para admin y contador */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute roles={['admin', 'contador']}>
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
            {/* Rutas de Historia Clínica */}
            <Route path="/historia-clinica">
            <Route
        path="crear/:trasladoId"
        element={
            <ProtectedRoute roles={['admin', 'medico', 'enfermero']}>
                <RegistroHistoriaClinica />
            </ProtectedRoute>
        }
    />
    
    {/* Listado de historias */}
    <Route
        path="listado"
        element={
            <ProtectedRoute roles={['admin', 'medico', 'enfermero', 'auditor']}>
                <ListadoHistoriasClinicas />
            </ProtectedRoute>
        }
    />

    {/* Ver detalle */}
    <Route
        path=":id"
        element={
            <ProtectedRoute roles={['admin', 'medico', 'enfermero', 'auditor']}>
                <DetalleHistoriaClinica />
            </ProtectedRoute>
        }
    />
    </Route>
    {/* Editar historia */}
    <Route
        path=":id/editar"
        element={
            <ProtectedRoute roles={['admin', 'medico', 'enfermero']}>
                <RegistroHistoriaClinica modo="edicion" />
            </ProtectedRoute>
        }
    />

            {/* Rutas para médicos */}
            <Route
                path="/medico/dashboard"
                element={
                    <ProtectedRoute roles={['medico']}>
                        <DashboardMedico />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/medico/pacientes"
                element={
                    <ProtectedRoute roles={['medico']}>
                        <PacientesMedico />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/medico/consultas"
                element={
                    <ProtectedRoute roles={['medico']}>
                        <ConsultasMedicas />
                    </ProtectedRoute>
                }
            />

            {/* Rutas para enfermeros */}
            <Route
                path="/enfermeria/dashboard"
                element={
                    <ProtectedRoute roles={['enfermero']}>
                        <DashboardEnfermeria />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/enfermeria/pacientes"
                element={
                    <ProtectedRoute roles={['enfermero']}>
                        <PacientesEnfermeria />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/enfermeria/signos-vitales"
                element={
                    <ProtectedRoute roles={['enfermero']}>
                        <SignosVitales />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/enfermeria/notas"
                element={
                    <ProtectedRoute roles={['enfermero']}>
                        <NotasEnfermeria />
                    </ProtectedRoute>
                }
            />

            {/* Rutas compartidas */}
            <Route
                path="/historias-clinicas"
                element={
                    <ProtectedRoute roles={['medico', 'enfermero', 'admin']}>
                        <HistoriasClinicas />
                    </ProtectedRoute>
                }
            />
            
            {/* Ruta para cualquier otra URL no definida */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    
);
}

export default AppRoutes;
