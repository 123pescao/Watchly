import React, { useState, useEffect } from "react";

const fetchLogs = async () => {
  // Replace with actual API call
  return [
    { timestamp: "2025-02-15 12:00:00", message: "Website monitor started" },
    { timestamp: "2025-02-15 12:10:00", message: "Website XYZ went down" },
  ];
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      const fetchedLogs = await fetchLogs();
      setLogs(fetchedLogs);
    };

    loadLogs();
  }, []);

  return (
    <div>
      <h2 className="text-2xl mb-4">System Logs</h2>
      <ul className="space-y-4">
        {logs.map((log, index) => (
          <li key={index} className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm">{log.timestamp}</p>
            <p>{log.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
