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
        <h2 className="text-3xl font-bold mb-6 text-center">Settings</h2>

        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-semibold mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label htmlFor="oldPassword" className="block text-gray-700 text-sm font-bold mb-2">Old Password</label>
              <input
                type="password"
                id="oldPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
              <input
                type="password"
                id="newPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Change Password
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-semibold mb-4">Account Actions</h3>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          >
            Delete Account
          </button>
          <button
            onClick={handleExportToPdf}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
          >
            Export Revisions to PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;