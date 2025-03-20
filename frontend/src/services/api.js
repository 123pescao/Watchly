import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token Interceptor to attach token to API requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Attaching token to request", token);
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      if (error.response.status === 401) {
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        window.location.href = "/login/"; // Redirect to login
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Unknown Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// User Authentication
export const registerUser = (userData) => api.post("/auth/register", userData);
export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response;
};

// Websites
export const getWebsites = () => api.get("/websites");
export const addWebsite = (websiteData) => api.post("/websites/add", websiteData);
export const deleteWebsite = (websiteId) => api.delete(`/websites/delete/${websiteId}`);

// Metrics
export const getMetrics = (websiteId) => api.get(`/metrics?website_id=${websiteId}`);
export const addMetric = (metricData) => api.post("/metrics/add", metricData);

// Alerts
export const getAlerts = (websiteId) => api.get(`/alerts?website_id=${websiteId}`);
export const updateAlert = (alertId, status) => api.patch(`/alerts/${alertId}`, { status });

// Fetch Website Metrics (Uptime & Response Time)
export const fetchWebsiteMetrics = async (websiteId) => {
  try {
    const response = await api.get(`/metrics?website_id=${websiteId}&limit=10`);

    if (response.data.length > 0) {
      const validMetrics = response.data.filter(m => m.uptime !== null && !isNaN(m.uptime));  // ✅ Ensure valid metrics
      if (validMetrics.length === 0) return { uptime: 0, response_time: 0 };  // ✅ Prevent invalid calculations

      const totalUptime = validMetrics.reduce((sum, metric) => sum + metric.uptime, 0);
      const averageUptime = totalUptime / validMetrics.length;
      const averageResponseTime = validMetrics.reduce((sum, metric) => sum + metric.response_time, 0) / validMetrics.length;

      return {
        uptime: averageUptime, // ✅ Ensure valid uptime
        response_time: averageResponseTime || 0,
      };
    } else {
      return { uptime: 0, response_time: 0 };  // ✅ Default values if no data
    }
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return { uptime: 0, response_time: 0 };
  }
};

// Fetch all websites from the backend
export const fetchWebsites = async () => {
  try {
    const response = await api.get("/websites");

    const websitesWithMetrics = await Promise.all(response.data.map(async (site) => {
      const metrics = await fetchWebsiteMetrics(site.id);
      return {
        ...site,
        uptime: metrics.uptime ?? 0,  // Ensure uptime defaults to 0 if undefined
        response_time: metrics.response_time ?? 0,  // Ensure response_time has fallback
      };
    }));

    return websitesWithMetrics;
  } catch (error) {
    console.error("Failed to fetch websites:", error);
    return []; // Return an empty array if the request fails
  }
};

// Function to calculate uptime percentage
export const calculateUptimePercentage = (websites) => {
  if (!websites.length) return 0;

  const totalUptime = websites.reduce((sum, site) => sum + (site.uptime || 0), 0);
  return (totalUptime / websites.length) * 100;  // Convert to percentage properly
};

// Function to calculate average response time
export const calculateAverageResponseTime = (websites) => {
  if (websites.length === 0) return 0;

  const totalResponseTime = websites.reduce((sum, site) => sum + (site.response_time || 0), 0);
  return (totalResponseTime / websites.length).toFixed(2); // Keep two decimal places
};

export default api;

