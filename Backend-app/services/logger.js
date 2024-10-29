// services/logger.js
const winston = require('winston');
const path = require('path');
const getConfig = require('../config/environment');

const config = getConfig();

const createLogger = () => {
  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  );

  const transports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ];

  if (process.env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );
  }

  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    format: logFormat,
    transports
  });
};

const logger = createLogger();

const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.debug({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: req.headers
    });
  }
  next();
};

module.exports = {
  logger,
  requestLogger
};