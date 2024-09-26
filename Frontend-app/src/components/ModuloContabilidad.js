import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PlanCuentas from './PlanCuentas';
import LibroDiario from './LibroDiario';
import Facturacion from './Facturacion';
import NuevaCuentaForm from './NuevaCuentaForm';
import NuevaTransaccionForm from './NuevaTransaccionForm';
import NuevaFacturaForm from './NuevaFacturaForm';
import BalanceGeneral from './BalanceGeneral';
import EstadoResultados from './EstadoResultados';

function ModuloContabilidad() {
  
    console.log("Renderizando ModuloContabilidad");
    const { user } = useAuth();
    console.log("ModuloContabilidad - Usuario actual:", user);

    if (user.rol !== 'contador') {
      console.log("Usuario no autorizado, redirigiendo...");
      return <Navigate to="/unauthorized" />;
    }

    console.log("Renderizando contenido de ModuloContabilidad");
    return (
      <div>
        <h1>Módulo de Contabilidad</h1>
          <Tabs defaultActiveKey="balance">
          <Tab eventKey="balanceGeneral" title="Balance General">
            <BalanceGeneral />
          </Tab>
          <Tab eventKey="estadoResultados" title="Estado de Resultados">
            <EstadoResultados />
          </Tab>
          <Tab eventKey="planCuentas" title="Plan de Cuentas">
            <NuevaCuentaForm />
            <PlanCuentas />
          </Tab>
          <Tab eventKey="libroDiario" title="Libro Diario">
            <NuevaTransaccionForm />
            <LibroDiario />
          </Tab>
          <Tab eventKey="facturacion" title="Facturación">
            <NuevaFacturaForm />
            <Facturacion />
          </Tab>
          <Tab eventKey="informes" title="Informes Financieros">
            <BalanceGeneral />
            <EstadoResultados />
          </Tab>
        </Tabs>
      </div>
      
    );
  } 

export default ModuloContabilidad;