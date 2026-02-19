// Table Routes
const express = require("express");
const router = express.Router();
const tableController = require("../controllers/table.controller");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const { USER_ROLES } = require("../constants/enums/user.enum");

// All routes require authentication and admin role
router.use(auth);
router.use(authorizeRoles(USER_ROLES.ADMIN));

// CRUD Operations
router.post("/", tableController.create);
router.post("/bulk", tableController.bulkCreate);
router.post("/swap-guests", tableController.swapGuests);
router.get("/", tableController.findAll);
router.get("/stats", tableController.getStatistics);
router.get("/available", tableController.findAvailableTables);
router.get("/available-guests", tableController.getAvailableGuests);
router.get("/:id", tableController.findById);
router.get("/:id/guests", tableController.getGuests);
router.get("/:id/with-guests", tableController.getTableWithGuests);
router.put("/:id", tableController.update);
router.put("/:id/rename", tableController.rename);
router.put("/:id/remove-guests", tableController.removeGuests);
router.delete("/:id", tableController.delete);

module.exports = router;
