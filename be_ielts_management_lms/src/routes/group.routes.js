// Group Routes
const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const { USER_ROLES } = require("../constants/enums/user.enum");

// All routes require authentication and admin role
router.use(auth);
router.use(authorizeRoles(USER_ROLES.ADMIN));

// CRUD Operations
router.post("/", groupController.create);
router.get("/", groupController.findAll);
router.get("/:id", groupController.findById);
router.put("/:id", groupController.update);
router.delete("/:id", groupController.delete);

module.exports = router;
