const express = require("express");
const {
  createDriver,
  getDrivers,
  assignVehicle,
  getAssignedVehicle,
  getAssignmentRequests,
  unassignVehicle,
  respondToAssignment,
} = require("../controllers/driverController");
const {
  verifyToken,
  isAgent,
  isDriver,
} = require("../services/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, isAgent, createDriver);
router.get("/", verifyToken, getDrivers);
router.post("/assign", verifyToken, isAgent, assignVehicle);
router.post("/unassign", verifyToken, isAgent, unassignVehicle);
router.get("/assignedVehicle", verifyToken, isDriver, getAssignedVehicle);
router.get("/requests", verifyToken, isDriver, getAssignmentRequests);
router.post("/respond", verifyToken, isDriver, respondToAssignment);

module.exports = router;
