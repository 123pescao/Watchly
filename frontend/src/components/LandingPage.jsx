import React, { useEffect } from "react";
import { Activity, Bell, Cpu, Shield, LineChart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo"; // Import the Logo component

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fadeIn", "opacity-100");
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "50px",
    });

    document.querySelectorAll(".fade-in").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    // ... (keep the existing features array)
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Navbar with Login Button */}
      <nav className="fixed top-0 left-0 w-full bg-gray-900 shadow-lg py-4 px-6 flex justify-between items-center z-50">
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <Logo dark variant="medium" /> {/* Use the medium variant */}
        </div>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-all duration-200"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-32">
        <div className="text-center fade-in opacity-0">
          <span className="inline-block px-4 py-2 bg-green-500/10 rounded-full text-green-500 font-medium mb-4">
            Intelligent System Monitoring
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Monitor Your Systems
            <br />
            <span className="text-green-500">With Precision</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Get real-time insights and instant alerts. Keep your systems running smoothly with our advanced monitoring solution.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 fade-in opacity-0">
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-4 animate-float border border-gray-700">
              <img
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
                alt="Dashboard Preview"
                className="rounded-lg w-full"
              />
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full animate-pulse">
                <Activity size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 fade-in opacity-0 text-white">
            Everything you need to stay in control
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="fade-in opacity-0 p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700/30 border border-gray-700 hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-green-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="fade-in opacity-0">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to take control?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join the future of system monitoring.
            </p>
            <button
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => navigate("/login?mode=signup")} // Redirect to login page with sign-up mode
              >
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;