import api from './api';

// Decode JWT token to get user info
export const getUserFromToken = async (token) => {
  try {
    // Method 1: Decode JWT manually (base64)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Extract user info from JWT payload
    return {
      email: payload.email,
      userId: payload.userId,
      role: payload.role,
      name: payload.name || payload.email.split('@')[0],
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    
    // Method 2: Call backend API to get user info
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (apiError) {
      console.error('Error fetching user from API:', apiError);
      return null;
    }
  }
};