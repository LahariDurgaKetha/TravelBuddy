const mongoose = require("mongoose");

const assignmentRequestSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

const assignmentSchema = new mongoose.Schema({
  vehicle: {
    vehicleId: mongoose.Schema.Types.ObjectId,
    make: String,
    model: String,
    licensePlate: String,
  },
  assignmentStart: Date,
  assignmentEnd: Date,
});

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  location: { type: String },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  workHours: { type: String },
  assignmentRequests: [[assignmentRequestSchema]],
  status: {
    type: String,
    enum: ["Available", "Assigned"],
    default: "Available",
  },
  assignments: [assignmentSchema],
});

module.exports = mongoose.model("Driver", driverSchema);
