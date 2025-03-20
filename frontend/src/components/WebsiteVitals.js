import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const WebsiteVitals = ({ website }) => {
  const [vitalData, setVitalData] = useState([]);
  const [timestamps, setTimestamps] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLoadTime = Math.floor(Math.random() * 500) + 100; // Simulating load times
      const timestamp = new Date().toLocaleTimeString();

      setVitalData((prev) => [...prev.slice(-20), newLoadTime]); // Keep last 20 data points
      setTimestamps((prev) => [...prev.slice(-20), timestamp]);
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: "Load Time (ms)",
        data: vitalData,
        borderColor: "#e11d48", // Red color for heart pulse effect
        backgroundColor: "rgba(225, 29, 72, 0.2)",
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.4, // Smooth line curve
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 500,
      easing: "easeInOutQuad",
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false, // Hide X-axis for cleaner look
      },
      y: {
        beginAtZero: true,
        suggestedMax: 600, // Adjust max based on expected load times
      },
    },
  };

  return (
    <div className="w-full h-32 bg-gray-900 rounded-lg p-4">
      <h2 className="text-white text-sm mb-2">{website} - Website Vitals</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default WebsiteVitals;
