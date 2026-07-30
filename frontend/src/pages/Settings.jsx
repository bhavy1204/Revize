import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ApiCLient from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import EnableNotifications from "../components/EnableNotification.jsx";

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
        className={`text-sm font-medium py-1.5 px-3 rounded-lg transition ${
          val
            ? "bg-violet-600 hover:bg-violet-500 text-white"
            : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
        }`}
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

  const handleLogout = async () => {
    setMessage("");
    setError("");
    try {
      if (!window.confirm("Are you sure you want to logout from Revize?")) {
        return;
      }
      await logout();
      navigate("/login");
    } catch (err) {
      setError(err.message || "Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <div className="container mx-auto p-4 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-8 text-center text-neutral-50">
          Settings
        </h2>

        {message && (
          <div className="mb-5 rounded-lg border border-emerald-900/50 bg-emerald-950/50 px-3 py-2">
            <p className="text-sm text-emerald-400 text-center">{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {/* Change Password */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCard("password")}
              className="w-full flex items-center justify-between text-left p-5 text-base font-medium text-neutral-100"
            >
              Change password
              <svg
                className={`w-4 h-4 text-neutral-500 transition-transform ${
                  openCard === "password" ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openCard === "password" && (
              <div className="px-5 pb-5 border-t border-neutral-800 pt-5">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                      Old password
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-lg bg-neutral-800/60 border border-neutral-700 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                      New password
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-lg bg-neutral-800/60 border border-neutral-700 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-lg bg-neutral-800/60 border border-neutral-700 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button className="rounded-lg bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-medium py-2.5 px-4 transition">
                    Change password
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Pending Revisions */}
          {/* <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCard("pending")}
              className="w-full flex items-center justify-between text-left p-5 text-base font-medium text-neutral-100"
            >
              Pending revisions
              <svg
                className={`w-4 h-4 text-neutral-500 transition-transform ${
                  openCard === "pending" ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openCard === "pending" && (
              <div className="px-5 pb-5 border-t border-neutral-800 pt-5 space-y-4">
                <p className="text-sm text-neutral-400">
                  Control whether the dashboard shows all pending revisions by
                  default.
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-200">
                    Show all pending revisions
                  </span>
                  <button
                    onClick={toggleShowAllPending}
                    className={`text-sm font-medium py-1.5 px-3 rounded-lg transition ${
                      showAllPendingLocal
                        ? "bg-violet-600 hover:bg-violet-500 text-white"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    }`}
                  >
                    {showAllPendingLocal ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-200">
                    Show all upcoming revisions
                  </span>
                  <UpcomingToggle />
                </div>
              </div>
            )}
          </div> */}

          {/* Notifications */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCard("notifications")}
              className="w-full flex items-center justify-between text-left p-5 text-base font-medium text-neutral-100"
            >
              Notifications
              <svg
                className={`w-4 h-4 text-neutral-500 transition-transform ${
                  openCard === "notifications" ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openCard === "notifications" && (
              <div className="px-5 pb-5 border-t border-neutral-800 pt-5 space-y-4">
                <p className="text-sm text-neutral-400">
                  Get daily reminders to stay consistent.
                </p>
                <EnableNotifications />
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCard("account")}
              className="w-full flex items-center justify-between text-left p-5 text-base font-medium text-neutral-100"
            >
              Account actions
              <svg
                className={`w-4 h-4 text-neutral-500 transition-transform ${
                  openCard === "account" ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openCard === "account" && (
              <div className="px-5 pb-5 border-t border-neutral-800 pt-5 flex flex-wrap gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2.5 px-4 transition"
                >
                  Delete account
                </button>

                <button
                  onClick={handleExportToPdf}
                  className="rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-sm font-medium py-2.5 px-4 transition"
                >
                  Export revisions to PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="mt-8 flex justify-center pb-8">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2.5 px-6 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
