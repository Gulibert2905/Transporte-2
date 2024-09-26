import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Unauthorized.css';

function Unauthorized() {
  const { logout } = useAuth();

  return (
    <div className="unauthorized-container">
      <h1>Acceso No Autorizado</h1>
      <p>Lo sentimos, no tienes permiso para acceder a esta página.</p>
      <div className="unauthorized-actions">
        <Link to="/" className="button">Ir al Inicio</Link>
        <button onClick={logout} className="button logout-button">Cerrar Sesión</button>
      </div>
    </div>
  );
}

export default Unauthorized;