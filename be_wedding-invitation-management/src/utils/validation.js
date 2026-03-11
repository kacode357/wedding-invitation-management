// Validation Helper Utilities
const { ObjectId } = require("mongodb");
const { AppError } = require("./appError");

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @param {string} fieldName - Name of the field (for error message)
 * @throws {AppError} If ID is invalid
 */
const validateObjectId = (id, fieldName = "ID") => {
  if (!id) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  if (!ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName} format. Must be a valid 24-character hex string.`, 400);
  }

  return true;
};

/**
 * Validate multiple ObjectIds
 * @param {Object} ids - Object with key-value pairs of IDs to validate
 * @throws {AppError} If any ID is invalid
 * @example
 * validateObjectIds({
 *   courseId: "60d5f9b5e1b3c72d8c8b4567",
 *   teacherId: "60d5f9b5e1b3c72d8c8b4888"
 * });
 */
const validateObjectIds = (ids) => {
  for (const [fieldName, id] of Object.entries(ids)) {
    if (id) {
      // Only validate if value is provided (optional fields)
      validateObjectId(id, fieldName);
    }
  }
  return true;
};

/**
 * Validate required fields
 * @param {Object} data - Data object
 * @param {Array<string>} requiredFields - Array of required field names
 * @throws {AppError} If any required field is missing
 */
const validateRequired = (data, requiredFields) => {
  const missingFields = [];

  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0 && data[field] !== false) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400
    );
  }

  return true;
};

/**
 * Validate date range (start date must be before end date)
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @throws {AppError} If date range is invalid
 */
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    throw new AppError("Invalid start date format", 400);
  }

  if (isNaN(end.getTime())) {
    throw new AppError("Invalid end date format", 400);
  }

  if (start >= end) {
    throw new AppError("Start date must be before end date", 400);
  }

  return true;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {AppError} If email is invalid
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }
  return true;
};

/**
 * Validate enum value
 * @param {any} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Name of the field
 * @throws {AppError} If value is not in allowed values
 */
const validateEnum = (value, allowedValues, fieldName = "Value") => {
  if (!allowedValues.includes(value)) {
    throw new AppError(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`,
      400
    );
  }
  return true;
};

module.exports = {
  validateObjectId,
  validateObjectIds,
  validateRequired,
  validateDateRange,
  validateEmail,
  validateEnum,
};
