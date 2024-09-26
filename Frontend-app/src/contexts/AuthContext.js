import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/validate-token`);
          setUser(response.data.user);
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      console.log('API URL:', apiUrl);
      const loginUrl = `${apiUrl}/login`;
      console.log('Intentando login en:', loginUrl);
      const response = await axios.post(loginUrl, { username, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      console.log("Login exitoso - Usuario:", user);
    } catch (error) {
      console.error('Error de login:', error.response ? error.response.data : error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};