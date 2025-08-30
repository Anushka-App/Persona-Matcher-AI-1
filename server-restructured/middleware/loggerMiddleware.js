/**
 * Request logger middleware
 */
const logger = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
  // Use the request logger from utils/logger
  logger.requestLogger(req, res, next);
};

module.exports = loggerMiddleware;
