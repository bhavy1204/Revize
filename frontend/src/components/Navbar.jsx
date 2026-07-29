import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner for the Navbar itself
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
  <nav className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 text-neutral-100 sticky top-0 z-30">
    <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="text-base font-semibold text-neutral-50">
        Revize
      </Link>

      {user ? (
        <span className="text-sm text-neutral-400">
          Hello, <span className="text-neutral-200 font-medium">{user.fullName}</span>
        </span>
      ) : (
        <Link
          to="/login"
          className="rounded-lg bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-medium py-2 px-4 transition"
        >
          Log in
        </Link>
      )}
    </div>
  </nav>
);
};

export default Navbar;