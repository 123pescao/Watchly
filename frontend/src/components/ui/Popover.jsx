import React, { useState } from "react";

export const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {children({ isOpen, setIsOpen })}
    </div>
  );
};

export const PopoverTrigger = ({ setIsOpen, children }) => (
  <button onClick={() => setIsOpen((prev) => !prev)} className="text-white">
    {children}
  </button>
);

export const PopoverContent = ({ isOpen, children }) => (
  isOpen ? (
    <div className="absolute top-full mt-2 p-4 bg-gray-800 rounded-lg shadow-lg">
      {children}
    </div>
  ) : null
);

export default Popover;
