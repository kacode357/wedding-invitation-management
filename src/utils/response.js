// Standardized API response helpers following the standard format
// Success: { success: true, data: any }
// Error: { success: false, message: string, errors: [] }

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {any} data - Data to return
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function sendSuccess(res, data = null, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Send error response with single message
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 */
function sendError(res, message, statusCode = 400) {
  res.status(statusCode).json({
    success: false,
    message: message || "An error occurred",
    errors: [],
  });
}

/**
 * Send validation error response with multiple field errors
 * @param {object} res - Express response object
 * @param {Array<{message: string, field: string}>} errors - Array of field errors
 * @param {number} statusCode - HTTP status code (default: 400)
 */
function sendValidationError(res, errors, statusCode = 400) {
  res.status(statusCode).json({
    success: false,
    message: null,
    errors: errors || [],
  });
}

/**
 * Send paginated response (success with pagination metadata)
 * @param {object} res - Express response object
 * @param {any} items - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 */
function sendPaginatedResponse(res, items, page, limit, total) {
  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendPaginatedResponse,
};
