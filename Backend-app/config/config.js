const path = require('path');

const getConfig = () => {
    // Asegurarse de que estamos usando el archivo .env correcto
    require('dotenv').config({
        path: path.join(__dirname, '..', `.env.${process.env.NODE_ENV || 'development'}`)
    });

    const baseConfig = {
        app: {
            name: 'CEMEDIC',
            port: process.env.PORT || 3000,
            apiUrl: process.env.REACT_APP_API_URL,
            env: process.env.NODE_ENV || 'development',
        },
        db: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            dialect: 'mysql',
            logging: process.env.NODE_ENV !== 'production',
            dialectOptions: {
                dateStrings: true,
                typeCast: true
            },
            timezone: '+00:00'
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: '24h'
        },
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true
        }
    };

    const envConfig = {
        development: {
            ...baseConfig,
            app: {
                ...baseConfig.app,
                isDev: true
            },
            db: {
                ...baseConfig.db,
                logging: console.log
            }
        },
        production: {
            ...baseConfig,
            app: {
                ...baseConfig.app,
                isDev: false
            },
            db: {
                ...baseConfig.db,
                logging: false,
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            }
        }
    };

    return envConfig[process.env.NODE_ENV || 'development'];
};

module.exports = getConfig();