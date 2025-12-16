/**
 * Centralized Logging Utility
 * Uses Winston for structured, leveled logging
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', '..', 'logs');
fs.ensureDirSync(logsDir);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let msg = `${timestamp} [${service || 'app'}] ${level}: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'ai-visibility-dashboard' },
  transports: [
    // Console transport (development)
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test'
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Create service-specific loggers
function createServiceLogger(serviceName) {
  return {
    info: (message, meta = {}) => logger.info(message, { service: serviceName, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { service: serviceName, ...meta }),
    error: (message, meta = {}) => logger.error(message, { service: serviceName, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { service: serviceName, ...meta })
  };
}

module.exports = {
  logger,
  createServiceLogger
};

