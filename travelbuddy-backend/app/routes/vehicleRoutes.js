const express = require("express");
const {
  createVehicle,
  getVehicles,
} = require("../controllers/vehicleController");
const { verifyToken, isAgent } = require("../services/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, isAgent, createVehicle);
router.get("/", verifyToken, getVehicles);

module.exports = router;
