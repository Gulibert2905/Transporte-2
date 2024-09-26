import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalViajes: 0,
    promedioTarifa: 0,
    viajesPorMes: [],
    tarifasPorPrestador: [],
    viajesPorRuta: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  };

  if (loading) return <div>Cargando datos del dashboard...</div>;
  if (error) return <div>{error}</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="dashboard-container">
      <h2>Dashboard de Viajes y Tarifas</h2>
      
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total de Viajes</h3>
          <p>{stats.totalViajes}</p>
        </div>
        <div className="stat-card">
          <h3>Tarifa Promedio</h3>
          <p>${stats.promedioTarifa.toFixed(2)}</p>
        </div>
      </div>

      <div className="chart-container">
        <h3>Viajes por Mes</h3>
        <LineChart width={600} height={300} data={stats.viajesPorMes}>
          <XAxis dataKey="mes" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="viajes" stroke="#8884d8" />
        </LineChart>
      </div>

      <div className="chart-container">
        <h3>Tarifas por Prestador</h3>
        <BarChart width={600} height={300} data={stats.tarifasPorPrestador}>
          <XAxis dataKey="nombre" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Bar dataKey="tarifaPromedio" fill="#82ca9d" />
        </BarChart>
      </div>

      <div className="chart-container">
        <h3>Distribución de Viajes por Ruta</h3>
        <PieChart width={400} height={400}>
          <Pie
            data={stats.viajesPorRuta}
            cx={200}
            cy={200}
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="viajes"
          >
            {
              stats.viajesPorRuta.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))
            }
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}

export default Dashboard;