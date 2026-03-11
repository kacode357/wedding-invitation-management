// Note Controller - API Layer
const noteService = require("../services/note.service");
const { sendSuccess } = require("../utils/response");

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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 enum:
 *                   - "Definitely (Confirmed) - 100%"
 *                   - "High probability of attending - over 50%"
 *                   - "High probability of not attending - under 50%"
 *                 description: "Note name - must be one of the predefined values"
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Validation error
 */
exports.createNote = async (req, res, next) => {
  try {
    const note = await noteService.createNote(req.body);
    sendSuccess(res, { note }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes:
 *   get:
 *     tags: [Notes]
 *     summary: Get all notes
 *     responses:
 *       200:
 *         description: List of notes
 */
exports.getAllNotes = async (req, res, next) => {
  try {
    const notes = await noteService.getAllNotes();
    sendSuccess(res, { notes }, 200, "Notes retrieved successfully");
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
    sendSuccess(res, { note }, 200);
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
*               name:
*                 type: string
*                 enum:
*                   - "Definitely (Confirmed) - 100%"
*                   - "High probability of attending - over 50%"
*                   - "High probability of not attending - under 50%"
*     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 */
exports.updateNote = async (req, res, next) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.body);
    sendSuccess(res, { note }, 200);
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
    sendSuccess(res, null, 200);
  } catch (error) {
    next(error);
  }
};
