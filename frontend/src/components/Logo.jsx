// components/Logo.jsx
import React from "react";
import { Monitor, Eye } from "lucide-react";

const Logo = ({ dark = false, variant = "default" }) => {
  const monitorSize = variant === "medium" ? "w-10 h-10" : "w-16 h-16";
  const eyeSize = variant === "medium" ? "w-5 h-5" : "w-8 h-8";

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Monitor
          className={`${monitorSize} ${dark ? "text-green-500" : "text-white"} animate-pulse`}
        />
        <Eye
          className={`${eyeSize} ${dark ? "text-green-500" : "text-white"} absolute bottom-0 right-0 animate-float`}
        />
      </div>
      <h1 className={`${variant === "medium" ? "text-2xl" : "text-3xl"} font-bold ${
        dark ? "text-green-500" : "text-white"
      }`}>
        Watchly
      </h1>
      {variant === "default" && (
        <p className={`text-sm ${dark ? "text-green-500/80" : "text-white/80"} mt-2`}>
          System Monitoring & Alerts
        </p>
      )}
    </div>
  );
};

export default Logo;