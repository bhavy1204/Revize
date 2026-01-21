import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ApiCLient from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const apiClient = new ApiCLient();

const Settings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [openCard, setOpenCard] = useState(null);

  const toggleCard = (card) => {
    setOpenCard(openCard === card ? null : card);
  };

  const [showAllPendingLocal, setShowAllPendingLocal] = useState(() => {
    try {
      return localStorage.getItem("showAllPending") === "true";
    } catch {
      return false;
    }
  });

  const toggleShowAllPending = () => {
    try {
      const next = !showAllPendingLocal;
      localStorage.setItem("showAllPending", String(next));
      setShowAllPendingLocal(next);
      window.dispatchEvent(new Event("showAllPendingChange"));
    } catch (e) {
      console.error("Failed to toggle showAllPending", e);
    }
  };

  const UpcomingToggle = () => {
    const [val, setVal] = React.useState(() => {
      try {
        return localStorage.getItem("showAllUpcoming") === "true";
      } catch {
        return false;
      }
    });

    const toggle = () => {
      try {
        const next = !val;
        localStorage.setItem("showAllUpcoming", String(next));
        setVal(next);
        window.dispatchEvent(new Event("showAllUpcomingChange"));
      } catch (e) {
        console.error("Failed to toggle showAllUpcoming", e);
      }
    };

    return (
      <button
        onClick={toggle}
        className={`py-2 px-4 rounded font-medium ${
          val
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-600 hover:bg-gray-500"
        } text-white`}
      >
        {val ? "Enabled" : "Disabled"}
      </button>
    );
  };

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      await apiClient.changePassword(oldPassword, newPassword);
      setMessage("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      try {
        await apiClient.deleteAccount();
        alert("Account deleted successfully.");
        navigate("/register");
      } catch (err) {
        setError(err.message || "Failed to delete account");
      }
    }
  };

  const handleExportToPdf = async () => {
    setMessage("");
    setError("");
    try {
      const blob = await apiClient.exportToPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "revisions.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage("PDF exported successfully!");
    } catch (err) {
      setError(err.message || "Failed to export PDF");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">
          Settings
        </h2>

        {message && (
          <p className="text-green-400 text-center mb-4">{message}</p>
        )}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <div className="space-y-4">
          {/* Change Password */}
          <div className="bg-gray-800 rounded-lg shadow-md text-gray-100">
            <button
              onClick={() => toggleCard("password")}
              className="w-full text-left p-6 text-2xl font-semibold"
            >
              Change Password
            </button>

            {openCard === "password" && (
              <div className="px-6 pb-6">
                <form onSubmit={handleChangePassword}>
                  <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-medium mb-2">
                      Old Password
                    </label>
                    <input
                      type="password"
                      className="w-full py-2 px-3 bg-gray-700 rounded text-gray-100"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full py-2 px-3 bg-gray-700 rounded text-gray-100"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-200 text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full py-2 px-3 bg-gray-700 rounded text-gray-100"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Change Password
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Pending Revisions */}
          <div className="bg-gray-800 rounded-lg shadow-md text-gray-100">
            <button
              onClick={() => toggleCard("pending")}
              className="w-full text-left p-6 text-2xl font-semibold"
            >
              Pending Revisions
            </button>

            {openCard === "pending" && (
              <div className="px-6 pb-6 space-y-4">
                <p className="text-gray-300">
                  Control whether the dashboard shows all pending revisions by
                  default.
                </p>

                <div className="flex items-center gap-4">
                  <div>Show All Pending Revisions:</div>
                  <button
                    onClick={toggleShowAllPending}
                    className={`py-2 px-4 rounded font-medium ${
                      showAllPendingLocal
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-600 hover:bg-gray-500"
                    } text-white`}
                  >
                    {showAllPendingLocal ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div>Show All Upcoming Revisions:</div>
                  <UpcomingToggle />
                </div>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="bg-gray-800 rounded-lg shadow-md text-gray-100">
            <button
              onClick={() => toggleCard("account")}
              className="w-full text-left p-6 text-2xl font-semibold"
            >
              Account Actions
            </button>

            {openCard === "account" && (
              <div className="px-6 pb-6 flex flex-wrap gap-4">
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete Account
                </button>

                <button
                  onClick={handleExportToPdf}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                >
                  Export Revisions to PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
