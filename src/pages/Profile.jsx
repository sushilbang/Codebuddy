import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { user } = useAuth(); // Get user from AuthContext
  const [userData, setUserData] = useState(null); // State for user details
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data = await response.json();
        setUserData(data); // Store user data in state
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData(); // Call the async function
  }, [token]); // Runs when the token changes

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl p-6 w-96 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Profile Page</h1>
        {userData ? (
          <div>
            <p className="text-lg font-medium text-gray-600 text-left">Name: Username<span className="font-semibold">{userData.name}</span></p>
            <p className="text-lg font-medium text-gray-600 text-left">Email: <span className="font-semibold">{userData.email}</span></p>
          </div>
        ) : (
          <p className="text-gray-500">Loading user data...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;