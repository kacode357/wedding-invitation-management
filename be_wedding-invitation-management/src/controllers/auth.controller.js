// Auth Controller - Request/Response Handler
const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");
const { getMessages } = require("../responses");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, role]
 *             properties:
 *               email: { type: string }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               role: { type: string, enum: [student, teacher, admin] }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
exports.register = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);
    const user = await authService.register(req.body, lang);
    
    sendSuccess(res, { user }, 201, messages.AUTH.REGISTER_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
exports.login = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);
    const { email, password } = req.body;
    
    const { user, token } = await authService.login(email, password, lang);
    
    sendSuccess(res, { token, user }, 200, messages.AUTH.LOGIN_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Logout successful
 */
exports.logout = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);
    sendSuccess(res, null, 200, messages.AUTH.LOGOUT_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Get user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile retrieved
 */
exports.getProfile = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);
    const profileData = await authService.getProfile(req.user.userId, lang);
    
    sendSuccess(res, profileData, 200, messages.AUTH.PROFILE_RETRIEVED);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags: [Authentication]
 *     summary: Update user profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               avatar: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);
    const user = await authService.updateProfile(req.user.userId, req.body, lang);
    
    sendSuccess(res, { user }, 200, messages.AUTH.PROFILE_UPDATED);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     tags: [Authentication]
 *     summary: Change password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password changed
 */
exports.changePassword = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);
    const { currentPassword, newPassword } = req.body;
    
    await authService.changePassword(req.user.userId, currentPassword, newPassword, lang);
    
    sendSuccess(res, null, 200, messages.AUTH.PASSWORD_CHANGED);
  } catch (error) {
    next(error);
  }
};
