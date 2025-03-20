import React, { useState } from "react";

export const Tabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 0);

  return (
    <div>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          activeTab,
          setActiveTab,
          index,
        })
      )}
    </div>
  );
};

export const TabsList = ({ children }) => {
  return <div className="flex space-x-4 border-b border-gray-300">{children}</div>;
};

export const TabsTrigger = ({ children, setActiveTab, index, activeTab }) => {
  return (
    <button
      className={`py-2 px-4 ${
        activeTab === index ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"
      }`}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ children, index, activeTab }) => {
  return activeTab === index ? <div className="p-4">{children}</div> : null;
};
