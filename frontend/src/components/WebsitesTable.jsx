import React, { useState } from "react";
import {
  TrashIcon,
  ExternalLinkIcon,
  AlertTriangleIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";

const WebsitesTable = ({ websites, removeWebsite }) => {
  const { showToast } = useToast();
  const [expandedRow, setExpandedRow] = useState(null);

  const handleRemove = (id, name) => {
    removeWebsite(id);
    showToast({
      title: "Website removed",
      description: `${name} has been removed from monitoring.`,
    });
  };

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className="overflow-hidden rounded-lg animate-fade-in">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Website
              </th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                Uptime
              </th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                Response Time
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {websites.length > 0 ? (
              websites.map((website, index) => (
                <React.Fragment key={website.id || index}>
                  <tr
                    className={`transition-colors duration-150 hover:bg-white/5 cursor-pointer ${
                      expandedRow === index ? "bg-white/5" : ""
                    }`}
                    onClick={() => toggleRow(index)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <div className={`w-3 h-3 rounded-full ${website.isDown ? "bg-red-500" : "bg-green-500"}`}>
                            <div className={`w-full h-full rounded-full ${website.isDown ? "" : "animate-ping-slow"} ${website.isDown ? "bg-red-500/50" : "bg-green-500/50"}`}></div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-white">{formatUrl(website.url)}</div>
                          <div className="text-xs text-white/50">{website.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        website.isDown
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}>
                        {website.isDown ? (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Offline
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Online
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`font-medium ${
                        parseFloat(website.uptime) < 90
                          ? "text-red-400"
                          : parseFloat(website.uptime) < 99
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}>
                        {website.uptime}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white/90">
                      {website.response_time === "N/A" ? (
                        <span className="text-white/50">N/A</span>
                      ) : (
                        <span className={`${
                          parseFloat(website.response_time) > 500
                            ? "text-red-400"
                            : parseFloat(website.response_time) > 200
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}>
                          {website.response_time} ms
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-1">
                      {/* External Link Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-white/50 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(website.url, "_blank");
                        }}
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-white/50 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(website.id, formatUrl(website.url));
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>

                  {/* Expanded row with additional details */}
                  {expandedRow === index && (
                    <tr className="bg-white/5 animate-fade-in">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 rounded-lg p-4">
                            <h4 className="text-xs uppercase text-white/60 font-medium mb-2">Monitoring Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Check Frequency:</span>
                                <span className="text-white text-sm">{website.frequency || 60} sec</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Added:</span>
                                <span className="text-white text-sm">{new Date().toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Last Check:</span>
                                <span className="text-white text-sm">{new Date().toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4">
                            <h4 className="text-xs uppercase text-white/60 font-medium mb-2">Performance</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Today's Uptime:</span>
                                <span className={`text-sm ${website.isDown ? "text-red-400" : "text-green-400"}`}>
                                  {website.uptime}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Avg. Response:</span>
                                <span className="text-white text-sm">{website.response_time}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Status:</span>
                                <span className={`text-sm ${website.isDown ? "text-red-400" : "text-green-400"}`}>
                                  {website.isDown ? "Down" : "Up"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4">
                            <h4 className="text-xs uppercase text-white/60 font-medium mb-2">Alerts</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Email Alerts:</span>
                                <span className="text-white text-sm">Enabled</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60 text-sm">SMS Alerts:</span>
                                <span className="text-white text-sm">Disabled</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Slack Alerts:</span>
                                <span className="text-white text-sm">Disabled</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-white/10 hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(website.id, formatUrl(website.url));
                            }}
                          >
                            <TrashIcon className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-white/50">
                  <div className="flex flex-col items-center">
                    <AlertTriangleIcon className="h-12 w-12 mb-3 text-white/20" />
                    <p className="text-lg font-medium mb-2">No websites monitored</p>
                    <p className="max-w-md mx-auto text-sm">
                      Add your first website to start monitoring its uptime and performance.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebsitesTable;