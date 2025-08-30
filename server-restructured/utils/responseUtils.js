/**
 * Utility functions for standardizing API responses
 */

/**
 * Create a success response
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 * @returns {object} Standardized success response
 */
function success(data, message = 'Success', status = 200) {
  return {
    status: 'success',
    code: status,
    message,
    timestamp: new Date().toISOString(),
    data
  };
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {object|null} details - Error details
 * @returns {object} Standardized error response
 */
function error(message = 'Error', status = 500, details = null) {
  const response = {
    status: 'error',
    code: status,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (details) {
    response.details = details;
  }
  
  return response;
}

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 */
function sendSuccess(res, data, message = 'Success', status = 200) {
  res.status(status).json(success(data, message, status));
}

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {object|null} details - Error details
 */
function sendError(res, message = 'Error', status = 500, details = null) {
  res.status(status).json(error(message, status, details));
}

module.exports = {
  success,
  error,
  sendSuccess,
  sendError
};
