import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 10000, // Aumentado a 10 segundos
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor de peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        if (process.env.NODE_ENV === 'development') {
            console.log('Request:', {
                url: config.url,
                method: config.method,
                hasToken: !!token
            });
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
                url: response.config.url,
                status: response.status,
                data: response.data
            });
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // Manejar errores específicos
            switch (error.response.status) {
                case 401:
                    if (!originalRequest._retry) {
                        originalRequest._retry = true;
                        try {
                            // Intentar validar el token
                            await axiosInstance.get('/api/auth/validate-token');
                            // Si la validación es exitosa, reintentar la petición original
                            return axiosInstance(originalRequest);
                        } catch (error) {
                            // Si falla la validación, redirigir al login
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/login?session=expired';
                        }
                    }
                    break;
                case 403:
                    console.error('Acceso no autorizado');
                    // Solo redirigir si no estamos ya en /unauthorized
                    if (!window.location.pathname.includes('unauthorized')) {
                        window.location.href = '/unauthorized';
                    }
                    break;
                case 404:
                    console.error('Recurso no encontrado:', error.config.url);
                    break;
                default:
                    console.error('Error de respuesta:', error.response.data);
            }
        } else if (error.request) {
            console.error('Error de red:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;