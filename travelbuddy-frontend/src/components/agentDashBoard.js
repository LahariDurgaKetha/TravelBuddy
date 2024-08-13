import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ListGroup,
  Card,
  Alert,
} from "react-bootstrap";
import "./agentDashboard.css"; // Import your custom styles

const AgentDashboard = ({ onLogout }) => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [workStartTime, setWorkStartTime] = useState("");
  const [workEndTime, setWorkEndTime] = useState("");
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [assignmentStartTime, setAssignmentStartTime] = useState("");
  const [assignmentEndTime, setAssignmentEndTime] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/drivers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setMessage({ text: "Failed to fetch drivers.", type: "danger" });
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/vehicles", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setMessage({ text: "Failed to fetch vehicles.", type: "danger" });
    }
  };

  const createDriver = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3000/api/drivers",
        {
          name,
          email,
          phone,
          location,
          workHours: `${workStartTime}-${workEndTime}`, // Store as "HH:MM-HH:MM"
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage({ text: "Driver created successfully!", type: "success" });
      setName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setWorkStartTime("");
      setWorkEndTime("");
      fetchDrivers();
    } catch (error) {
      console.error("Error creating driver:", error);
      setMessage({
        text: "Failed to create driver. Please try again.",
        type: "danger",
      });
    }
  };

  const assignVehicle = async () => {
    if (selectedDrivers.length > 0 && selectedVehicle) {
      try {
        console.log("Selected drivers:", selectedDrivers);
        await axios.post(
          "http://localhost:3000/api/drivers/assign",
          {
            driverIds: selectedDrivers.map((driver) => driver.value), // Convert to array of driver IDs
            vehicleId: selectedVehicle,
            startTime: new Date(assignmentStartTime),
            endTime: new Date(assignmentEndTime),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessage({ text: "Vehicle assigned successfully!", type: "success" });
        fetchDrivers();
      } catch (error) {
        console.error("Error assigning vehicle:", error); // Log the full error
        if (error.response) {
          console.log("Error response:", error.response); // Log the error response
          if (error.response.data && error.response.data.message) {
            // Display the specific message from the backend
            setMessage({ text: error.response.data.message, type: "danger" });
          } else {
            setMessage({
              text: "Failed to assign vehicle. Please try again.",
              type: "danger",
            });
          }
        } else {
          setMessage({
            text: "An unexpected error occurred.",
            type: "danger",
          });
        }
      }
    } else {
      setMessage({
        text: "Please select at least one driver and a vehicle.",
        type: "warning",
      });
    }
  };
  const unassignVehicle = async (driverId, assignmentId) => {
    try {
      console.log(
        "Unassigning vehicle for driver:",
        driverId,
        "with assignment:",
        assignmentId
      );
      await axios.post(
        "http://localhost:3000/api/drivers/unassign",
        { driverId, assignmentId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage({ text: "Vehicle unassigned successfully!", type: "success" });
      fetchDrivers();
    } catch (error) {
      console.error("Error unassigning vehicle:", error);
      setMessage({
        text: "Failed to unassign vehicle. Please try again.",
        type: "danger",
      });
    }
  };

  return (
    <Container className="agent-dashboard">
      <div className="logout-container">
        <button className="btn btn-danger logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
      <Row>
        <Col>
          <h2 className="my-4">Agent Dashboard</h2>
        </Col>
      </Row>

      {message && (
        <Row>
          <Col>
            <Alert
              variant={message.type}
              onClose={() => setMessage(null)}
              dismissible
            >
              {message.text}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Create a Driver</Card.Title>
              <Form onSubmit={createDriver}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Work Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Work End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Create Driver
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Assign a Vehicle to a Driver</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label>Select Drivers</Form.Label>
                <Select
                  options={drivers.map((driver) => ({
                    value: driver._id,
                    label: driver.name,
                  }))}
                  isMulti
                  onChange={setSelectedDrivers}
                  placeholder="Select Drivers"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Select Vehicle</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a Vehicle
                  </option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Assignment Start Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={assignmentStartTime}
                  onChange={(e) => setAssignmentStartTime(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Assignment End Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={assignmentEndTime}
                  onChange={(e) => setAssignmentEndTime(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="success" onClick={assignVehicle}>
                Assign Vehicle
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <h3>Drivers</h3>
          <ListGroup>
            {drivers.map((driver) => (
              <ListGroup.Item key={driver._id}>
                <h5>
                  {driver.name} - {driver.phone}
                </h5>
                <p>Assigned Vehicle:</p>
                {driver.assignments && driver.assignments.length > 0 ? (
                  <ul>
                    {driver.assignments.map((assignment, index) => (
                      <li key={index}>
                        {assignment.vehicle.make} {assignment.vehicle.model} -{" "}
                        {assignment.vehicle.licensePlate}{" "}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            unassignVehicle(driver._id, assignment._id)
                          }
                        >
                          Unassign Vehicle
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "None"
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default AgentDashboard;
