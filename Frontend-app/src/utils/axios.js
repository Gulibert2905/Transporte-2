import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 7000,
    withCredentials: true, // Importante para CORS
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor de peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Asegurarse de que no haya doble /api/
        if (config.url.startsWith('/api/')) {
            config.url = config.url.replace('/api/', '/');
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            const originalRequest = error.config;
            
            // Remover el /api/ duplicado si existe
            if (originalRequest.url.startsWith('/api/')) {
                originalRequest.url = originalRequest.url.replace('/api/', '/');
            }

            switch (error.response.status) {
                case 401:
                    if (!originalRequest._retry) {
                        originalRequest._retry = true;
                        try {
                            await axiosInstance.get('/auth/validate-token');
                            return axiosInstance(originalRequest);
                        } catch (error) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }
                    }
                    break;
                case 403:
                    console.error('Error de autorización:', {
                        url: originalRequest.url,
                        method: originalRequest.method
                    });
                    window.location.href = '/unauthorized';
                    break;
                case 404:
                    console.error('Recurso no encontrado:', error.config.url);
                    break;
                default:
                    console.error('Error de respuesta:', error.response.data);
                    break;
            }
        } else if (error.request) {
            console.error('Error de red:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;