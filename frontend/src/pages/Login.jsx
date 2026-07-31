import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAuth0Token } from "../utils/useAuth0Toke.js";
import ApiCLient from "../utils/api.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const apiClient = new ApiCLient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      login(email, password);

      navigate("/"); // Navigate to dashboard on successful login
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const getAuth0Token = useAuth0Token();
  const handleGithubLogin = async () => {
    const token = await getAuth0Token();
    if (!token) return;

    await apiClient.gitHubLogin(token);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-xl shadow-black/20">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-neutral-50">
              Welcome back
            </h2>
            <p className="text-sm text-neutral-400 mt-1">Sign in to continue</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-neutral-400 mb-1.5"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className="w-full rounded-lg bg-neutral-800/60 border border-neutral-700 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-neutral-400 mb-1.5"
              >
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye Off
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
                    // Eye
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
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-medium py-2.5 transition mt-2"
            >
              Sign in
            </button>

            {/* <button onClick={handleGithubLogin} className="w-full mt-3 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-sm font-medium py-2.5 transition text-neutral-200 flex items-center justify-center gap-2">
            Continue with GitHub
          </button> */}
          </form>

          <p className="mt-6 text-center text-sm text-neutral-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
