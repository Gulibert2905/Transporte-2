import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Inicializar el usuario desde localStorage si existe
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            
            try {
                const response = await axiosInstance.get('/auth/validate-token');
                if (response.data.success) {
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } else {
                    await logout();
                }
            } catch (error) {
                console.error('Error validando token:', error);
                await logout();
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axiosInstance.post('/auth/login', {
                username,
                password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Intentar hacer logout en el servidor
            await axiosInstance.post('/auth/logout').catch(() => {
                // Ignorar errores del servidor durante el logout
                console.log('Error en logout del servidor');
            });
        } finally {
            // Siempre limpiar el estado local
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        setUser // Exportar setUser si necesitas actualizar el usuario desde otros componentes
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};