import React, { useState, useRef, useEffect } from "react";
import { Eye, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import api from "../services/api";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const containerRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setMessage("Monitor your websites in real-time with instant alerts and performance tracking.");
      i++;
      if (i > 5) clearInterval(interval); // Limit interval for a smoother animation
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const switchMode = () => {
    if (containerRef.current) {
      containerRef.current.classList.add("animate-fadeIn");
      setIsSignUp(!isSignUp);
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.classList.remove("animate-fadeIn");
        }
      }, 600);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let response;
      if (isSignUp) {
        // Send request to register API
        response = await api.post("/auth/register", { name, email, password });

        if (response.status === 201) {
          console.log("Signup successful! Logging in...");
          const loginResponse = await api.post("/auth/login", { email, password });
          localStorage.setItem("token", loginResponse.data.access_token);
          console.log("Token stored after signup:", loginResponse.data.access_token);
          navigate("/dashboard"); // Redirect to dashboard
          return;
        }
      } else {
        // Send request to login API
        response = await api.post("/auth/login", { email, password });
      }

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        console.log("Token stored:", response.data.access_token);
        navigate("/dashboard");
      } else {
        setError(isSignUp ? "Signup failed." : "Invalid email or password");
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      setError(isSignUp ? "Signup failed. Try again." : "Login failed. Check your credentials.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-monitor-dark to-monitor-dark/90 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-monitor-DEFAULT/5 via-transparent to-transparent"></div>
      <div
        ref={containerRef}
        className="w-full max-w-4xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden relative border border-white/10"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Panel - Login/Register Form */}
          <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-green-500 to-green-600">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <Monitor className="w-16 h-16 text-white animate-pulse" />
                  <Eye className="w-8 h-8 text-white absolute bottom-0 right-0 animate-float" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Watchly</h1>
              <p className="text-sm text-white/80 mt-2">System Monitoring & Alerts</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm text-center border border-red-500/20">
                  {error}
                </div>
              )}

              {/* Name input (only shown for signup mode) */}
              {isSignUp && (
                <div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-200"
                    required={isSignUp}  // Require only when signing up
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-200"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-200"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full p-3 rounded-lg font-medium transition-all duration-200 ${
                  isLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-white text-green-600 hover:bg-white/90"
                }`}
              >
                {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
              </button>

              <button
                type="button"
                onClick={switchMode}
                className="w-full p-3 rounded-lg font-medium text-white hover:underline transition-all duration-200"
              >
                {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
              </button>
            </form>
          </div>

          {/* Right Panel - Info Panel */}
          <div className="w-full md:w-1/2 bg-monitor-DEFAULT p-8 text-white flex flex-col justify-center items-center relative overflow-hidden">
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-4 animate-fadeIn">
                Start your journey with us
              </h2>
              <p className="mb-8 animate-fadeIn">
                Keep your systems under control.
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-monitor-DEFAULT/20 to-monitor-dark/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}