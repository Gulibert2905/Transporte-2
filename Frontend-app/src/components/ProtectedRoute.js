// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Box } from '@mui/material';

const ProtectedRoute = ({ roles = [], children }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si es admin, permitir acceso
    if (user.rol === 'admin') {
        return children;
    }

    // Verificar roles
    if (roles.length > 0 && !roles.includes(user.rol)) {
        return (
            <Box p={3}>
                <Alert severity="error">
                    No tienes permisos para acceder a esta sección.
                    Rol requerido: {roles.join(', ')}
                </Alert>
            </Box>
        );
    }

    return children;
};

export default ProtectedRoute;