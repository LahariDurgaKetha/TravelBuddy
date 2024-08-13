import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Image,
  Alert,
} from "react-bootstrap";
import vehicleManagementImage from "../assets/login_bg.png"; // Replace with the actual path to your image
import "./loginPage.css"; // Import the external CSS file

const LoginPage = ({ setUser }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("driver"); // Default role is 'driver'
  const [alertMessage, setAlertMessage] = useState(null); // State to manage alert message
  const [alertType, setAlertType] = useState("danger"); // State to manage alert type (e.g., 'success', 'danger')

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { username, password, role }
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      setUser({ username, role, token });
      setAlertMessage(null);
    } catch (error) {
      console.error("Login failed:", error);
      setAlertMessage(
        "Login failed. Please check your credentials and try again."
      );
      setAlertType("danger");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/auth/register", {
        username,
        password,
        role,
      });
      alert("Registration successful! You can now log in.");
      setIsRegistering(false);
      setAlertMessage(null);
    } catch (error) {
      console.error("Registration failed:", error);
      setAlertMessage("Registration failed. Please try again.");
      setAlertType("danger");
    }
  };

  return (
    <Container className="login-container">
      <Row>
        <Col md={6} className="d-none d-md-block">
          <Image src={vehicleManagementImage} alt="Vehicle Management" fluid />
        </Col>
        <Col md={6}>
          <div className="login-card">
            <h2 className="login-title">
              {isRegistering ? "Register" : "Login"}
            </h2>

            {alertMessage && (
              <Alert
                variant={alertType}
                onClose={() => setAlertMessage(null)}
                dismissible
              >
                {alertMessage}
              </Alert>
            )}

            <Form onSubmit={isRegistering ? handleRegister : handleLogin}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formRole">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  as="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="driver">Driver</option>
                  <option value="agent">Agent</option>
                </Form.Control>
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                {isRegistering ? "Register" : "Login"}
              </Button>
            </Form>
            <div className="register-link">
              <Button
                variant="link"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? "Back to Login" : "Register"}
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
