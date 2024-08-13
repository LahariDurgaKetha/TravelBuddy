const Vehicle = require("../models/vehicle");

exports.createVehicle = async (req, res) => {
  try {
    const { make, model, licensePlate } = req.body;
    const vehicle = new Vehicle({ make, model, licensePlate });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Error creating vehicle", error });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicles", error });
  }
};
