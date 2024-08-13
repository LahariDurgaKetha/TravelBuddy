const Driver = require("../models/driver");
const Vehicle = require("../models/vehicle");
const User = require("../models/user"); // Import the User model
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const moment = require("moment");
const mongoose = require("mongoose");

exports.createDriver = async (req, res) => {
  try {
    console.log("Received request to create driver:", req.body);

    const { name, email, phone, location, workHours } = req.body;

    // Generate a random password
    const password = crypto.randomBytes(8).toString("hex");
    console.log("Generated password:", password);

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    // Create the driver
    const driver = new Driver({ name, email, phone, location, workHours });
    await driver.save();
    console.log("Driver saved:", driver);

    // Create a corresponding user with the driver role
    const user = new User({
      username: email,
      password: hashedPassword,
      role: "driver",
    });
    await user.save();
    console.log("User saved:", user);

    // Send an email to the driver with their login credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Welcome to the Portal - Your Login Credentials",
      text: `Dear ${name},\n\nYou have been added to our portal as a driver. Here are your login credentials:\n\nUsername: ${email}\nPassword: ${password}\n\nPlease log in and change your password immediately.\n\nBest regards,\nYour Company Name`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json(driver);
  } catch (error) {
    console.error("Error creating driver:", error);
    res.status(500).json({ message: "Error creating driver", error });
  }
};

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate("vehicle");
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching drivers", error });
  }
};

exports.assignVehicle = async (req, res) => {
  try {
    console.log("req.body:", req.body); // Log the request body to ensure it's correct

    let { driverIds, vehicleId, startTime, endTime } = req.body;
    console.log("driverIds:", driverIds); // Log the driverIds to verify its contents

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (!Array.isArray(driverIds)) {
      driverIds = [driverIds];
    }

    // Convert startTime and endTime to Date objects
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    // Generate a unique ID for the assignment request
    const assignmentRequestId = new mongoose.Types.ObjectId();
    console.log(assignmentRequestId);

    for (const driverId of driverIds) {
      if (!mongoose.Types.ObjectId.isValid(driverId)) {
        return res
          .status(400)
          .json({ message: `Invalid driver ID: ${driverId}` });
      }

      const objectId = new mongoose.Types.ObjectId(driverId);
      const driver = await Driver.findById(objectId);
      console.log("Found driver:", driver); // Log the driver object

      if (!driver) {
        return res
          .status(404)
          .json({ message: `Driver with ID ${driverId} not found` });
      }

      // Check if the new assignment overlaps with existing assignments or assignment requests
      const isOverlap = driver.assignments.some((assignment) => {
        const assignmentStart = new Date(assignment.assignmentStart);
        const assignmentEnd = new Date(assignment.assignmentEnd);
        return (
          (startTime >= assignmentStart && startTime < assignmentEnd) ||
          (endTime > assignmentStart && endTime <= assignmentEnd) ||
          (startTime <= assignmentStart && endTime >= assignmentEnd)
        );
      });

      const isRequestOverlap = driver.assignmentRequests.some((request) => {
        const requestStart = new Date(request.startTime);
        const requestEnd = new Date(request.endTime);
        return (
          (startTime >= requestStart && startTime < requestEnd) ||
          (endTime > requestStart && endTime <= requestEnd) ||
          (startTime <= requestStart && endTime >= requestEnd)
        );
      });

      if (isOverlap || isRequestOverlap) {
        return res.status(400).json({
          message: `Assignment time overlaps with existing assignment or request for driver ${driver.name}`,
        });
      }

      // Check if the assignment time is within work hours
      const [workStart, workEnd] = driver.workHours.split("-");
      const workStartTime = new Date(startTime);
      workStartTime.setHours(...workStart.split(":"), 0, 0);

      const workEndTime = new Date(endTime);
      workEndTime.setHours(...workEnd.split(":"), 0, 0);

      if (startTime < workStartTime || endTime > workEndTime) {
        return res.status(400).json({
          message: `Assignment time is outside of ${driver.name}'s work hours`,
        });
      }

      // Add the assignment request to the driver's assignmentRequests array
      driver.assignmentRequests.push({
        _id: assignmentRequestId,
        vehicle: vehicle._id, // Ensure this is an ObjectId
        startTime,
        endTime,
      });

      await driver.save();
    }

    res.status(200).json({ message: "Assignment requests sent to drivers" });
  } catch (error) {
    console.error("Error sending assignment requests:", error);
    res
      .status(500)
      .json({ message: "Error sending assignment requests", error });
  }
};

exports.getAssignedVehicle = async (req, res) => {
  try {
    // Step 1: Find the user's email from the Users collection
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userEmail = user.username; // Assuming 'username' is the email field in your Users model
    console.log("User email found:", userEmail);

    // Step 2: Use the email to find the corresponding driver in the Drivers collection
    const driver = await Driver.findOne({ email: userEmail });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    console.log("Assignments for driver:", driver.assignments);

    // Step 3: Return all assignments with their vehicle details
    const assignedVehicles = driver.assignments.map((assignment) => ({
      vehicleId: assignment.vehicle.vehicleId, // Ensure vehicleId is stored correctly
      make: assignment.vehicle.make,
      model: assignment.vehicle.model,
      licensePlate: assignment.vehicle.licensePlate,
      startTime: assignment.assignmentStart,
      endTime: assignment.assignmentEnd,
    }));

    // Check if there are any assigned vehicles
    if (assignedVehicles.length === 0) {
      return res.status(200).json([]); // Return an empty array instead of a 404 error
    }

    console.log("Assigned vehicles:", assignedVehicles);
    res.status(200).json(assignedVehicles);
  } catch (error) {
    console.error("Error fetching assigned vehicles:", error);
    res
      .status(500)
      .json({ message: "Error fetching assigned vehicles", error });
  }
};

exports.getAssignmentRequests = async (req, res) => {
  try {
    // Step 1: Find the user's email from the Users collection
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userEmail = user.username;
    console.log("User email found:", userEmail);

    // Step 2: Use the email to find the corresponding driver in the Drivers collection
    const driver = await Driver.findOne({ email: userEmail });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Step 3: Loop through assignmentRequests and populate vehicle details
    const assignmentRequestsWithVehicleDetails = await Promise.all(
      driver.assignmentRequests.flat().map(async (request) => {
        const vehicle = await Vehicle.findById(request.vehicle);
        if (vehicle) {
          return {
            ...request._doc, // Spread the request properties
            vehicleDetails: {
              make: vehicle.make,
              model: vehicle.model,
              licensePlate: vehicle.licensePlate,
            },
          };
        }
        return request; // Return request as is if vehicle not found
      })
    );

    console.log(
      "Assignment requests with vehicle details:",
      assignmentRequestsWithVehicleDetails
    );
    res.status(200).json(assignmentRequestsWithVehicleDetails);
  } catch (error) {
    console.error("Error fetching assignment requests:", error);
    res
      .status(500)
      .json({ message: "Error fetching assignment requests", error });
  }
};

exports.respondToAssignment = async (req, res) => {
  try {
    const { requestId, accept } = req.body;

    // Step 1: Find the user by userId from the JWT token
    const user = await User.findById(req.userId);
    if (!user) {
      console.log("User not found with ID:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    const userEmail = user.username; // Assuming 'username' is the email
    console.log("User email found:", userEmail);

    // Step 2: Find the corresponding driver by email in the Drivers collection
    const driver = await Driver.findOne({ email: userEmail });
    if (!driver) {
      console.log("Driver not found with email:", userEmail);
      return res.status(404).json({ message: "Driver not found" });
    }

    console.log("Driver found:", driver.name);

    let assignmentRequest;
    let requestIndex = -1;

    // Step 3: Loop through assignmentRequests to find the matching request
    driver.assignmentRequests.forEach((request, index) => {
      if (Array.isArray(request)) {
        request.forEach((subRequest) => {
          if (subRequest._id && subRequest._id.equals(requestId)) {
            assignmentRequest = subRequest;
            requestIndex = index;
          }
        });
      } else if (request._id && request._id.equals(requestId)) {
        assignmentRequest = request;
        requestIndex = index;
      }
    });

    if (!assignmentRequest) {
      console.log("Assignment request not found with ID:", requestId);
      return res.status(404).json({ message: "Assignment request not found" });
    }

    console.log("Assignment request found:", assignmentRequest);

    // Step 4: Find the vehicle details in the Vehicle collection
    const vehicle = await Vehicle.findById(assignmentRequest.vehicle);
    if (!vehicle) {
      console.log("Vehicle not found with ID:", assignmentRequest.vehicle);
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Add the vehicle details to the assignmentRequest
    assignmentRequest.vehicleDetails = {
      vehicleId: vehicle._id,
      make: vehicle.make,
      model: vehicle.model,
      licensePlate: vehicle.licensePlate,
    };

    console.log("Vehicle details populated:", assignmentRequest.vehicleDetails);

    if (accept) {
      console.log("Driver accepted the assignment.");

      // Check for overlapping assignments
      const overlappingAssignment = driver.assignments.some(
        (assignment) =>
          new Date(assignmentRequest.startTime) <
            new Date(assignment.assignmentEnd) &&
          new Date(assignmentRequest.endTime) >
            new Date(assignment.assignmentStart)
      );

      if (overlappingAssignment) {
        console.log("Overlapping assignment found, cannot accept the request.");
        return res
          .status(400)
          .json({ message: "Cannot accept overlapping assignments." });
      }

      // Add the assignment to the driver's assignments array
      driver.assignments.push({
        vehicle: {
          vehicleId: assignmentRequest.vehicleDetails.vehicleId,
          make: assignmentRequest.vehicleDetails.make,
          model: assignmentRequest.vehicleDetails.model,
          licensePlate: assignmentRequest.vehicleDetails.licensePlate,
        },
        assignmentStart: assignmentRequest.startTime,
        assignmentEnd: assignmentRequest.endTime,
      });
      driver.status = "Assigned";

      // Convert requestId to a Mongoose ObjectId using new
      const objectIdRequestId = new mongoose.Types.ObjectId(requestId);

      console.log("Removing assignment request from other drivers...");

      // Fetch all drivers except the current driver
      const allOtherDrivers = await Driver.find({ _id: { $ne: driver._id } });

      for (const otherDriver of allOtherDrivers) {
        // Filter out the assignment request with the matching _id
        otherDriver.assignmentRequests = otherDriver.assignmentRequests.filter(
          (request) =>
            request && request._id && !request._id.equals(objectIdRequestId)
        );

        // Save the changes for the driver
        await otherDriver.save();
      }
      // Remove the accepted assignment request from the assignmentRequests array
      driver.assignmentRequests.splice(requestIndex, 1);

      // Update the vehicle's assignment details
      vehicle.driver = driver._id;
      vehicle.assignmentStart = assignmentRequest.startTime;
      vehicle.assignmentEnd = assignmentRequest.endTime;
      await vehicle.save();
      console.log("Vehicle assignment updated:", vehicle);
    } else {
      console.log("Driver rejected the assignment.");

      // If the driver rejected, simply remove the request from their assignmentRequests
      driver.assignmentRequests.splice(requestIndex, 1);
    }

    await driver.save();

    res
      .status(200)
      .json({ message: `Assignment ${accept ? "accepted" : "rejected"}` });
  } catch (error) {
    console.error("Error responding to assignment request:", error);
    res
      .status(500)
      .json({ message: "Error responding to assignment request", error });
  }
};
exports.unassignVehicle = async (req, res) => {
  try {
    const { driverId, assignmentId } = req.body;

    // Log the received driverId and assignmentId
    console.log("Received driverId:", driverId);
    console.log("Received assignmentId:", assignmentId);

    // Find the driver by ID and populate the vehicle details in the assignments array
    const driver = await Driver.findById(driverId);

    // Check if the driver exists and has the specific assignment
    if (!driver || !driver.assignments || driver.assignments.length === 0) {
      return res
        .status(404)
        .json({ message: "Driver or assignment not found" });
    }

    // Find the assignment to be unassigned
    const assignmentIndex = driver.assignments.findIndex(
      (assignment) => assignment._id.toString() === assignmentId
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const vehicleId = driver.assignments[assignmentIndex].vehicle.vehicleId;

    // Remove the assignment from the driver
    const removedAssignment = driver.assignments.splice(assignmentIndex, 1);
    console.log("Removed assignment:", removedAssignment);

    if (driver.assignments.length === 0) {
      driver.status = "Available"; // Update driver status to Available if no other assignments exist
    }

    await driver.save(); // Save the driver's updated details

    // Update the vehicle's assignment details
    const vehicle = await Vehicle.findById(vehicleId);
    if (vehicle) {
      vehicle.driver = null; // Unassign the driver from the vehicle
      vehicle.assignmentStart = null;
      vehicle.assignmentEnd = null;

      await vehicle.save(); // Save the vehicle's updated details
      console.log("Vehicle unassigned:", vehicle);
    }

    // Send a success response
    res.status(200).json({ message: "Vehicle unassigned successfully" });
  } catch (error) {
    console.error("Error unassigning vehicle:", error);
    res.status(500).json({ message: "Error unassigning vehicle", error });
  }
};
