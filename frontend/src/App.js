import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// --- COMPONENT IMPORTS ---
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";
import WebsiteList from "./components/Websites/WebsiteList";
import AddWebsite from "./components/Websites/AddWebsite";
import MetricList from "./components/Metrics/MetricList";
import NotFound from "./components/Common/NotFound";
import Docs from "./pages/Docs";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On initial load, check localStorage for a token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    console.log("Checking token in localStorage:", savedToken);
    setUser(!!savedToken); // user = true if token is non-empty
    setIsLoading(false);
  }, []);

  // Called when a login is successful
  const handleLogin = () => {
    localStorage.setItem("token", "authenticated");
    setUser(true);
    navigate("/dashboard");
  };

  // While checking for a token, show a loading screen
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="App min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard and Monitoring Pages */}
        <Route
          path="/dashboard"
          element={user ? <WebsiteMonitorUI /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/websites"
          element={user ? <WebsiteList /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/websites/add"
          element={user ? <AddWebsite /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/metrics"
          element={user ? <MetricList /> : <Navigate to="/login" replace />}
       
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
