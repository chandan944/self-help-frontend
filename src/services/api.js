// import axios from 'axios';
// import { API_BASE_URL } from '../constants/config';
// import { getToken } from '../utils/storage';

// // Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor - Add token to all requests
// api.interceptors.request.use(
//   async (config) => {
//     const token = await getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     console.log('📤 API Request:', config.method.toUpperCase(), config.url);
//     return config;
//   },
//   (error) => {
//     console.error('❌ Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle errors globally
// api.interceptors.response.use(
//   (response) => {
//     console.log('✅ API Response:', response.config.url, response.status);
//     return response;
//   },
//   (error) => {
//     console.error('❌ API Error:', error.response?.status, error.response?.data);
    
//     // Handle specific error codes
//     if (error.response?.status === 401) {
//       // Token expired or invalid - redirect to login
//       console.log('🔒 Unauthorized - Token may be expired');
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;









import api from './api';

export const sendFirebaseTokenToBackend = async (googleIdToken, userInfo) => {
  console.log('📤 Sending to backend:', api.defaults.baseURL + '/auth/google');
  console.log('📦 User:', userInfo.email);

  try {
    // For Expo, send Google ID token directly (not Firebase token)
    const response = await api.post('/auth/google', {
      idToken: googleIdToken,
      email: userInfo.email,
      name: userInfo.name,
      imageUrl: userInfo.imageUrl,
    });

    console.log('✅ Backend response:', response.status);
    return response.data;
    
  } catch (error) {
    console.error('❌ Backend error:', error.response?.data);
    throw error;
  }
};