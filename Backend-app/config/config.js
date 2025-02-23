// config/config.js
const path = require('path');
require('dotenv').config();

const getConfig = () => {
    // Cargar el archivo .env correcto
    require('dotenv').config({
        path: path.join(__dirname, '..', `.env.${process.env.NODE_ENV || 'development'}`)
    });

    return {
        development: {
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cemedic',
            host: process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            logging: true,
            dialectOptions: {
                dateStrings: true,
                typeCast: true
            },
            timezone: '+00:00'
        },
        production: {
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cemedic',
            host: process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            logging: false,
            dialectOptions: {
                dateStrings: true,
                typeCast: true
            },
            timezone: '+00:00',
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    };
};

// Debug
console.log('Database Configuration:', {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    dialect: 'mysql',
    user: process.env.DB_USER
});

module.exports = getConfig();