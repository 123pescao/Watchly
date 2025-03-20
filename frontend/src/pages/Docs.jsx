import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Terminal, Settings, AlertTriangle } from "lucide-react";

const Docs = () => {
  return (
    <div className="container mx-auto px-6 py-12 text-white">
      <h1 className="text-4xl font-bold text-center mb-6">📖 Learn Watchly</h1>
      <p className="text-center text-gray-400 max-w-2xl mx-auto">
        Welcome to Watchly's documentation! Here, you’ll find everything you need to monitor websites, set up alerts, and optimize uptime.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {/* Getting Started */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <BookOpen size={40} className="mx-auto text-blue-400" />
          <h2 className="text-xl font-bold mt-4">Getting Started</h2>
          <p className="text-gray-400 mt-2">
            Learn how to set up Watchly and start monitoring websites.
          </p>
          <Link to="/docs/getting-started" className="inline-block mt-4 text-blue-400 hover:underline">
            Read More →
          </Link>
        </div>

        {/* API Documentation */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <Terminal size={40} className="mx-auto text-green-400" />
          <h2 className="text-xl font-bold mt-4">API Documentation</h2>
          <p className="text-gray-400 mt-2">
            Integrate Watchly with other platforms using our REST API.
          </p>
          <Link to="/docs/api" className="inline-block mt-4 text-green-400 hover:underline">
            Read More →
          </Link>
        </div>

        {/* Settings & Configuration */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <Settings size={40} className="mx-auto text-yellow-400" />
          <h2 className="text-xl font-bold mt-4">Configuration</h2>
          <p className="text-gray-400 mt-2">
            Customize your monitoring settings and alerts.
          </p>
          <Link to="/docs/configuration" className="inline-block mt-4 text-yellow-400 hover:underline">
            Read More →
          </Link>
        </div>

        {/* Troubleshooting */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <AlertTriangle size={40} className="mx-auto text-red-400" />
          <h2 className="text-xl font-bold mt-4">Troubleshooting</h2>
          <p className="text-gray-400 mt-2">
            Find solutions to common issues and FAQs.
          </p>
          <Link to="/docs/troubleshooting" className="inline-block mt-4 text-red-400 hover:underline">
            Read More →
          </Link>
        </div>
      </div>

      {/* Full Documentation Sections */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">📌 Full Documentation</h2>

        {/* Getting Started */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-2xl font-semibold text-blue-400">Getting Started</h3>
          <p className="text-gray-300 mt-2">
            Watchly is a real-time website monitoring and alerting tool designed to keep your services up and running efficiently.
          </p>
          <ul className="list-disc ml-5 mt-2 text-gray-400">
            <li>Create a Watchly account.</li>
            <li>Add websites you want to monitor.</li>
            <li>Customize alerts and notifications.</li>
            <li>Track performance and uptime with analytics.</li>
          </ul>
        </div>

        {/* API Documentation */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-2xl font-semibold text-green-400">API Documentation</h3>
          <p className="text-gray-300 mt-2">
            Watchly offers a robust REST API that allows developers to integrate monitoring into their own applications.
          </p>
          <ul className="list-disc ml-5 mt-2 text-gray-400">
            <li><strong>Base URL:</strong> <code>https://api.watchly.com</code></li>
            <li>Endpoints for managing websites, alerts, and notifications.</li>
            <li>Authentication via API keys for secure access.</li>
            <li>Webhooks for automated alerts and system integration.</li>
          </ul>
        </div>

        {/* Settings & Configuration */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-2xl font-semibold text-yellow-400">Settings & Configuration</h3>
          <p className="text-gray-300 mt-2">
            Customize how Watchly works to fit your needs.
          </p>
          <ul className="list-disc ml-5 mt-2 text-gray-400">
            <li>Set monitoring intervals (e.g., every 30 seconds).</li>
            <li>Choose alert channels: Email, SMS, Webhooks, Slack, etc.</li>
            <li>Define performance thresholds for response time alerts.</li>
            <li>Enable SSL certificate monitoring for security.</li>
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-red-400">Troubleshooting</h3>
          <p className="text-gray-300 mt-2">
            Find solutions to common issues with Watchly.
          </p>
          <ul className="list-disc ml-5 mt-2 text-gray-400">
            <li><strong>Website Not Monitoring:</strong> Check if your site is online and reachable.</li>
            <li><strong>Alerts Not Sending:</strong> Ensure email/SMS settings are correctly configured.</li>
            <li><strong>Slow Response Times:</strong> Optimize website speed and server performance.</li>
            <li><strong>API Issues:</strong> Make sure you're using the correct API key and endpoint.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Docs;
