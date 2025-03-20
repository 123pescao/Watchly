import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Register necessary chart elements
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const WebsiteStatusChart = ({ url }) => {
  const [chartData, setChartData] = useState(null);

  // Fetch the status data for the selected website when the URL changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/status/${url}`);
        const data = await response.json();

        // Assuming your API returns an array of statuses and timestamps
        const statusLabels = data.timestamps; // Timestamps or dates
        const statusValues = data.statuses; // Statuses or numerical values representing status (e.g., 1 for online, 0 for offline)

        // Prepare chart data
        setChartData({
          labels: statusLabels, // Timestamps as X-axis labels
          datasets: [
            {
              label: 'Website Status',
              data: statusValues, // Status data (e.g., online/offline or response time)
              borderColor: 'rgb(75, 192, 192)', // Line color
              fill: false, // Don't fill under the line
              tension: 0.1, // Line tension for smooth curves
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (url) {
      fetchData(); // Fetch data when the URL changes
    }
  }, [url]); // Re-fetch data when URL changes

  if (!chartData) return <div>Loading chart...</div>;

  return (
    <div className="my-6">
      <h2 className="text-2xl mb-4">Website Status for {url}</h2>
      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default WebsiteStatusChart;
