import React, { useState } from 'react';
import {Button, Grid } from '@mui/material';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import axiosInstance from '../../utils/axios';

function PacienteExcel({ onSuccess, setError }) {
  const [loading, setLoading] = useState(false);

  const handleImport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axiosInstance.post('/pacientes/importar', formData);
      onSuccess(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'Error en la importación');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pacientes/exportar');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(response.data);
      XLSX.utils.book_append_sheet(wb, ws, "Pacientes");
      XLSX.writeFile(wb, `pacientes_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      setError('Error al exportar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axiosInstance.get('/pacientes/plantilla');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(response.data);
      XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
      XLSX.writeFile(wb, "plantilla_pacientes.xlsx");
    } catch (error) {
      setError('Error al descargar plantilla');
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Button
          fullWidth
          variant="outlined"
          onClick={downloadTemplate}
          startIcon={<FileSpreadsheet />}
          disabled={loading}
        >
          Descargar Plantilla
        </Button>
      </Grid>

      <Grid item xs={12} md={4}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleImport(e.target.files[0])}
          style={{ display: 'none' }}
          id="excel-import"
        />
        <Button
          fullWidth
          variant="contained"
          component="label"
          htmlFor="excel-import"
          startIcon={<Upload />}
          disabled={loading}
        >
          Importar Pacientes
        </Button>
      </Grid>

      <Grid item xs={12} md={4}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleExport}
          startIcon={<Download />}
          disabled={loading}
        >
          Exportar Pacientes
        </Button>
      </Grid>
    </Grid>
  );
}

export default PacienteExcel;