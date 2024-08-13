const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  licensePlate: { type: String, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  assignmentStart: { type: Date },
  assignmentEnd: { type: Date },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
