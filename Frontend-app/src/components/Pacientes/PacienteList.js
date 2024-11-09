import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function PacienteList({ pacientes, onUpdate, setError, setSuccess }) {
  // Verifica que pacientes sea un array
  const listaPacientes = Array.isArray(pacientes) ? pacientes : [];

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este paciente?')) {
      try {
        await axiosInstance.delete(`/pacientes/${id}`);
        setSuccess('Paciente eliminado exitosamente');
        onUpdate();
      } catch (err) {
        setError('Error al eliminar el paciente');
        console.error('Error:', err);
      }
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Documento</TableCell>
            <TableCell>Nombres</TableCell>
            <TableCell>Apellidos</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listaPacientes.map((paciente) => (
            <TableRow key={paciente.id}>
              <TableCell>{paciente.tipo_documento} {paciente.documento}</TableCell>
              <TableCell>{paciente.nombres}</TableCell>
              <TableCell>{paciente.apellidos}</TableCell>
              <TableCell>{paciente.telefono}</TableCell>
              <TableCell>{paciente.categoria}</TableCell>
              <TableCell>
                <Tooltip title="Editar">
                  <IconButton color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton 
                    color="error"
                    onClick={() => handleDelete(paciente.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PacienteList;