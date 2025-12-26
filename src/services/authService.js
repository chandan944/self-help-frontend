import api from './api';

export const sendFirebaseTokenToBackend = async (firebaseIdToken, userInfo) => {
 console.log('📤 Backend URL:', api.defaults.baseURL);
  console.log('📤 Full endpoint:', api.defaults.baseURL + '/auth/firebase');
  try {
    const response = await api.post('/auth/firebase', {
      firebaseIdToken,
      email: userInfo.email,
      name: userInfo.name,
      imageUrl: userInfo.imageUrl,
    });

    console.log('✅ Backend response status:', response.status);
    console.log('📥 Backend response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Backend request failed');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    throw error;
  }
};