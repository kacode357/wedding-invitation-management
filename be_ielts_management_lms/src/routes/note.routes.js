// Note Routes - Express Router
const express = require("express");
const router = express.Router();
const noteController = require("../controllers/note.controller");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

// Apply auth middleware to all routes
router.use(auth);
router.use(authorizeRoles("admin", "teacher"));

// Create a new note
router.post("/", noteController.createNote);

// Get all notes with pagination
router.get("/", noteController.getAllNotes);

// Get attendance status options (for frontend dropdown)
router.get("/options/attendance-status", noteController.getAttendanceStatusOptions);

// Get note by noteId (e.g., NOTE-001)
router.get("/noteId/:noteId", noteController.getNoteByNoteId);

// Get note by ID
router.get("/:id", noteController.getNoteById);

// Update note
router.put("/:id", noteController.updateNote);

// Delete note
router.delete("/:id", noteController.deleteNote);

module.exports = router;
