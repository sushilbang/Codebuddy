import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ activeTab, setSearchParams, problemid }) => {
  const navigate = useNavigate();
  
  const tabs = [
    { id: "problem", label: "Problem" },
    { id: "solution", label: "Solution Submission" },
    { id: "analysis", label: "Analysis" }
  ];

  const handleTabClick = (tab) => {
    setSearchParams({ tab }); // Updates URL without reloading the page
    navigate(`/problem/${problemid}?tab=${tab}`);
  };

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
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Navbar;
