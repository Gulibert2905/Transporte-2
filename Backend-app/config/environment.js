// Backend-app/config/environment.js

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', `.env.${process.env.NODE_ENV || 'development'}`)
});

const baseConfig = {
  app: {
    name: 'CEMEDIC',
    port: process.env.PORT || 3000,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: '24h',
    bcryptRounds: 10
  },
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
  }
};

const environments = {
  development: {
    ...baseConfig,
    db: {
      username: "root",
      password: process.env.DB_PASSWORD,
      database: "cemedic",
      host: "127.0.0.1",
      dialect: "mysql",
      logging: true,
      dialectOptions: {
        dateStrings: true,
        typeCast: true
      },
      timezone: "+00:00"
    },
    cors: {
      origin: 'http://localhost:3000',
      credentials: true
    },
    logging: {
      level: 'debug',
      saveToFile: false
    }
  },
  
  production: {
    ...baseConfig,
    db: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        dateStrings: true,
        typeCast: true,
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      timezone: "+00:00",
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    },
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    },
    logging: {
      level: 'error',
      saveToFile: true
    }
  }
};

const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const config = environments[env];
  
  if (!config) {
    throw new Error(`Environment ${env} not supported`);
  }
  
  return config;
};

module.exports = getConfig;