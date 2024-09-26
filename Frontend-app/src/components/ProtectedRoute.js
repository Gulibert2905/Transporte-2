import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ roles, children }) => {
  console.log("ProtectedRoute - Roles requeridos:", roles);
  const { user } = useAuth();
  console.log("ProtectedRoute - Usuario actual:", user);

  if (!user) {
    console.log("ProtectedRoute - No hay usuario, redirigiendo a login");
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.rol)) {
    console.log("ProtectedRoute - Usuario no autorizado, redirigiendo");
    return <Navigate to="/unauthorized" />;
  }

  console.log("ProtectedRoute - Acceso permitido");
  return children;
};

export default ProtectedRoute;