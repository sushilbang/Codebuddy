import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const LandingNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) setScrolled(isScrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-100/90 shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div>
        <Link to="/" className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            CodeBuddy
        </Link>
      </div>
      
      <div className="flex items-center space-x-6">
        {user ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:cursor-pointer hover:bg-blue-700 transition-colors ml-4"
          >
            Logout
          </button>
        ) : (
          <div className="flex items-center space-x-3 ml-4">
            <Link to="/login" className="px-5 py-2 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNavbar;