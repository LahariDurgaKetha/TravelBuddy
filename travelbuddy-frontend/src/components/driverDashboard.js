import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  ListGroup,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import "./driverDashboard.css";

const DriverDashboard = ({ onLogout }) => {
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [assignmentRequests, setAssignmentRequests] = useState([]);
  const [loadingAssignedVehicle, setLoadingAssignedVehicle] = useState(true);
  const [loadingAssignmentRequests, setLoadingAssignmentRequests] =
    useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    console.log(
      "Component mounted, fetching assigned vehicles and requests..."
    );
    fetchAssignedVehicle();
    fetchAssignmentRequests();
  }, []);

  const fetchAssignedVehicle = async () => {
    try {
      setLoadingAssignedVehicle(true);
      console.log("Fetching assigned vehicles...");
      const response = await axios.get(
        "http://localhost:3000/api/drivers/assignedVehicle",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Check if the response data is valid
      if (response.data && response.data.length > 0) {
        console.log("Assigned vehicles fetched successfully:", response.data);
        setAssignedVehicles(response.data);
      } else {
        console.log("No assigned vehicles found.");
        setAssignedVehicles([]);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("Assigned vehicles endpoint not found (404).");
      } else {
        console.error("Error fetching assigned vehicles:", error);
      }
      setError("Failed to load assigned vehicles.");
    } finally {
      setLoadingAssignedVehicle(false);
    }
  };

  const fetchAssignmentRequests = async () => {
    try {
      setLoadingAssignmentRequests(true);
      console.log("Fetching assignment requests...");
      const response = await axios.get(
        "http://localhost:3000/api/drivers/requests",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Assignment requests fetched successfully:", response.data);
      setAssignmentRequests(response.data);
    } catch (error) {
      console.error("Error fetching assignment requests:", error);
      setError("Failed to load assignment requests.");
    } finally {
      setLoadingAssignmentRequests(false);
    }
  };

  const respondToRequest = async (requestId, accept) => {
    try {
      console.log(
        `Responding to request ${requestId} with accept=${accept}...`
      );
      await axios.post(
        `http://localhost:3000/api/drivers/respond`,
        { requestId, accept },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Request responded successfully.");
      fetchAssignmentRequests();
      fetchAssignedVehicle();
      setMessage(
        `Assignment ${accept ? "accepted" : "rejected"} successfully!`
      );
    } catch (error) {
      console.error("Error responding to assignment request:", error);
      setError("Failed to respond to assignment request.");
    }
  };

  return (
    <Container className="driver-dashboard">
      <div className="logout-container">
        <Button variant="danger" className="logout-button" onClick={onLogout}>
          Logout
        </Button>
      </div>
      <Row>
        <Col>
          <h2 className="my-4">Driver Dashboard</h2>
        </Col>
      </Row>

      {message && (
        <Row>
          <Col>
            <Alert
              variant={message.includes("Failed") ? "danger" : "success"}
              onClose={() => setMessage(null)}
              dismissible
            >
              {message}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Assigned Vehicles</Card.Title>
              {loadingAssignedVehicle ? (
                <Spinner animation="border" variant="primary" />
              ) : error ? (
                <p>{error}</p>
              ) : assignedVehicles.length > 0 ? (
                <ListGroup>
                  {assignedVehicles.map((vehicle) => (
                    <ListGroup.Item key={vehicle.vehicleId}>
                      <p>
                        Vehicle: {vehicle.make} {vehicle.model}
                      </p>
                      <p>License Plate: {vehicle.licensePlate}</p>
                      <p>
                        Assignment Time:{" "}
                        {new Date(vehicle.startTime).toLocaleString()} -{" "}
                        {new Date(vehicle.endTime).toLocaleString()}
                      </p>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No vehicles assigned</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Assignment Requests</Card.Title>
              {loadingAssignmentRequests ? (
                <Spinner animation="border" variant="primary" />
              ) : error ? (
                <p>{error}</p>
              ) : assignmentRequests.length > 0 ? (
                <ListGroup>
                  {assignmentRequests.map((request) => (
                    <ListGroup.Item key={request._id}>
                      <p>
                        Vehicle: {request.vehicleDetails.make}{" "}
                        {request.vehicleDetails.model}
                      </p>
                      <p>
                        License Plate: {request.vehicleDetails.licensePlate}
                      </p>
                      <p>
                        Assignment Time:{" "}
                        {new Date(request.startTime).toLocaleString()} -{" "}
                        {new Date(request.endTime).toLocaleString()}
                      </p>
                      <div className="button-group">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => respondToRequest(request._id, true)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => respondToRequest(request._id, false)}
                        >
                          Reject
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No assignment requests available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DriverDashboard;
