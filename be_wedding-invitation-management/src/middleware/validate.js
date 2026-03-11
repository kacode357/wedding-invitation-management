// Request validation middleware
const { AppError } = require("../utils/appError");

/**
 * Validate request body against schema
 * @param {Function} validationFn - Validation function that returns { error, value }
 */
function validateRequest(validationFn) {
  return (req, res, next) => {
    const result = validationFn(req.body);
    
    if (result.error) {
      const errors = result.error.details || result.error;
      return next(new AppError("Validation error", 400, errors));
    }

    // Replace req.body with validated value
    req.body = result.value || req.body;
    next();
  };
}

/**
 * Validate query parameters
 */
function validateQuery(validationFn) {
  return (req, res, next) => {
    const result = validationFn(req.query);
    
    if (result.error) {
      const errors = result.error.details || result.error;
      return next(new AppError("Query validation error", 400, errors));
    }

    req.query = result.value || req.query;
    next();
  };
}

module.exports = {
  validateRequest,
  validateQuery,
};
