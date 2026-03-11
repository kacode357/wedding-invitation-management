// Category Routes
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const { USER_ROLES } = require("../constants/enums/user.enum");

// All routes require authentication and admin role
router.use(auth);
router.use(authorizeRoles(USER_ROLES.ADMIN));

// CRUD Operations
router.post("/", categoryController.create);
router.get("/", categoryController.findAll);
router.get("/:id", categoryController.findById);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.delete);

module.exports = router;
