import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor de peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        // Debug logs
        console.log('Token en interceptor:', token);
        console.log('URL de la petición:', config.url);
        
        // Asegurarnos de que headers existe
        config.headers = config.headers || {};
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        console.error('Error en interceptor de petición:', error);
        return Promise.reject(error);
    }
);
// Interceptor de respuestas
axiosInstance.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Response:', {
                status: response.status,
                data: response.data
            });
        }
        return response;
    },
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.error('Token inválido o expirado');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login?session=expired';
                    break;
                case 403:
                    console.error('Acceso no autorizado');
                    window.location.href = '/unauthorized';
                    break;
                case 404:
                    console.error('Recurso no encontrado');
                    break;
                case 500:
                    console.error('Error del servidor:', error.response.data);
                    break;
                default:
                    console.error('Error de respuesta:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

// API helper functions
export const api = {
    get: async (url, config = {}) => {
        try {
            const response = await axiosInstance.get(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    post: async (url, data = {}, config = {}) => {
        try {
            const response = await axiosInstance.post(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    put: async (url, data = {}, config = {}) => {
        try {
            const response = await axiosInstance.put(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    delete: async (url, config = {}) => {
        try {
            const response = await axiosInstance.delete(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default axiosInstance;