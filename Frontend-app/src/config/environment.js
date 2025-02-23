// Frontend-app/src/config/environment.js
const environments = {
    development: {
      api: {
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
        timeout: 5000
      },
      features: {
        enableLogs: true,
        enableDevTools: true
      }
    },
    production: {
      api: {
        baseURL: process.env.REACT_APP_API_URL,
        timeout: 10000
      },
      features: {
        enableLogs: false,
        enableDevTools: false
      }
    }
  };
  
  export const getEnvironmentConfig = () => {
    const env = process.env.REACT_APP_ENV || 'development';
    return environments[env];
  };
  
  // Ejemplo de uso en componentes:
  import { getEnvironmentConfig } from '../config/environment';
  
  const config = getEnvironmentConfig();
  const apiClient = axios.create({
    baseURL: config.api.baseURL,
    timeout: config.api.timeout
  });