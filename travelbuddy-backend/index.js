const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./app/routes/authRoutes");
const driverRoutes = require("./app/routes/driverRoutes");
const vehicleRoutes = require("./app/routes/vehicleRoutes");

const app = express();

// Enable CORS for all routes
app.use(cors());

// Body parser middleware to parse JSON requests
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://TravelBuddy:fmtt142bB0hZ9e5T@travelbuddy.rauqxko.mongodb.net/travel",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
