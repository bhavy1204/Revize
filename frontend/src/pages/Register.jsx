import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ApiCLient from "../utils/api.js";
import { useAuth0Token } from "../utils/useAuth0Toke.js";

const Register = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const apiClient = new ApiCLient();

  useEffect(() => {
    /* global google */
    if (!window.google) return;

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleSuccess,
    });

    google.accounts.id.renderButton(
      document.getElementById("google-signup-btn"),
      {
        theme: "outline",
        size: "large",
        width: "100%",
      },
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step !== 3) return;

    setError("");
    try {
      await apiClient.register({ fullName, username, email, password });
      navigate("/login"); // Navigate to login on successful registration
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await apiClient.sendOtp(email);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await apiClient.verifyOtp({ email, otp });
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid OTP");
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      await ApiCLient.googleLogin(response);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google authentication failed");
    }
  };

  const getAuth0Token = useAuth0Token();

  const handleGithubLogin = async () => {
    const token = await getAuth0Token();
    if (!token) return;

    await apiClient.gitHubLogin(token);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-100">
          Register
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <>
              <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="shadow border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                onClick={handleSendOtp}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
              >
                Send OTP
              </button>
            </>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <>
              <p className="text-gray-300 mb-4 text-sm">
                OTP sent to <span className="font-semibold">{email}</span>
              </p>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="shadow border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded w-full"
              >
                Verify OTP
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-blue-400 mt-3"
              >
                Change Email
              </button>
            </>
          )}

          {/* STEP 3: REGISTER */}
          {step === 3 && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="shadow border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Username"
                  className="shadow border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <input
                  type="password"
                  placeholder="Password"
                  className="shadow border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
              >
                Register
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
