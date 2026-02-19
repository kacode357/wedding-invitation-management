// Guest Controller - Request/Response Handler
const guestService = require("../services/guest.service");
const { sendSuccess } = require("../utils/response");
const { getMessages } = require("../responses");

/**
 * @swagger
 * /api/guests:
 *   post:
 *     tags: [Guests]
 *     summary: Create new guest
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [guestName]
 *             properties:
 *               guestName: { type: string }
 *               categoryId: { type: string, description: "Category ID (optional)" }
 *               phone: { type: string }
 *               numberOfGuests: { type: number, minimum: 1, maximum: 10 }
 *               tableId: { type: string }
 *               notes: { type: string }
 *               noteId: { type: string, description: "Note ID (e.g., NOTE-001)" }
 *     responses:
 *       201:
 *         description: Guest created successfully
 */
exports.create = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);
    const guest = await guestService.create(req.body, lang);

    sendSuccess(res, { guest }, 201, messages.COMMON.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/bulk:
 *   post:
 *     tags: [Guests]
 *     summary: Bulk create guests
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [guests]
 *             properties:
 *               guests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     guestName: { type: string }
 *                     categoryId: { type: string, description: "Category ID" }
 *                     phone: { type: string }
 *                     numberOfGuests: { type: number, minimum: 1, maximum: 10 }
 *                     tableId: { type: string }
 *                     notes: { type: string }
 *     responses:
 *       201:
 *         description: Guests created successfully
 */
exports.bulkCreate = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { guests } = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({
        success: false,
        message: "An array of guest data is required"
      });
    }

    const result = await guestService.bulkCreate(guests, lang);

    sendSuccess(res, { guests: result.guests, count: result.count }, 201, messages.COMMON.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests:
 *   get:
 *     tags: [Guests]
 *     summary: Get all guests
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (e.g., "category", "createdAt")
 *     responses:
 *       200:
 *         description: Guests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     guests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id: { type: string }
 *                           guestName: { type: string }
 *                           categoryId: { type: string }
 *                           category: { type: string }
 *                           phone: { type: string }
 *                           numberOfGuests: { type: number }
 *                           invitationSent: { type: boolean }
 *                           tableId: { type: string }
 *                           tableName: { type: string }
 *                           noteId: { type: string, description: "Note ID (e.g., NOTE-001)" }
 *                           note: 
 *                             type: object
 *                             properties:
 *                               noteId: { type: string }
 *                               attendanceStatus: { type: string }
 *                               customPrediction: { type: string }
 *                               invitedCount: { type: number }
 *                               predictedCount: { type: number }
 *                           isArrived: { type: boolean }
 *                           arrivedAt: { type: string, format: date-time }
 *                           createdAt: { type: string, format: date-time }
 *                           updatedAt: { type: string, format: date-time }
 */
exports.findAll = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { category, sort, order } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }

    let options = {};
    if (sort) {
      const sortOrder = order === "asc" ? 1 : -1;
      options.sort = { [sort]: sortOrder };
    }

    const guests = await guestService.findAll(query, options, lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/{id}:
 *   get:
 *     tags: [Guests]
 *     summary: Get guest by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guest retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     guest:
 *                       type: object
 *                       properties:
 *                         _id: { type: string }
 *                         guestName: { type: string }
 *                         categoryId: { type: string }
 *                         category: { type: string }
 *                         phone: { type: string }
 *                         numberOfGuests: { type: number }
 *                         invitationSent: { type: boolean }
 *                         tableId: { type: string }
 *                         tableName: { type: string }
 *                         noteId: { type: string, description: "Note ID (e.g., NOTE-001)" }
 *                         note: 
 *                           type: object
 *                           properties:
 *                             noteId: { type: string }
 *                             attendanceStatus: { type: string }
 *                             customPrediction: { type: string }
 *                             invitedCount: { type: number }
 *                             predictedCount: { type: number }
 *                         isArrived: { type: boolean }
 *                         arrivedAt: { type: string, format: date-time }
 *                         createdAt: { type: string, format: date-time }
 *                         updatedAt: { type: string, format: date-time }
 */
exports.findById = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const guest = await guestService.findById(id, lang);

    sendSuccess(res, { guest }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/category/{categoryId}:
 *   get:
 *     tags: [Guests]
 *     summary: Get guests by category
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Guests retrieved successfully
 */
exports.findByCategory = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { categoryId } = req.params;
    const guests = await guestService.findByCategory(categoryId, lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/unassigned:
 *   get:
 *     tags: [Guests]
 *     summary: Get unassigned guests
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unassigned guests retrieved successfully
 */
exports.findUnassigned = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const guests = await guestService.findUnassigned(lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/assigned:
 *   get:
 *     tags: [Guests]
 *     summary: Get all guests who have already booked a table
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Assigned guests retrieved successfully
 */
exports.findAssigned = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const guests = await guestService.findAssigned(lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/invitations:
 *   get:
 *     tags: [Guests]
 *     summary: Get guests with invitation filter
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [invited, uninvited]
 *         description: "Filter by invitation status: 'invited' or 'uninvited'"
 *     responses:
 *       200:
 *         description: Guests retrieved successfully
 */
exports.findByInvitationStatus = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { status } = req.query;
    const guests = await guestService.findByInvitationStatus(status, lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/{id}:
 *   put:
 *     tags: [Guests]
 *     summary: Update guest
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
 *               guestName: { type: string }
 *               categoryId: { type: string, description: "Category ID" }
 *               phone: { type: string }
 *               numberOfGuests: { type: number, minimum: 1, maximum: 10 }
 *               tableId: { type: string }
 *               invitationSent: { type: boolean }
 *               notes: { type: string }
 *               noteId: { type: string, description: "Note ID (e.g., NOTE-001)" }
 *     responses:
 *       200:
 *         description: Guest updated successfully
 */
exports.update = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const guest = await guestService.update(id, req.body, lang);

    sendSuccess(res, { guest }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/{id}:
 *   delete:
 *     tags: [Guests]
 *     summary: Delete guest
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guest deleted successfully
 */
exports.delete = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    await guestService.delete(id, lang);

    sendSuccess(res, null, 200, messages.COMMON.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/table/{tableId}/assign:
 *   put:
 *     tags: [Guests]
 *     summary: Assign multiple guests to a table
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID to assign guests to
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
 *                 description: Array of guest IDs to assign to the table
 *     responses:
 *       200:
 *         description: Guests assigned successfully
 */
exports.assignTable = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { tableId } = req.params;
    const { guestIds } = req.body;

    // Validate guestIds array
    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "guestIds must be a non-empty array"
      });
    }

    const guests = await guestService.assignTableToMultipleGuests(guestIds, tableId, lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/stats:
 *   get:
 *     tags: [Guests]
 *     summary: Get guest statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const stats = await guestService.getStatistics(lang);

    sendSuccess(res, { stats }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/{id}/invitation/sent:
 *   put:
 *     tags: [Guests]
 *     summary: Mark invitation as sent
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation marked as sent
 */
exports.markInvitationSent = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const guest = await guestService.markInvitationSent(id, lang);

    sendSuccess(res, { guest }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/{id}/invitation/not-sent:
 *   put:
 *     tags: [Guests]
 *     summary: Mark invitation as not sent
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation marked as not sent
 */
exports.markInvitationNotSent = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const guest = await guestService.markInvitationNotSent(id, lang);

    sendSuccess(res, { guest }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/arrived:
 *   get:
 *     tags: [Guests]
 *     summary: Get all arrived guests
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Arrived guests retrieved successfully
 */
exports.findArrived = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const guests = await guestService.findArrived(lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/unarrived:
 *   get:
 *     tags: [Guests]
 *     summary: Get all invited guests who haven't arrived yet
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unarrived guests retrieved successfully
 */
exports.findUnarrived = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const guests = await guestService.findUnarrived(lang);

    sendSuccess(res, { guests, count: guests.length }, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/guests/{id}/arrived:
 *   put:
 *     tags: [Guests]
 *     summary: Check in a guest (mark as arrived)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guest checked in successfully
 */
exports.checkIn = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { id } = req.params;
    const guest = await guestService.checkInGuest(id, lang);

    sendSuccess(res, { guest }, 200, messages.COMMON.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};