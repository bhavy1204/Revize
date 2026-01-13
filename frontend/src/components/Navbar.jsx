import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return null; // Or a loading spinner for the Navbar itself
  }

  // Only render Navbar if logged in. ProtectedRoute should handle redirection if not.
  if (!isLoggedIn) {
    return null;
  }

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold">
          <Link to="/">Revize</Link>
        </div>
        <ul className="flex space-x-4 items-center">
          {user && <li className="text-gray-300">Hello, {user.fullName}!</li>}
          <li>
            <Link to="/" className="hover:text-gray-300">Dashboard</Link>
          </li>
          <li>
            <Link to="/settings" className="hover:text-gray-300">Settings</Link>
          </li>
          <li>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;