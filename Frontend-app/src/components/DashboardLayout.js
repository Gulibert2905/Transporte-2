import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, Avatar } from '@mui/material';
import { 
   
    Truck, 
    Map, 
    DollarSign, 
    FileText,
    Thermometer,
    Activity,
    LogOut,
    Calculator,
    BarChart2,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
    LocalHospital, // Cambiado de HistoriaClinicaIcon
    PersonOutline,
    TransferWithinAStation,
    AssignmentTurnedIn,
    Assessment
} from '@mui/icons-material';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        // Menú para todos los usuarios
        {
            title: 'Dashboard',
            path: '/dashboard',
            icon: <Activity />,
            roles: ['admin', 'contador']
        },

        // Menú de Pacientes y Traslados
        {
            title: 'Pacientes',
            path: '/pacientes',
            icon: <PersonOutline />,
            roles: ['admin', 'operador', 'auditor']
        },
        {
            title: 'Traslados',
            path: '/traslados',
            icon: <TransferWithinAStation />,
            roles: ['admin', 'operador']
        },
        {
            title: 'Verificación',
            path: '/auditor/verificacion',
            icon: <AssignmentTurnedIn />,
            roles: ['auditor']
        },
        // Agregar el menú de Historias Clínicas después de Traslados
        {
            title: 'Historias Clínicas',
            path: '/historias-clinicas',
            icon: <LocalHospital />,
            roles: ['admin', 'medico', 'enfermero', 'auditor']
        },
        {
            title: 'Reportes de Traslados',
            path: '/reportes/traslados',
            icon: <Assessment />,
            roles: ['admin', 'auditor']
        },
        
        // Menú para admin y contador
        {
            title: 'Prestadores',
            path: '/prestadores',
            icon: <Truck />,
            roles: ['admin', 'contador']
        },
        {
            title: 'Rutas',
            path: '/rutas',
            icon: <Map />,
            roles: ['admin', 'contador']
        },
        {
            title: 'Tarifas',
            path: '/tarifas',
            icon: <DollarSign />,
            roles: ['admin', 'contador']
        },
        {
            title: 'Viajes',
            path: '/viajes',
            icon: <Map />,
            roles: ['admin', 'contador']
        },
        // Menú solo para contador
        {
            title: 'Contabilidad',
            path: '/contabilidad',
            icon: <Calculator />,
            roles: ['contador']
        },
        {
            title: 'Dashboard Financiero',
            path: '/dashboard-financiero',
            icon: <BarChart2 />,
            roles: ['contador']
        },
        // Menú solo para admin
        {
            title: 'Gestión de Usuarios',
            path: '/users',
            icon: <UserPlus />,
            roles: ['admin']
        },
        // Menú para médicos
    {
        title: 'Dashboard Médico',
        path: '/medico/dashboard',
        icon: <Activity />,
        roles: ['medico']
    },
    {
        title: 'Mis Pacientes',
        path: '/medico/pacientes',
        icon: <PersonOutline />,
        roles: ['medico']
    },
    {
        title: 'Consultas',
        path: '/medico/consultas',
        icon: <LocalHospital />,
        roles: ['medico']
    },

    // Menú para enfermeros
    {
        title: 'Dashboard Enfermería',
        path: '/enfermeria/dashboard',
        icon: <Activity />,
        roles: ['enfermero']
    },
    {
        title: 'Pacientes Asignados',
        path: '/enfermeria/pacientes',
        icon: <PersonOutline />,
        roles: ['enfermero']
    },
    {
        title: 'Signos Vitales',
        path: '/enfermeria/signos-vitales',
        icon: <Thermometer/>,
        roles: ['enfermero']
    },
    {
        title: 'Notas de Enfermería',
        path: '/enfermeria/notas',
        icon: <FileText/>,
        roles: ['enfermero']
    }

    
        

        
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                        backgroundColor: '#1976d2',
                        color: 'white'
                    }
                }}
            >
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" component="div" sx={{ color: 'white' }}>
                        CEMEDIC
                    </Typography>
                </Box>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
                
                <List>
                    {menuItems.map((item) => (
                        item.roles.includes(user?.rol) && (
                            <ListItem
                                button
                                key={item.path}
                                component={Link}
                                to={item.path}
                                selected={location.pathname === item.path}
                                sx={{
                                    color: 'white',
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: 'white' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.title} />
                            </ListItem>
                        )
                    ))}
                </List>

                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)', mt: 'auto' }} />
                
                <Box sx={{ p: 2, mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 1 }}>{user?.username?.[0]?.toUpperCase()}</Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                                {user?.username}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {user?.rol}
                            </Typography>
                        </Box>
                    </Box>
                    <ListItem
                        button
                        onClick={handleLogout}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'white' }}>
                            <LogOut />
                        </ListItemIcon>
                        <ListItemText primary="Cerrar Sesión" />
                    </ListItem>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '240px' }}>
                {children}
            </Box>
        </Box>
    );
};

export default DashboardLayout;