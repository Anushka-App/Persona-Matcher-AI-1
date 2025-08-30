/**
 * Logger utility for consistent logging throughout the application
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Determine if the current environment is production
 * @returns {boolean}
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Format log message with timestamp
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = getLogPrefix(level);
  
  let logMessage = `${timestamp} ${prefix} ${message}`;
  
  if (data) {
    const dataString = typeof data === 'object' 
      ? JSON.stringify(data, null, isProduction() ? 0 : 2)
      : data;
    
    logMessage += `\n${dataString}`;
  }
  
  return logMessage;
}

/**
 * Get emoji prefix for log level
 * @param {string} level - Log level
 * @returns {string} Emoji prefix
 */
function getLogPrefix(level) {
  switch (level) {
    case LOG_LEVELS.ERROR:
      return '❌';
    case LOG_LEVELS.WARN:
      return '⚠️';
    case LOG_LEVELS.INFO:
      return '✅';
    case LOG_LEVELS.DEBUG:
      return '🔍';
    default:
      return '📝';
  }
}

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error|any} error - Error object or data
 */
function error(message, error = null) {
  if (error instanceof Error) {
    console.error(formatLogMessage(LOG_LEVELS.ERROR, message));
    console.error(error);
  } else {
    console.error(formatLogMessage(LOG_LEVELS.ERROR, message, error));
  }
}

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {any} data - Additional data
 */
function warn(message, data = null) {
  console.warn(formatLogMessage(LOG_LEVELS.WARN, message, data));
}

/**
 * Log info message
 * @param {string} message - Info message
 * @param {any} data - Additional data
 */
function info(message, data = null) {
  console.log(formatLogMessage(LOG_LEVELS.INFO, message, data));
}

/**
 * Log debug message (only in non-production)
 * @param {string} message - Debug message
 * @param {any} data - Additional data
 */
function debug(message, data = null) {
  if (!isProduction()) {
    console.log(formatLogMessage(LOG_LEVELS.DEBUG, message, data));
  }
}

/**
 * Create a request logger for Express
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request
  debug(`${req.method} ${req.originalUrl}`);
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    
    const logFn = statusCode >= 400 ? warn : info;
    logFn(`${statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`);
  });
  
  next();
}

module.exports = {
  error,
  warn,
  info,
  debug,
  requestLogger
};
