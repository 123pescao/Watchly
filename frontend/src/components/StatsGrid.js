import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types"; // For prop validation

// Helper function to determine color based on value
const getColor = (title, value) => {
  switch (title) {
    case "Uptime":
      return parseFloat(value) > 99 ? "bg-green-500" : parseFloat(value) > 90 ? "bg-yellow-500" : "bg-red-500";
    case "Avg Response Time":
      return parseFloat(value) < 100 ? "bg-green-500" : parseFloat(value) < 300 ? "bg-yellow-500" : "bg-red-500";
    case "Active Alerts":
      return value === 0 ? "bg-green-500" : value < 3 ? "bg-yellow-500" : "bg-red-500";
    default:
      return "bg-white/10";
  }
};

// Helper function to calculate width for visual indicators
const calculateWidth = (title, value) => {
  switch (title) {
    case "Uptime":
      return `${parseFloat(value)}%`;
    case "Avg Response Time":
      return `${Math.min(parseFloat(value) / 10, 100)}%`;
    case "Active Alerts":
      return `${Math.min(value * 10, 100)}%`;
    default:
      return "100%";
  }
};

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group"
        >
          <div className="relative h-full glass rounded-xl overflow-hidden transition-all duration-300 group-hover:translate-y-[-4px] group-hover:shadow-lg shadow-card">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">{stat.title}</p>
                  <h3 className="mt-1 text-stat font-bold tracking-tight">
                    <span className={`${stat.color}`}>{stat.value}</span>
                  </h3>
                </div>
                <div className={`rounded-full p-2 ${stat.color} bg-white/5`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              
              {/* Enhanced visual indicator based on value */}
              {(stat.title === "Uptime" || stat.title === "Avg Response Time" || stat.title === "Active Alerts") && (
                <div className="mt-4 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getColor(stat.title, stat.value)} rounded-full transition-all duration-700 ease-in-out`}
                    style={{ width: calculateWidth(stat.title, stat.value) }}
                    aria-label={`${stat.title} indicator`}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Prop validation
StatsGrid.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      color: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    })
  ).isRequired,
};

export default StatsGrid;
