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
    <div>
      <h1>Profile Page</h1>
      {userData ? (
        <div>
          <p>Name: {userData.name}</p>
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Profile;
