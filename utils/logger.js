const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');
require('winston-daily-rotate-file');

// Define log directory
const logDir = path.join(__dirname, '..', 'log');

// Create directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log format with timestamp, errors, and structured data
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Daily rotation transport
const dailyRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
  level: 'info',
});

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    new transports.File({
      filename: path.join(logDir, 'combined.log')
    }),
    dailyRotateTransport,
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  ],
  exitOnError: false
});

module.exports = logger;
