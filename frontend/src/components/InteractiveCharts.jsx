import React from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Monday", uptime: 99, responseTime: 200 },
  { name: "Tuesday", uptime: 98, responseTime: 250 },
  { name: "Wednesday", uptime: 97, responseTime: 300 },
  { name: "Thursday", uptime: 95, responseTime: 400 },
  { name: "Friday", uptime: 96, responseTime: 350 },
  { name: "Saturday", uptime: 99, responseTime: 220 },
  { name: "Sunday", uptime: 100, responseTime: 180 },
];

const statusData = [
  { name: "Online", value: 80 },
  { name: "Slow", value: 15 },
  { name: "Offline", value: 5 },
];

const COLORS = ["#4CAF50", "#FFC107", "#F44336"];

const InteractiveCharts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Uptime Trend Line Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-center mb-2">Uptime Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis domain={[90, 100]} stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="uptime" stroke="#4CAF50" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Response Time Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-center mb-2">Response Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Bar dataKey="responseTime" fill="#2196F3" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Website Status Pie Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg col-span-1 md:col-span-2">
        <h2 className="text-xl font-bold text-center mb-2">Website Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InteractiveCharts;
