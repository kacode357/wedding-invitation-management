// Note Controller - API Layer
const noteService = require("../services/note.service");
const { sendSuccess, sendList } = require("../utils/response");

/**
 * @swagger
 * /api/notes:
 *   post:
 *     tags: [Notes]
 *     summary: Create a new note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendanceStatus
 *             properties:
 *               attendanceStatus:
 *                 type: string
 *                 enum: [definitely, highly_likely, unlikely, custom_prediction]
 *                 description: |
 *                   - definitely: Confirmed - 100% attendance
 *                   - highly_likely: Over 50% chance of attendance
 *                   - unlikely: Under 50% chance of attendance
 *                   - custom_prediction: Custom prediction
 *               customPrediction:
 *                 type: string
 *                 description: "Custom prediction text (required when attendanceStatus is custom_prediction)"
 *               invitedCount:
 *                 type: number
 *                 description: "Number of guests invited (default: 1)"
 *               predictedCount:
 *                 type: number
 *                 description: "Predicted number of attendees"
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Validation error
 */
exports.createNote = async (req, res, next) => {
  try {
    const note = await noteService.createNote(req.body);
    sendSuccess(res, 201, "Note created successfully", note);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes:
 *   get:
 *     tags: [Notes]
 *     summary: Get all notes with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of notes
 */
exports.getAllNotes = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await noteService.getAllNotes({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    sendList(res, 200, "Notes retrieved successfully", result.notes, result.pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     tags: [Notes]
 *     summary: Get note by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note details
 *       404:
 *         description: Note not found
 */
exports.getNoteById = async (req, res, next) => {
  try {
    const note = await noteService.getNoteById(req.params.id);
    sendSuccess(res, 200, "Note retrieved successfully", note);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes/noteId/{noteId}:
 *   get:
 *     tags: [Notes]
 *     summary: Get note by noteId (e.g., NOTE-001)
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note identifier (e.g., NOTE-001)
 *     responses:
 *       200:
 *         description: Note details
 *       404:
 *         description: Note not found
 */
exports.getNoteByNoteId = async (req, res, next) => {
  try {
    const note = await noteService.getNoteByNoteId(req.params.noteId);
    sendSuccess(res, 200, "Note retrieved successfully", note);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     tags: [Notes]
 *     summary: Update note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendanceStatus:
 *                 type: string
 *                 enum: [definitely, highly_likely, unlikely, custom_prediction]
 *               customPrediction:
 *                 type: string
 *               invitedCount:
 *                 type: number
 *               predictedCount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 */
exports.updateNote = async (req, res, next) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.body);
    sendSuccess(res, 200, "Note updated successfully", note);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     tags: [Notes]
 *     summary: Delete note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 */
exports.deleteNote = async (req, res, next) => {
  try {
    await noteService.deleteNote(req.params.id);
    sendSuccess(res, 200, "Note deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes/options/attendance-status:
 *   get:
 *     tags: [Notes]
 *     summary: Get attendance status options
 *     responses:
 *       200:
 *         description: List of attendance status options
 */
exports.getAttendanceStatusOptions = async (req, res, next) => {
  try {
    const options = noteService.getAttendanceStatusOptions();
    sendSuccess(res, 200, "Attendance status options retrieved successfully", options);
  } catch (error) {
    next(error);
  }
};
