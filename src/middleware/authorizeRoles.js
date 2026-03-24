// Role-based authorization middleware
const { AppError } = require("../utils/appError");
const MESSAGES = require("../constants/messages");

/**
 * Check if user has required role(s)
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(MESSAGES.ERROR.UNAUTHORIZED, 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required roles: ${allowedRoles.join(", ")}`,
          403
        )
      );
    }

    next();
  };
}

module.exports = authorizeRoles;
