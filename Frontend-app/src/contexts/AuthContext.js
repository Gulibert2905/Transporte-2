import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('Intentando login en:', `${process.env.REACT_APP_API_URL}/auth/login`);
            
            const response = await axios.post('/auth/login', {
                username,
                password
            });

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            setUser(user);
            
            console.log('Login exitoso - Usuario:', user);
            
            return { success: true, user };
        } catch (error) {
            console.error('Error de login:', error.response?.data || error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const validateToken = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;

            const response = await axios.post('/auth/validate-token', { token });
            return response.data.success;
        } catch (error) {
            console.error('Error validando token:', error);
            logout();
            return false;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await axios.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            validateToken,
            changePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};