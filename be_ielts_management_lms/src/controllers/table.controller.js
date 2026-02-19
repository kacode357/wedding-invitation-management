// Table Controller - Request/Response Handler
const tableService = require("../services/table.service");
const { sendSuccess } = require("../utils/response");
const { getMessages } = require("../responses");

/**
 * @swagger
 * /api/tables:
 *   post:
 *     tags: [Tables]
 *     summary: Create new table
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tableName]
 *             properties:
 *               tableName: { type: string }
 *               capacity: { type: number, minimum: 1, maximum: 20, description: "Optional, defaults to 10" }
 *               guestIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Optional array of guest IDs to assign to the table"
 *     responses:
 *       201:
 *         description: Table created successfully
 */
exports.create = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);
    const table = await tableService.create(req.body, lang);

    sendSuccess(res, { table }, 201, messages.COMMON.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables:
 *   get:
 *     tags: [Tables]
 *     summary: Get all tables
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (e.g., "tableNumber", "createdAt")
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Tables retrieved successfully
 */
exports.findAll = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { sort, order } = req.query;

    let options = {};
    if (sort) {
      const sortOrder = order === "asc" ? 1 : -1;
      options.sort = { [sort]: sortOrder };
    }

    const tables = await tableService.findAll({}, options, lang);

    sendSuccess(res, { tables, count: tables.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     tags: [Tables]
 *     summary: Get table by ID with guest details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Table retrieved successfully with guest details
 */
exports.findById = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const table = await tableService.findById(id, lang);

    sendSuccess(res, { table }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     tags: [Tables]
 *     summary: Update table
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
 *               tableName: { type: string }
 *               tableNumber: { type: number }
 *               capacity: { type: number, minimum: 1, maximum: 20 }
 *     responses:
 *       200:
 *         description: Table updated successfully
 */
exports.update = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const table = await tableService.update(id, req.body, lang);

    sendSuccess(res, { table }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     tags: [Tables]
 *     summary: Delete table
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Table deleted successfully
 */
exports.delete = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    await tableService.delete(id, lang);

    sendSuccess(res, null, 200, messages.COMMON.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/{id}/guests:
 *   get:
 *     tags: [Tables]
 *     summary: Get guests at a specific table
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guests retrieved successfully
 */
exports.getGuests = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const guests = await tableService.getGuests(id, lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/{id}/with-guests:
 *   get:
 *     tags: [Tables]
 *     summary: Get table with all details including guests
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Table with guests retrieved successfully
 */
exports.getTableWithGuests = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const table = await tableService.getTableWithGuests(id, lang);

    sendSuccess(res, { table }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/{id}/rename:
 *   put:
 *     tags: [Tables]
 *     summary: Rename table
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
 *             required: [tableName]
 *             properties:
 *               tableName: { type: string }
 *     responses:
 *       200:
 *         description: Table renamed successfully
 */
exports.rename = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const { tableName } = req.body;

    const table = await tableService.rename(id, tableName, lang);

    sendSuccess(res, { table }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/stats:
 *   get:
 *     tags: [Tables]
 *     summary: Get table statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const stats = await tableService.getStatistics(lang);

    sendSuccess(res, { stats }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/available:
 *   get:
 *     tags: [Tables]
 *     summary: Get available tables (tables with available seats)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Available tables retrieved successfully
 */
exports.findAvailableTables = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const tables = await tableService.findAvailableTables(lang);

    sendSuccess(res, { tables, count: tables.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/bulk:
 *   post:
 *     tags: [Tables]
 *     summary: Bulk create tables
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required: [tableName]
 *               properties:
 *                 tableName: { type: string }
 *                 capacity: { type: number, minimum: 1, maximum: 20, description: "Optional, defaults to 10" }
 *                 guestIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: "Optional array of guest IDs to assign to the table"
 *     responses:
 *       201:
 *         description: Tables created successfully
 */
exports.bulkCreate = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { tables } = req.body;

    if (!Array.isArray(tables) || tables.length === 0) {
      return res.status(400).json({
        success: false,
        message: "An array of table data is required"
      });
    }

    const result = await tableService.bulkCreate(tables, lang);

    sendSuccess(res, { result }, 201, messages.COMMON.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/available-guests:
 *   get:
 *     tags: [Tables]
 *     summary: Get guests available to be assigned to tables (unassigned guests)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Available guests retrieved successfully
 */
exports.getAvailableGuests = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const guests = await tableService.getAvailableGuests(lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/{id}/remove-guests:
 *   put:
 *     tags: [Tables]
 *     summary: Remove guests from a table
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [guestIds]
 *             properties:
 *               guestIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Array of guest IDs to remove from the table"
 *     responses:
 *       200:
 *         description: Guests removed successfully
 */
exports.removeGuests = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const { guestIds } = req.body;

    if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "guestIds array is required"
      });
    }

    const table = await tableService.removeGuests(id, guestIds, lang);

    sendSuccess(res, { table }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tables/swap-guests:
 *   post:
 *     tags: [Tables]
 *     summary: Swap guests between two tables
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [guestId1, guestId2]
 *             properties:
 *               guestId1:
 *                 type: string
 *                 description: "First guest ID (will go to second guest's table)"
 *               guestId2:
 *                 type: string
 *                 description: "Second guest ID (will go to first guest's table)"
 *     responses:
 *       200:
 *         description: Guests swapped successfully
 */
exports.swapGuests = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { guestId1, guestId2 } = req.body;

    if (!guestId1 || !guestId2) {
      return res.status(400).json({
        success: false,
        message: "guestId1 and guestId2 are required"
      });
    }

    const result = await tableService.swapGuests(guestId1, guestId2, lang);

    sendSuccess(res, { result }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};
