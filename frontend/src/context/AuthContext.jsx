import React, { createContext, useState, useEffect, useContext } from 'react';
import ApiCLient from '../utils/api.js';

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
      const userData = await ApiClient.login(email, password);
      setUser(userData.user); // Assuming response has a .user property
      setIsLoggedIn(true);
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
      // After successful registration, you might want to automatically log them in
      // or just redirect to login page. For now, we'll just return the response.
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, register, setUser, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};