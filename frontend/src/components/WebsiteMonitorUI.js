import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import StatsGrid from "./StatsGrid";
import api from "../services/api";
import { getAlerts } from "../services/api";
import WebsitesTable from "./WebsitesTable";
import {
  fetchWebsiteMetrics,
  addWebsite as apiAddWebsite,
  deleteWebsite,
} from "../services/api";
import { Globe, Activity, Clock, AlertTriangle, Zap, RefreshCw } from "lucide-react";
import useWebsites from "../hooks/useWebsites";

export default function WebsiteMonitorUI() {
  const navigate = useNavigate();
  const { websites, setWebsites, loading: initialLoading, fetchWebsites } = useWebsites();
  const [uptimePercentage, setUptimePercentage] = useState("0.0");
  const [averageResponseTime, setAverageResponseTime] = useState("0.0");
  const [selectedFrequency, setSelectedFrequency] = useState(60);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [formError, setFormError] = useState("");
  const latestWebsites = useRef([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const intervalRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  // Create a ref to always hold the latest websites state
  const websitesRef = useRef(websites);
  useEffect(() => {
    websitesRef.current = websites;
  }, [websites]);

  // Alert helper: adds a new alert and removes it after 5 seconds.
  const triggerAlert = useCallback((message) => {
    setNotifications((prev) => {
      const newAlerts = [...prev, message];
      if (newAlerts.length > 5) newAlerts.shift();
      return newAlerts;
    });

    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 5000);
  }, [setNotifications]);

  const fetchActiveAlerts = useCallback(async () => {
    try {
      // If your backend returns all unresolved alerts for the current user:
      const response = await api.get("/alerts?status=unresolved");
      // response.data is presumably an array of unresolved alerts
      setActiveAlerts(response.data.length);
      console.log("Updated active alerts count:", response.data.length);
    } catch (error) {
      console.error("Failed to fetch unresolved alerts:", error);
    }
  }, []);

  useEffect(() => {
    fetchActiveAlerts();
    const intervalId = setInterval(fetchActiveAlerts, 10000); // poll every 10s
    return () => clearInterval(intervalId);
  }, [fetchActiveAlerts]);

  // fetchStatuses: fetches metrics for each website, formats uptime as percentage,
  // and returns the updated website data.
  const fetchStatuses = useCallback(async () => {
    const currentWebsites = websitesRef.current;
    if (currentWebsites.length === 0) return;
    setStatusLoading(true);
    setRefreshing(true);

    try {
      const updatedWebsites = await Promise.all(
        currentWebsites.map(async (site) => {
          if (!site.id) return { ...site, numericUptime: 0, numericResponseTime: 0, uptime: "0%", response_time: "N/A", isDown: true };

          try {
            const metricsData = await fetchWebsiteMetrics(site.id);
            const numericUptime = parseFloat(metricsData.uptime ?? 0);  // Ensure numeric value
            const numericResponseTime = parseFloat(metricsData.response_time ?? 0);

            const uptimeDisplay = `${(numericUptime * 100).toFixed(1)}%`;
            const responseTimeDisplay = numericResponseTime > 0 ? numericResponseTime.toFixed(2) : "N/A";
            const isDown = numericUptime < 0.5;

            return {
              ...site,
              numericUptime,
              numericResponseTime,
              uptime: uptimeDisplay,
              response_time: responseTimeDisplay,
              isDown
            };
          } catch (err) {
            console.error(`Failed to fetch metrics for ${site.url}:`, err);
            return { ...site, numericUptime: 0, numericResponseTime: 0, uptime: "0.0%", response_time: "N/A", isDown: true };
          }
        })
      );

      setWebsites(updatedWebsites);
      //Ensure `uptimePercentage` updates correctly
      const validWebsites = updatedWebsites.filter(site => !isNaN(site.numericUptime));
      const totalUptime = validWebsites.reduce((sum, site) => sum + site.numericUptime, 0);
      const avgUptime = validWebsites.length > 0
        ? ((totalUptime / validWebsites.length) * 100).toFixed(1)
        : "0.0";

      console.log("Before setting uptime percentage:", uptimePercentage); // Debug
      setUptimePercentage(avgUptime);
      console.log("After setting uptime percentage:", avgUptime);

      const validResponseTimes = updatedWebsites.filter(site => !isNaN(site.numericResponseTime) && site.numericResponseTime > 0);
      const totalResponseTime = validResponseTimes.reduce((sum, site) => sum + site.numericResponseTime, 0);
      const avgResponseTime = validResponseTimes.length > 0
        ? (totalResponseTime / validResponseTimes.length).toFixed(2)  //  Ensure 2 decimal places
        : "0.0";

      console.log("Before setting avg response time:", averageResponseTime); // Debug
      setAverageResponseTime(avgResponseTime);
      console.log("After setting avg response time:", avgResponseTime);  // Debug

    } catch (error) {
      console.error("Failed to update website statuses:", error);
    } finally {
      setStatusLoading(false);
      setRefreshing(false);
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  }, [triggerAlert, setWebsites]);

  useEffect(() => {
    console.log("Updated uptime percentage (State Change):", uptimePercentage);
  }, [uptimePercentage]);  // Ensures React detects changes

  // useEffect: run fetchStatuses immediately on mount and then every 10 seconds.
  useEffect(() => {
    fetchStatuses(); // Fetch once on mount

    intervalRef.current = setInterval(() => {
      console.log("Fetching latest status updates...");
      fetchStatuses();
    }, 10000);

    return () => {
      console.log("Clearing interval for status updates.");
      clearInterval(intervalRef.current);
    };
  }, [fetchStatuses]);

  const handleInputChange = (e) => {
    setUrl(e.target.value);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAddWebsite();
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleAddWebsite = async () => {
    if (!isValidUrl(url)) {
      setFormError("Invalid URL. Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    setLoading(true);
    try {
      await apiAddWebsite({ url, name: url, frequency: selectedFrequency });
      fetchWebsites();
      setUrl("");
      setFormError("");
    } catch (error) {
      console.error("Failed to add website:", error);
      setFormError("Failed to add website. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeWebsite = async (websiteId) => {
    try {
      await deleteWebsite(websiteId);
      fetchWebsites();
    } catch (error) {
      console.error("Failed to remove website:", error);
    }
  };
  
  {
 
  };
  
  const pauseWebsite = (id) => {
    console.log(`Pausing website with ID: ${id}`);
    // Implement pause logic
  };
  
  const resumeWebsite = (id) => {
    console.log(`Resuming website with ID: ${id}`);
    // Implement resume logic
  };
  
  const viewAnalytics = (id) => {
    console.log(`Viewing analytics for website with ID: ${id}`);
    // Implement analytics logic
  };
  
  // Pass these functions as props to WebsitesTable
  <WebsitesTable  
    removeWebsite={removeWebsite}
    pauseWebsite={pauseWebsite}
    resumeWebsite={resumeWebsite}
    viewAnalytics={viewAnalytics}
  />

  const stats = [
    {
      icon: Globe,
      title: "Websites Monitored",
      value: websites.length,
      color: "text-blue-500",
    },
    {
      icon: Activity,
      title: "Uptime",
      value: `${uptimePercentage}%`,
      color: uptimePercentage === "100.0" ? "text-green-500" : "text-yellow-500",
    },
    {
      icon: Clock,
      title: "Avg Response Time",
      value: `${averageResponseTime} ms`,
      color: "text-purple-500",
    },
    {
      icon: AlertTriangle,
      title: "Active Alerts",
      value: activeAlerts,
      color: "text-yellow-500",
    },
  ];

  const handleRefresh = () => {
    fetchStatuses();
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-white/5 p-8 rounded-xl backdrop-blur-lg border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Loading Website</h2>
            <p className="text-white/60">Please wait while we fetch your monitoring data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/5 via-transparent to-transparent"></div>
      
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notifications={notifications}
      />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4 animate-fade-in">
            Welcome To Watchly
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto mb-8">
            
          </p>
          <div className="flex justify-center items-center space-x-2">
            <div className={`relative ${statusLoading ? 'text-white/50' : 'text-white'} transition-colors duration-300`}>
              <span className="mr-2">Last updated just now</span>
              <button 
                onClick={handleRefresh} 
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                disabled={refreshing}
              >
                <RefreshCw size={16} className={`${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Grid with enhanced animation */}
        <div className="mb-10">
          <StatsGrid stats={stats} />
        </div>
        
        {/* Control Panel */}
        <div className="mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Zap className="text-yellow-400 mr-2" size={24} />
              Add Website to Monitor
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="websiteUrl" className="block text-white/70 mb-2 text-sm font-medium">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter website URL (e.g., https://example.com)"
                    value={url}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="w-full md:w-48">
  <label htmlFor="frequency" className="block text-white/70 mb-2 text-sm font-medium">
    Check Frequency
  </label>
  <select
    id="frequency"
    value={selectedFrequency}
    onChange={(e) => setSelectedFrequency(Number(e.target.value))}
    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
  >
    <option value={10}>10 seconds</option>
    <option value={30}>30 seconds</option>
    <option value={60}>1 minute</option>
    <option value={300}>5 minutes</option>
    <option value={600}>10 minutes</option>
    <option value={1800}>30 minutes</option>
    <option value={3600}>1 hour</option>
  </select>
</div>
                <div className="w-full md:w-auto self-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-green-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      "Add Website"
                    )}
                  </Button>
                </div>
              </div>
              {formError && (
                <div className="mt-3 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  <p className="flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    {formError}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
        
        {/* Websites Table */}
        <div className="mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden rounded-xl shadow-xl">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Monitored Websites</h2>
              <p className="text-white/60 text-sm mt-1">
                Real-time performance metrics for all your websites
              </p>
            </div>
            <WebsitesTable websites={websites} removeWebsite={removeWebsite} />
          </Card>
        </div>
        
        {/* Additional Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Feature 1: Advanced Monitoring */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="bg-blue-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
              <Activity className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Advanced Monitoring</h3>
            <p className="text-white/70">
              Monitor uptime, response time, SSL certificates, and more with our comprehensive monitoring system.
            </p>
          </div>
          
          {/* Feature 2: Real-time Alerts */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="bg-yellow-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-yellow-500/30 transition-colors">
              <AlertTriangle className="text-yellow-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-time Alerts</h3>
            <p className="text-white/70">
              Get instant notifications when your websites go down or experience performance issues.
            </p>
          </div>
          
          {/* Feature 3: Detailed Analytics */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="bg-purple-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
              <svg viewBox="0 0 24 24" className="text-purple-400 w-6 h-6" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M21 7L15.5657 12.4343C15.3677 12.6323 15.2687 12.7313 15.1545 12.7684C15.0541 12.8011 14.9459 12.8011 14.8455 12.7684C14.7313 12.7313 14.6323 12.6323 14.4343 12.4343L12.5657 10.5657C12.3677 10.3677 12.2687 10.2687 12.1545 10.2316C12.0541 10.1989 11.9459 10.1989 11.8455 10.2316C11.7313 10.2687 11.6323 10.3677 11.4343 10.5657L7 15M21 7H17M21 7V11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Detailed Analytics</h3>
            <p className="text-white/70">
              Access comprehensive performance analytics and historical data to optimize your websites.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-16 border-t border-white/10 pt-8 pb-16 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Watchly. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
