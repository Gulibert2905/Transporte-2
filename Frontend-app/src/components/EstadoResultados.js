import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EstadoResultados() {
  const [resultados, setResultados] = useState({ ingresos: 0, gastos: 0, utilidad: 0 });

  useEffect(() => {
    const fetchResultados = async () => {
      const res = await axios.get('/api/contabilidad/estado-resultados');
      setResultados(res.data);
    };
    fetchResultados();
  }, []);

  const exportPDF = () => {
    window.open('/api/contabilidad/estado-resultados/pdf', '_blank');
  };

  const exportExcel = () => {
    window.open('/api/contabilidad/estado-resultados/excel', '_blank');
  };

  return (
    <div>
      <h2>Estado de Resultados</h2>
      <p>Ingresos: ${resultados.ingresos}</p>
      <p>Gastos: ${resultados.gastos}</p>
      <p>Utilidad: ${resultados.utilidad}</p>
      <button onClick={exportPDF}>Exportar a PDF</button>
      <button onClick={exportExcel}>Exportar a Excel</button>
    </div>
  );
}

export default EstadoResultados;