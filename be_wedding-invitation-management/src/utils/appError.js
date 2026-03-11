// Custom Application Error class for consistent error handling
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

function isAppError(error) {
  return error instanceof AppError;
}

module.exports = { AppError, isAppError };
