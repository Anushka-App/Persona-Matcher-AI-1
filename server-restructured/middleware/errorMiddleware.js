/**
 * Error handling middleware
 */
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  // Default error status and message
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log the error
  logger.error(`Error [${status}]: ${message}`, err);

  // Send error response
  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};

module.exports = errorMiddleware;
