import React, { useState, useEffect } from "react";
import LoginPage from "./components/loginPage";
import DriverDashboard from "./components/driverDashboard";
import AgentDashboard from "./components/agentDashBoard"; // Corrected import

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userRole = localStorage.getItem("role");
      setUser({ token, role: userRole });
    }

    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <div className="App">
      {!user && <LoginPage setUser={setUser} />}
      {user && user.role === "driver" && (
        <DriverDashboard onLogout={handleLogout} />
      )}
      {user && user.role === "agent" && (
        <AgentDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
