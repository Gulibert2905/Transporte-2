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
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const validateToken = async () => {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const response = await axiosInstance.get('/auth/validate-token');
                        if (response.data.success) {
                            setUser(response.data.user);
                        } else {
                            logout();
                        }
                    } catch (error) {
                        console.error('Error validando token:', error);
                        logout();
                    }
                }
                setLoading(false);
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

        const logout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        };

        const value = {
            user,
            loading,
            login,
            logout
        };

        return (
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        );
    };