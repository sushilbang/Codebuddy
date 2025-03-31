import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Problem from "@/pages/Problem";
import ProblemList from "@/pages/ProblemList";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./context/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LandingNavbar from "@/components/LandingNavbar";
import "@/styles/styles.css";
import Profile from "./pages/Profile";
import Submissions from "./pages/Submissions";

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {!user && <LandingNavbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={user ? <ProblemList/> : <LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile/>
            </ProtectedRoute>
          }/>
          <Route 
            path="/problem-list" 
            element={
              <ProtectedRoute>
                <ProblemList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/problem/:problemid" 
            element={
              <ProtectedRoute>
                <Problem />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/submissions" 
            element={
              <ProtectedRoute>
                <Submissions />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
