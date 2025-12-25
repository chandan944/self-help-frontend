import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveToken, saveUser, getToken, getUser, clearStorage } from '../utils/storage';
import { sendFirebaseTokenToBackend } from '../services/authService';

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
    console.log('🔍 Checking authentication status...');
    try {
      const token = await getToken();
      const userData = await getUser();
      
      if (token && userData) {
        console.log('✅ User already authenticated:', userData.email);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('ℹ️ No existing authentication found');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Firebase authentication
  const handleFirebaseAuth = async (firebaseIdToken, userInfo) => {
    console.log('🔐 Processing Firebase authentication...');
    console.log('👤 User info:', userInfo.email);

    try {
      // Send Firebase ID token to your backend
      console.log('📤 Sending Firebase token to backend...');
      const response = await sendFirebaseTokenToBackend(firebaseIdToken, userInfo);
      
      console.log('📥 Backend response received');

      if (response && response.token) {
        console.log('✅ Backend JWT received');
        
        // Save backend JWT token
        await saveToken(response.token);
        console.log('💾 Token saved to storage');

        // Save user data
        const userData = {
          email: userInfo.email,
          name: userInfo.name,
          imageUrl: userInfo.imageUrl,
          role: response.role || 'USER',
        };
        
        await saveUser(userData);
        console.log('💾 User data saved to storage');

        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('🎉 Authentication complete!');
        return { success: true };
      }
      
      console.error('❌ No token in backend response');
      return { success: false, message: 'No token received from backend' };

    } catch (error) {
      console.error('❌ Firebase auth error:', error);
      console.error('Error details:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Authentication failed' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    console.log('👋 Logging out...');
    try {
      await clearStorage();
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    handleFirebaseAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};