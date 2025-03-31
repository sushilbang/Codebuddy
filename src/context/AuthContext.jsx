import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const login = async (email, password, navigate) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      await fetchUserDetails(navigate);
      toast.success("Logged in successfully! 🎉");
    } catch (error) {
      toast.error("Login failed! ❌ " + error.response?.data?.message);
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true); // Prevent fetchUserDetails from running
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });

      setUser(null);  // Clear user state
      toast.info("Logged out successfully! 👋");
    } catch (error) {
      toast.error("Logout failed ❌ " + error.response?.data?.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fetchUserDetails = async () => {
    if (isLoggingOut) return; // Don't fetch if logging out!

    try {
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);

      // Only show an error toast if it's NOT a 401 Unauthorized error
      if (error.response && error.response.status !== 401) {
        toast.error("Failed to fetch user details ❌ " + error.response?.data?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);


  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
