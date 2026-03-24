// Note Service - Business Logic Layer
const Note = require("../models/note.model");
const { ATTENDANCE_STATUS, ATTENDANCE_LABELS, VALIDATION_MESSAGES } = require("../constants/enums/note.enum");
const { AppError } = require("../utils/appError");

/**
 * Validate attendance status
 * @param {string} status - Attendance status
 * @throws {AppError} - If status is invalid
 */
function validateAttendanceStatus(status) {
  const validStatuses = Object.values(ATTENDANCE_STATUS);
  if (status && !validStatuses.includes(status)) {
    throw new AppError(VALIDATION_MESSAGES.INVALID_STATUS, 400);
  }
}

/**
 * Validate custom prediction format
 * @param {string} customPrediction - Custom prediction text
 * @throws {AppError} - If format is invalid
 */
function validateCustomPrediction(customPrediction) {
  // Expected format: "invited X but predict Y will go" or similar
  if (customPrediction && !customPrediction.trim()) {
    throw new AppError(VALIDATION_MESSAGES.PREDICTION_REQUIRED, 400);
  }
}

/**
 * Create a new note
 * @param {Object} data - Note data
 * @returns {Object} - Created note
 */
async function createNote(data) {
  // Validate attendance status
  validateAttendanceStatus(data.attendanceStatus);

  // Validate custom prediction if status is custom_prediction
  if (data.attendanceStatus === ATTENDANCE_STATUS.CUSTOM_PREDICTION) {
    validateCustomPrediction(data.customPrediction);
  }

  const note = await Note.create(data);
  return note;
}

/**
 * Get all notes
 * @returns {Array} - Array of notes
 */
async function getAllNotes() {
  const notes = await Note.find({}, { sort: { createdAt: -1 } });
  return notes;
}

/**
 * Get note by ID
 * @param {string} id - Note ID
 * @returns {Object} - Note
 */
async function getNoteById(id) {
  const note = await Note.findById(id);
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  return note;
}

/**
 * Update note
 * @param {string} id - Note ID
 * @param {Object} data - Update data
 * @returns {Object} - Updated note
 */
async function updateNote(id, data) {
  // Validate attendance status if provided
  if (data.attendanceStatus) {
    validateAttendanceStatus(data.attendanceStatus);
  }

  // Validate custom prediction if status is custom_prediction
  const existingNote = await Note.findById(id);
  if (!existingNote) {
    throw new AppError("Note not found", 404);
  }

  const newStatus = data.attendanceStatus || existingNote.attendanceStatus;
  const newPrediction = data.customPrediction || existingNote.customPrediction;

  if (newStatus === ATTENDANCE_STATUS.CUSTOM_PREDICTION && !newPrediction) {
    throw new AppError(VALIDATION_MESSAGES.PREDICTION_REQUIRED, 400);
  }

  const updatedNote = await Note.updateById(id, data);
  return updatedNote;
}

/**
 * Delete note
 * @param {string} id - Note ID
 * @returns {boolean} - Success status
 */
async function deleteNote(id) {
  const note = await Note.findById(id);
  if (!note) {
    throw new AppError("Note not found", 404);
  }

  return await Note.deleteById(id);
}

/**
 * Get attendance status options for frontend
 * @returns {Array} - Array of status options with labels
 */
function getAttendanceStatusOptions() {
  return Object.entries(ATTENDANCE_LABELS).map(([value, label]) => ({
    value,
    label
  }));
}

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getAttendanceStatusOptions,
  ATTENDANCE_STATUS,
  ATTENDANCE_LABELS
};
