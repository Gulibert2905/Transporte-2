import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BalanceGeneral() {
  const [balance, setBalance] = useState({ activos: 0, pasivos: 0, patrimonio: 0 });

  useEffect(() => {
    const fetchBalance = async () => {
      const res = await axios.get('/api/contabilidad/balance-general');
      setBalance(res.data);
    };
    fetchBalance();
  }, []);

  const exportPDF = () => {
    window.open('/api/contabilidad/balance-general/pdf', '_blank');
  };

  const exportExcel = () => {
    window.open('/api/contabilidad/balance-general/excel', '_blank');
  };

  return (
    <div>
      <h2>Balance General</h2>
      <p>Activos: ${balance.activos}</p>
      <p>Pasivos: ${balance.pasivos}</p>
      <p>Patrimonio: ${balance.patrimonio}</p>
      <button onClick={exportPDF}>Exportar a PDF</button>
      <button onClick={exportExcel}>Exportar a Excel</button>
    </div>
  );
}

export default BalanceGeneral;