import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SelectUser.css';

function SelectUser() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectUser = async (username, password) => {
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="select-user-container">
      <h2>Seleccionar Usuario de Prueba</h2>
      <div className="user-buttons">
        <button onClick={() => handleSelectUser('admin', 'admin123')}>
          Admin
        </button>
        <button onClick={() => handleSelectUser('contador', 'contador123')}>
          Contador
        </button>
        <button onClick={() => handleSelectUser('administrativo', 'admin123')}>
          Administrativo
        </button>
      </div>
    </div>
  );
}

export default SelectUser;