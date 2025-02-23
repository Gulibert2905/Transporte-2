import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ roles = [], children }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        console.log("ProtectedRoute - No hay usuario, redirigiendo a login");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles.length > 0 && !roles.includes(user.rol)) {
        console.log("ProtectedRoute - Usuario no autorizado", {
            userRol: user.rol,
            requiredRoles: roles
        });
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    console.log("ProtectedRoute - Acceso permitido para:", user.rol);
    return children;
};

export default ProtectedRoute;