import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  
} from '@mui/material';
import axiosInstance from '../../utils/axios';
import TrasladoForm from './TrasladoForm';
import TrasladoList from './TrasladoList';
import TrasladosPendientes from './TrasladosPendientes';  // Agregar esta importación
import { useAuth } from '../../contexts/AuthContext';

function TrasladosPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [traslados, setTraslados] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trasladosRes, pacientesRes] = await Promise.all([
        axiosInstance.get('/traslados'),
        axiosInstance.get('/pacientes')
      ]);
      setTraslados(trasladosRes.data);
      setPacientes(pacientesRes.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos');
      setLoading(false);
      console.error('Error:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Gestión de Traslados
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Lista de Traslados" />
          <Tab label="Registrar Traslado" />
          {user.rol === 'auditor' && <Tab label="Pendientes de Verificación" />}
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <TrasladoList 
          traslados={traslados} 
          onUpdate={fetchData}
          setError={setError}
          setSuccess={setSuccess}
        />
      )}

      {activeTab === 1 && (
        <TrasladoForm 
          pacientes={pacientes}
          onSuccess={() => {
            fetchData();
            setSuccess('Traslado registrado exitosamente');
            setActiveTab(0);
          }}
          setError={setError}
        />
      )}

      {activeTab === 2 && user.rol === 'auditor' && (
        <TrasladosPendientes
          traslados={traslados.filter(t => !t.verificado_auditor)}
          onVerificar={fetchData}
          setError={setError}
          setSuccess={setSuccess}
        />
      )}
    </Box>
  );
}

export default TrasladosPage;