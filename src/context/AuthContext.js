import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveToken, saveUser, getToken, getUser, clearStorage } from '../utils/storage';
import { getUserFromToken } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      const userData = await getUser();
      
      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth response
  const handleGoogleAuth = async (token) => {
    try {
      if (!token) {
        return { success: false, message: 'No token received' };
      }

      // Save token
      await saveToken(token);

      // Get user info from token (decode JWT or call API)
      const userData = await getUserFromToken(token);
      
      if (userData) {
        await saveUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { success: false, message: 'Failed to get user data' };
    } catch (error) {
      console.error('Google auth error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Authentication failed' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await clearStorage();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    handleGoogleAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

