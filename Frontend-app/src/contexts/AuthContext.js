import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función para verificar el token
    const validateToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axiosInstance.get('/auth/validate-token');
                if (response.data.valid) {
                    setUser(JSON.parse(localStorage.getItem('user')));
                } else {
                    logout();
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        validateToken();
    }, []);

    const login = async (username, password) => {
        try {
          const response = await axiosInstance.post('/auth/login', {
            username,
            password
          });
      
          const { token, user } = response.data;
          
          // Añade verificación
          if (!token) {
            throw new Error('No se recibió token del servidor');
          }
      
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Log de verificación
          console.log('Token guardado:', token);
          console.log('Usuario guardado:', user);
      
          setUser(user);
          
          return { success: true, user };
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};