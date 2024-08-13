# TravelBuddy

TravelBuddy is a vehicle management system that allows agents to assign vehicles to drivers, and drivers to manage their assignments through a user-friendly interface.

## Project Structure

The project is divided into two main parts:
- **Backend**: A Node.js and Express server that handles API requests, database interactions, and authentication.
- **Frontend**: A React-based user interface that allows users to interact with the system.

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or above)
- [npm](https://www.npmjs.com/) (v6 or above)
- [MongoDB](https://www.mongodb.com/)

## Backend Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-repo/travelbuddy.git
   cd travelbuddy/backend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the backend directory with the following content:**

   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://TravelBuddy:fmtt142bB0hZ9e5T@travelbuddy.rauqxko.mongodb.net/
   JWT_SECRET_KEY=xxx
   EMAIL_USERNAME=xxx
   EMAIL_PASSWORD="xxx"
   ```

4. **Run the Backend Server:**

   ```bash
   npm start
   ```

   The backend server will start at `http://localhost:3000`.

## Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd ../frontend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the frontend directory with the following content:**

   ```env
   PORT=3001
   ```

4. **Run the Frontend Server:**

   ```bash
   npm start
   ```

   The frontend server will start at `http://localhost:3001`.

## Usage

### Agent Dashboard

- **Create a Driver:** Fill out the form with driver details and click "Create Driver".
- **Assign a Vehicle to a Driver:** Select one or more drivers and a vehicle, set the assignment times, and click "Assign Vehicle".
- **Unassign a Vehicle:** View assigned vehicles for each driver and click "Unassign Vehicle" to remove the assignment.

### Driver Dashboard

- **View Assigned Vehicles:** Drivers can view their currently assigned vehicles.
- **Respond to Assignment Requests:** Drivers can accept or reject assignment requests from agents.

## Scripts

- `npm start`: Starts the development server.
- `npm run build`: Builds the project for production.
- `npm test`: Runs the test suite.

## Demo Link

For Demo, please visit [Video]().


## Contact

For any inquiries, please reach out to [laharidurgaketha@gmail.com](mailto:laharidurgaketha@gmail.com).
