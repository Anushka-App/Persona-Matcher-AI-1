/**
 * Validation utility functions
 */

/**
 * Check if value is undefined or null
 * @param {any} value - Value to check
 * @returns {boolean} True if value is undefined or null
 */
function isNil(value) {
  return value === undefined || value === null;
}

/**
 * Check if string is empty
 * @param {string} value - String to check
 * @returns {boolean} True if string is empty or not a string
 */
function isEmpty(value) {
  if (typeof value !== 'string') return true;
  return value.trim().length === 0;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
  if (isEmpty(email)) return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, message: string}} Validation result
 */
function validatePassword(password) {
  if (isEmpty(password)) {
    return { 
      valid: false, 
      message: 'Password cannot be empty' 
    };
  }
  
  if (password.length < 8) {
    return { 
      valid: false, 
      message: 'Password must be at least 8 characters long' 
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one number' 
    };
  }
  
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one letter' 
    };
  }
  
  return { 
    valid: true, 
    message: 'Password is valid' 
  };
}

/**
 * Sanitize string by trimming and removing special characters
 * @param {string} value - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  
  // Trim whitespace and remove potentially harmful characters
  return value
    .trim()
    .replace(/[<>]/g, '');
}

/**
 * Express middleware to validate request body fields
 * @param {object} schema - Schema defining required fields and their validators
 * @returns {function} Express middleware
 */
function validateRequest(schema) {
  return (req, res, next) => {
    const errors = [];
    
    Object.entries(schema).forEach(([field, validator]) => {
      // Skip validation if field is not required and is missing
      if (!validator.required && isNil(req.body[field])) {
        return;
      }
      
      // Check required fields
      if (validator.required && isNil(req.body[field])) {
        errors.push({ field, message: `${field} is required` });
        return;
      }
      
      // Skip further validation if field is missing
      if (isNil(req.body[field])) {
        return;
      }
      
      // Run custom validator if provided
      if (validator.validate) {
        const result = validator.validate(req.body[field]);
        if (result !== true && result !== undefined) {
          const message = typeof result === 'string' ? result : `Invalid ${field}`;
          errors.push({ field, message });
        }
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
}

module.exports = {
  isNil,
  isEmpty,
  isValidEmail,
  validatePassword,
  sanitizeString,
  validateRequest
};
