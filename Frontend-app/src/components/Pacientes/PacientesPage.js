import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import axiosInstance from '../../utils/axios';
import PacienteForm from './PacienteForm';
import PacienteList from './PacienteList';

function PacientesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pacientes');
      setPacientes(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los pacientes');
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
        Gestión de Pacientes
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
          <Tab label="Lista de Pacientes" />
          <Tab label="Registrar Paciente" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <PacienteList 
          pacientes={pacientes} 
          onUpdate={fetchPacientes}
          setError={setError}
          setSuccess={setSuccess}
        />
      )}

      {activeTab === 1 && (
        <PacienteForm 
          onSuccess={() => {
            fetchPacientes();
            setSuccess('Paciente registrado exitosamente');
            setActiveTab(0);
          }}
          setError={setError}
        />
      )}
    </Box>
  );
}

export default PacientesPage;