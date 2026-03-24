// Auth Service - Business Logic Layer
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { AppError } = require("../utils/appError");
const { getMessages } = require("../responses");

class AuthService {
  /**
   * Generate JWT token
   */
  generateToken(userId, email, role) {
    return jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token, lang = "en") {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      const messages = getMessages(lang);
      throw new AppError(messages.COMMON.INVALID_TOKEN, 401);
    }
  }

  /**
   * Register a new user
   */
  async register(userData, lang = "en") {
    const messages = getMessages(lang);
    const { email, password, firstName, lastName, role, phone } = userData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      throw new AppError(messages.AUTH.VALIDATION_ERROR, 400);
    }

    // Validate role
    if (!role) {
      throw new AppError(messages.AUTH.ROLE_REQUIRED, 400);
    }

    // Validate password strength
    if (password.length < 8) {
      throw new AppError(messages.AUTH.PASSWORD_TOO_SHORT, 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError(messages.AUTH.EMAIL_ALREADY_EXISTS, 409);
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role,
      phone,
      isActive: true,
    });

    // Remove password from response
    delete user.password;

    // Generate token
    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return { user, token };
  }

  /**
   * Login user
   */
  async login(email, password, lang = "en") {
    const messages = getMessages(lang);
    
    // Validate input
    if (!email || !password) {
      throw new AppError(messages.AUTH.EMAIL_PASSWORD_REQUIRED, 400);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError(messages.AUTH.INVALID_CREDENTIALS, 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(messages.AUTH.ACCOUNT_DEACTIVATED, 403);
    }

    // Verify password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(messages.AUTH.INVALID_CREDENTIALS, 401);
    }

    // Update last login
    await User.updateById(user._id.toString(), { lastLogin: new Date() });

    // Generate token
    const token = this.generateToken(user._id.toString(), user.email, user.role);

    // Remove password from response
    delete user.password;

    return { user, token };
  }

  /**
   * Get user profile
   */
  async getProfile(userId, lang = "en") {
    const messages = getMessages(lang);
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(messages.AUTH.USER_NOT_FOUND, 404);
    }

    // Remove password
    delete user.password;

    return { user };
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword, lang = "en") {
    const messages = getMessages(lang);
    
    // Validate input
    if (!currentPassword || !newPassword) {
      throw new AppError(messages.AUTH.EMAIL_PASSWORD_REQUIRED, 400);
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new AppError(messages.AUTH.PASSWORD_TOO_SHORT, 400);
    }

    if (currentPassword === newPassword) {
      throw new AppError(messages.AUTH.PASSWORD_MUST_DIFFER, 400);
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(messages.AUTH.USER_NOT_FOUND, 404);
    }

    // Verify current password
    const isPasswordValid = await User.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError(messages.AUTH.CURRENT_PASSWORD_INCORRECT, 401);
    }

    // Update password
    await User.updateById(userId, { password: newPassword });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId, lang = "en") {
    const messages = getMessages(lang);
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError(messages.AUTH.USER_NOT_FOUND, 404);
    }
    
    delete user.password;
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData, lang = "en") {
    const messages = getMessages(lang);
    
    // Don't allow updating sensitive fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;

    const user = await User.updateById(userId, updateData);

    if (!user) {
      throw new AppError(messages.AUTH.USER_NOT_FOUND, 404);
    }

    delete user.password;
    return user;
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId, lang = "en") {
    const messages = getMessages(lang);
    const user = await User.updateById(userId, { isActive: false });

    if (!user) {
      throw new AppError(messages.AUTH.USER_NOT_FOUND, 404);
    }
  }

  /**
   * Reactivate user account (Admin only)
   */
  async reactivateAccount(userId, lang = "en") {
    const messages = getMessages(lang);
    const user = await User.updateById(userId, { isActive: true });

    if (!user) {
      throw new AppError(messages.AUTH.USER_NOT_FOUND, 404);
    }
  }

  /**
   * Verify email exists
   */
  async emailExists(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
  }
}

module.exports = new AuthService();
