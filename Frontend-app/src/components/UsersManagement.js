import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Alert
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rol: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/users');
            setUsers(response.data.users);
            setError('');
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Error al cargar usuarios: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '',
                rol: user.rol
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                rol: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', rol: '' });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await axiosInstance.put(`/users/${editingUser.id}`, formData);
                setSuccess('Usuario actualizado correctamente');
            } else {
                await axiosInstance.post('/users', formData);
                setSuccess('Usuario creado correctamente');
            }
            fetchUsers();
            handleCloseDialog();
            setError('');
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.response?.data?.message || 'Error al procesar la solicitud');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('¿Está seguro de eliminar este usuario?')) {
            try {
                await axiosInstance.delete(`/users/${userId}`);
                setSuccess('Usuario eliminado correctamente');
                fetchUsers();
                setError('');
            } catch (error) {
                setError('Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h2">
                    Gestión de Usuarios
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nuevo Usuario
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Fecha Creación</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.rol}</TableCell>
                                <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenDialog(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(user.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Usuario"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        {!editingUser && (
                            <TextField
                                fullWidth
                                type="password"
                                label="Contraseña"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                        )}
                        <FormControl fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={formData.rol}
                                label="Rol"
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                            >
                                <MenuItem value="admin">Administrador</MenuItem>
                                <MenuItem value="contador">Contador</MenuItem>
                                <MenuItem value="administrativo">Administrativo</MenuItem>
                                <MenuItem value="operador">Operador</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingUser ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersManagement;