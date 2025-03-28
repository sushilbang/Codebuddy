import React from "react";

const LoadingSpinner = ({ size = "normal", color = "orange" }) => {
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    normal: "w-6 h-6 border-2",
    large: "w-8 h-8 border-3"
  };
  
  const colorClasses = {
    white: "border-white border-t-transparent",
    black: "border-black border-t-transparent",
    orange: "border-orange-500 border-t-transparent",
    gray: "border-gray-300 border-t-transparent"
  };
  
  return (
    <div className="flex justify-center items-center">
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default LoadingSpinner;