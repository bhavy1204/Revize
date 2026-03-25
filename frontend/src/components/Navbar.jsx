import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, isLoggedIn, loading } = useAuth();

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
        {user && <div className="text-gray-300">Hello, {user.fullName}!</div>}
      </div>
    </nav>
  );
};

export default Navbar;