// Group Controller - Request/Response Handler
const groupService = require("../services/group.service");
const { sendSuccess } = require("../utils/response");
const { getMessages } = require("../responses");

/**
 * @swagger
 * /api/groups:
 *   post:
 *     tags: [Groups]
 *     summary: Create new group
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, description: "Group name (unique)" }
 *               priorityLevel: { type: number, description: "Priority level (non-negative integer, default 0)" }
 *     responses:
 *       201:
 *         description: Group created successfully
 */
exports.create = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const messages = getMessages(lang);
        const group = await groupService.create(req.body, lang);

        sendSuccess(res, { group }, 201, messages.COMMON.CREATE_SUCCESS);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/groups:
 *   get:
 *     tags: [Groups]
 *     summary: Get all groups
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Groups retrieved successfully
 */
exports.findAll = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const messages = getMessages(lang);

        const groups = await groupService.findAll({}, {}, lang);

        sendSuccess(res, { groups, count: groups.length }, 200, messages.COMMON.SUCCESS);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     tags: [Groups]
 *     summary: Get group by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group retrieved successfully
 */
exports.findById = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const messages = getMessages(lang);

        const { id } = req.params;
        const group = await groupService.findById(id, lang);

        sendSuccess(res, { group }, 200, messages.COMMON.SUCCESS);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/groups/{id}:
 *   put:
 *     tags: [Groups]
 *     summary: Update group
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
 *               name: { type: string }
 *               priorityLevel: { type: number }
 *     responses:
 *       200:
 *         description: Group updated successfully
 */
exports.update = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const messages = getMessages(lang);

        const { id } = req.params;
        const group = await groupService.update(id, req.body, lang);

        sendSuccess(res, { group }, 200, messages.COMMON.UPDATE_SUCCESS);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     tags: [Groups]
 *     summary: Delete group
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group deleted successfully
 */
exports.delete = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const messages = getMessages(lang);

        const { id } = req.params;
        await groupService.delete(id, lang);

        sendSuccess(res, null, 200, messages.COMMON.DELETE_SUCCESS);
    } catch (error) {
        next(error);
    }
};
