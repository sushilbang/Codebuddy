// components/Navbar.jsx
import React from "react";

const Navbar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "problem", label: "Problem" },
    { id: "solution", label: "Solution Submission" },
    { id: "analysis", label: "Analysis" }
  ];

  return (
    <div className="flex justify-around bg-gray-100 p-3 rounded-t-lg shadow-md">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`w-1/3 text-center py-2 font-medium transition duration-200 ${
            activeTab === tab.id 
              ? "bg-blue-600 text-white" 
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Navbar;