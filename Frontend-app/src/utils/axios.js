import axios from 'axios';

// Configuración base de axios
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor de peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        // Agregar token si existe
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('Request:', {
                url: config.url,
                method: config.method,
                data: config.data,
                headers: config.headers
            });
        }

        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
    (response) => {
        // Log en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('Response:', {
                status: response.status,
                data: response.data
            });
        }
        return response;
    },
    (error) => {
        // Manejar diferentes tipos de errores
        if (error.response) {
            // Error de respuesta del servidor
            switch (error.response.status) {
                case 401:
                    // Token inválido o expirado
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login?session=expired';
                    break;
                case 403:
                    // No autorizado
                    console.error('Acceso no autorizado');
                    window.location.href = '/unauthorized';
                    break;
                case 404:
                    // No encontrado
                    console.error('Recurso no encontrado');
                    break;
                case 500:
                    // Error del servidor
                    console.error('Error del servidor:', error.response.data);
                    break;
                default:
                    console.error('Error de respuesta:', error.response.data);
            }
        } else if (error.request) {
            // Error de red o sin respuesta
            console.error('Error de red:', error.request);
        } else {
            // Error en la configuración
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Funciones auxiliares para requests comunes
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