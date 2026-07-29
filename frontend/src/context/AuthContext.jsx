import React, { createContext, useState, useEffect, useContext } from "react";
import ApiCLient from "../utils/api.js";

const AuthContext = createContext(null);

const apiClient = new ApiCLient();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiClient.authMe();
        setUser(userData.user);
        setIsLoggedIn(true);
        if (typeof chrome !== "undefined" && chrome?.storage?.local) {
          await chrome.storage.local.set({
            revizeLoggedIn: true,
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userData = await apiClient.login(email, password);
      setUser(userData.data.user); // Assuming response has a .user property
      setIsLoggedIn(true);

     if (typeof chrome !== "undefined" && chrome?.storage?.local) {
       await chrome.storage.local.set({
         revizeLoggedIn: true,
         token: userData.data.token,
       });
     }

      setLoading(false);
      return userData;
    } catch (error) {
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      setIsLoggedIn(false);
      await chrome.storage.local.remove(["revizeLoggedIn", "token"]);
      setLoading(false);
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await apiClient.register(userData);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        login,
        logout,
        register,
        setUser,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
