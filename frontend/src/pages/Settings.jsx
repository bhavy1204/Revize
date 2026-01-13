import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ApiCLient from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const apiClient = new ApiCLient();

const Settings = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showAllPendingLocal, setShowAllPendingLocal] = useState(() => {
    try {
      return localStorage.getItem('showAllPending') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleShowAllPending = () => {
    try {
      const next = !showAllPendingLocal;
      localStorage.setItem('showAllPending', String(next));
      setShowAllPendingLocal(next);
      window.dispatchEvent(new Event('showAllPendingChange'));
    } catch (e) {
      console.error('Failed to toggle showAllPending', e);
    }
  };

  const UpcomingToggle = () => {
    const [val, setVal] = React.useState(() => {
      try {
        return localStorage.getItem('showAllUpcoming') === 'true';
      } catch (e) {
        return false;
      }
    });

    const toggle = () => {
      try {
        const next = !val;
        localStorage.setItem('showAllUpcoming', String(next));
        setVal(next);
        window.dispatchEvent(new Event('showAllUpcomingChange'));
      } catch (e) {
        console.error('Failed to toggle showAllUpcoming', e);
      }
    };

    return (
      <button
        onClick={toggle}
        className={`py-2 px-4 rounded font-medium ${val ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-500'} text-white`}
      >
        {val ? 'Enabled' : 'Disabled'}
      </button>
    );
  };
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    try {
      await apiClient.changePassword(oldPassword, newPassword);
      setMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await apiClient.deleteAccount();
        await logout(); // Logout after successful account deletion
        alert('Account deleted successfully.');
        navigate('/register'); // Redirect to register page after account deletion
      } catch (err) {
        setError(err.message || 'Failed to delete account');
      }
    }
  };

  const handleExportToPdf = async () => {
    setMessage('');
    setError('');
    try {
      console.log("Attempting to export PDF..."); // DEBUG
      const res = await apiClient.exportToPdf();
      console.log("Received response from API:", res); // DEBUG
      const blob = res; // apiClient.exportToPdf() should already return a blob
      console.log("Blob received:", blob); // DEBUG
      const url = window.URL.createObjectURL(blob);
      console.log("Object URL created:", url); // DEBUG
      const a = document.createElement('a');
      a.href = url;
      a.download = 'revisions.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); // Clean up the object URL
      setMessage('PDF exported successfully!');
    } catch (err) {
      console.error("PDF Export Error:", err); // DEBUG
      setError(err.message || 'Failed to export PDF');
    }
  };


  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">Settings</h2>

        {message && <p className="text-green-400 text-center mb-4">{message}</p>}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <div className="space-y-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md text-gray-100">
            <h3 className="text-2xl font-semibold mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label htmlFor="oldPassword" className="block text-gray-200 text-sm font-medium mb-2">Old Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-gray-200 text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-200 text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Change Password
              </button>
            </form>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md text-gray-100">
            <h3 className="text-2xl font-semibold mb-4">Account Actions</h3>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Delete Account
              </button>
              <button
                onClick={handleExportToPdf}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Export Revisions to PDF
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md text-gray-100">
            <h3 className="text-2xl font-semibold mb-4">Pending Revisions</h3>
            <p className="text-gray-300 mb-4">Control whether the dashboard shows all pending revisions by default.</p>
            <div className="flex items-center gap-4">
                <div className="text-gray-100">Show All Pending Revisions:</div>
                <button
                  onClick={toggleShowAllPending}
                  className={`py-2 px-4 rounded font-medium ${showAllPendingLocal ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-500'} text-white`}
                >
                  {showAllPendingLocal ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="text-gray-100">Show All Upcoming Revisions:</div>
                <UpcomingToggle />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;