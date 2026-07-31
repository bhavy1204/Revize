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
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    console.log("REACHED IN SEND OTP")
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-xl shadow-black/20">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-neutral-50">
              Create account
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              {step === 1 && "Enter your email to get started"}
              {step === 2 && "Check your inbox for a code"}
              {step === 3 && "Set up your profile"}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${
                  s <= step ? "bg-violet-500" : "bg-neutral-800"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STEP 1: EMAIL */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg bg-neutral-800/60 border border-neutral-700 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  onClick={handleSendOtp}
              
                  className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition"
                >
                  Send Code
                </button>
              </>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <>
                <p className="text-sm text-neutral-400">
                  Code sent to{" "}
                  <span className="font-medium text-neutral-200">{email}</span>
                </p>

                <div>
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="w-full rounded-lg bg-neutral-800/60 border border-neutral-700 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-medium py-2.5 transition"
                >
                  Verify code
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-neutral-400 hover:text-neutral-300 transition"
                >
                  Change email
                </button>
              </>
            )}

            {/* STEP 3: REGISTER */}
            {step === 3 && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full rounded-lg bg-neutral-800/60 border border-neutral-700 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full rounded-lg bg-neutral-800/60 border border-neutral-700 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full rounded-lg bg-neutral-800/60 border border-neutral-700 px-3 py-2.5 pr-10 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.73-2.06 2-3.89 3.63-5.31" />
                        <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.8 11.8 0 0 1-2.17 3.36" />
                        <path d="M1 1l22 22" />
                        <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-.53" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-medium py-2.5 transition"
                >
                  Create account
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
