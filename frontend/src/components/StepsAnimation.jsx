import React from "react";

export default function StepsAnimation() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      <div className="p-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">1. Sign Up</h3>
        <p>Create an account in seconds.</p>
      </div>
      <div className="p-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">2. Add Websites</h3>
        <p>Enter the URLs you want to monitor.</p>
      </div>
      <div className="p-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">3. Monitor</h3>
        <p>Get real-time updates and alerts.</p>
      </div>
      <div className="p-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">4. Analyze</h3>
        <p>View detailed reports and performance insights.</p>
      </div>
    </div>
  );
}
