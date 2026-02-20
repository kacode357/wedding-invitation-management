// Guest Controller - Request/Response Handler
const guestService = require("../services/guest.service");
const { sendSuccess } = require("../utils/response");
const { getMessages } = require("../responses");

/**
 * @swagger
 * /api/guests:
 *   post:
 *     tags: [Guests]
 *     summary: Create a new guest
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [guestName]
 *             properties:
 *               guestName: { type: string, description: "Guest name (required)" }
 *               categoryId: { type: string, description: "Category ID reference (optional)" }
 *               numberOfGuests: { type: number, minimum: 1, maximum: 10, description: "Total guests invited (default: 1)" }
 *               confirmedGuests: { type: number, minimum: 0, description: "Guests confirmed to attend (defaults to numberOfGuests)" }
 *               invitationSent: { type: boolean, description: "Whether invitation has been sent (default: false)" }
 *               tableId: { type: string, description: "Table ID to assign guest to (optional)" }
 *               noteId: { type: string, description: "Note _id reference (optional)" }
 *               groupId: { type: string, description: "Group _id reference (optional)" }
 *     responses:
 *       201:
 *         description: Guest created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     guest:
 *                       type: object
 *                       properties:
 *                         _id: { type: string }
 *                         guestName: { type: string }
 *                         categoryId: { type: string }
 *                         categoryName: { type: string }
 *                         numberOfGuests: { type: number }
 *                         confirmedGuests: { type: number }
 *                         invitationSent: { type: boolean }
 *                         tableId: { type: string }
 *                         tableName: { type: string }
 *                         noteId: { type: string }
 *                         noteName: { type: string }
 *                         groupId: { type: string }
 *                         groupName: { type: string }
 *                         groupPriorityLevel: { type: number }
 *                         isArrived: { type: boolean }
 *                         arrivedAt: { type: string, format: date-time }
 *                         createdAt: { type: string, format: date-time }
 *                         updatedAt: { type: string, format: date-time }
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
 *             required:
 *               - guests
 *             properties:
 *               guests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     guestName: { type: string }
 *                     categoryId: { type: string, description: "Category ID" }
 *                     numberOfGuests: { type: number, minimum: 1, maximum: 10, description: "Total guests invited" }
 *                     confirmedGuests: { type: number, minimum: 0, description: "Guests confirmed to attend" }
 *                     tableId: { type: string }
*                     noteId: { type: string, description: "Note _id reference" }
 *                     groupId: { type: string, description: "Group _id reference" }
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
 *                           categoryName: { type: string }
 *                           numberOfGuests: { type: number, description: "Total guests invited" }
 *                           confirmedGuests: { type: number, description: "Guests confirmed to attend" }
 *                           invitationSent: { type: boolean }
 *                           tableId: { type: string }
 *                           tableName: { type: string }
 *                           noteId: { type: string }
 *                           noteName: { type: string }
 *                           groupId: { type: string }
 *                           groupName: { type: string }
 *                           groupPriorityLevel: { type: number }
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
*                         numberOfGuests: { type: number, description: "Total guests invited" }
*                         confirmedGuests: { type: number, description: "Guests confirmed to attend" }
*                         invitationSent: { type: boolean }
 *                         tableId: { type: string }
 *                         tableName: { type: string }
 *                         noteId: { type: string }
 *                         noteName: { type: string }
 *                         groupId: { type: string }
 *                         groupName: { type: string }
 *                         groupPriorityLevel: { type: number }
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
 *               numberOfGuests: { type: number, minimum: 1, maximum: 10, description: "Total guests invited" }
 *               confirmedGuests: { type: number, minimum: 0, description: "Guests confirmed to attend (can be less than numberOfGuests)" }
 *               tableId: { type: string }
 *               invitationSent: { type: boolean }
 *               noteId: { type: string, description: "Note _id reference" }
 *               groupId: { type: string, description: "Group _id reference (set to null to remove)" }
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

/**
 * @swagger
 * /api/guests/search/table:
 *   get:
 *     tags: [Guests]
 *     summary: Search for guest by ID and get table information
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: guestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Guest ID to search for
 *     responses:
 *       200:
 *         description: Guest and table information retrieved successfully
 */
exports.findByIdAndGetTable = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const messages = getMessages(lang);

    const { guestId } = req.query;

    if (!guestId) {
      return res.status(400).json({
        success: false,
        message: "Guest ID is required"
      });
    }

    const result = await guestService.findByIdAndGetTable(guestId, lang);

    sendSuccess(res, result, 200, messages.COMMON.SUCCESS);
  } catch (error) {
    next(error);
  }
};