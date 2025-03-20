import React from "react";

export default function InteractiveFeatureCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      <div className="p-6 bg-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">Real-Time Monitoring</h3>
        <p>Get instant alerts when your website goes down.</p>
      </div>
      <div className="p-6 bg-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">Performance Insights</h3>
        <p>Track response times and uptime percentages.</p>
      </div>
      <div className="p-6 bg-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">Easy Setup</h3>
        <p>Add websites in seconds with a simple interface.</p>
      </div>
      <div className="p-6 bg-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">Detailed Reports</h3>
        <p>View historical data and performance trends.</p>
      </div>
    </div>
  );
}
