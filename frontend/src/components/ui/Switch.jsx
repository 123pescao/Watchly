import React from "react";

const Switch = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer space-x-2">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors"></div>
        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
      </div>
      {label && <span className="text-white">{label}</span>}
    </label>
  );
};

export default Switch;
