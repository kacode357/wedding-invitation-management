// Category Controller - Request/Response Handler
const categoryService = require("../services/category.service");
const { sendSuccess } = require("../utils/response");
const { getMessages } = require("../responses");

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create new category
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, description: "Category name (unique)" }
 *     responses:
 *       201:
 *         description: Category created successfully
 */
exports.create = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);
    const category = await categoryService.create(req.body, lang);

    sendSuccess(res, { category }, 201, messages.COMMON.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
exports.findAll = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const categories = await categoryService.findAll({}, {}, lang);

    sendSuccess(res, { categories, count: categories.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 */
exports.findById = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const category = await categoryService.findById(id, lang);

    sendSuccess(res, { category }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: "Category name (unique)" }
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
exports.update = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const category = await categoryService.update(id, req.body, lang);

    sendSuccess(res, { category }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
exports.delete = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    await categoryService.delete(id, lang);

    sendSuccess(res, null, 200, messages.COMMON.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};
