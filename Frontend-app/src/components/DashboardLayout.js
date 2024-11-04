import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, Avatar } from '@mui/material';
import { 
    Users, 
    Truck, 
    Map, 
    DollarSign, 
    Activity,
    LogOut,
    Calculator,
    BarChart2,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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