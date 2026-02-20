// Guest Routes
const express = require("express");
const router = express.Router();
const guestController = require("../controllers/guest.controller");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const { USER_ROLES } = require("../constants/enums/user.enum");

// All routes require authentication and admin role
router.use(auth);
router.use(authorizeRoles(USER_ROLES.ADMIN));

// CRUD Operations
router.post("/", guestController.create);
router.post("/bulk", guestController.bulkCreate);
router.get("/", guestController.findAll);
router.get("/search/table", guestController.findByIdAndGetTable);
router.get("/unassigned", guestController.findUnassigned);
router.get("/assigned", guestController.findAssigned);
router.get("/invitations", guestController.findByInvitationStatus);
router.get("/arrived", guestController.findArrived);
router.get("/unarrived", guestController.findUnarrived);
router.get("/:id", guestController.findById);
router.put("/:id", guestController.update);
router.delete("/:id", guestController.delete);

// Invitation status
router.put("/:id/invitation/sent", guestController.markInvitationSent);

// Arrival/Check-in status
router.put("/:id/arrived", guestController.checkIn);

module.exports = router;
