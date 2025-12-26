import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const { handleFirebaseAuth } = useAuth();

  // Configure Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
   webClientId:
      '1036194311354-ce30pitar0hosmp0dl4pmis2qptbv26u.apps.googleusercontent.com',
    useProxy: true,androidClientId: 'PASTE_YOUR_ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com',
    // iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Add if iOS
  });

  // Debug configuration on mount
  useEffect(() => {
    console.log('🔧 Google Auth Configuration:');
    console.log('   expoClientId:', 'PASTE_YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com'.substring(0, 30) + '...');
    console.log('   androidClientId:', 'PASTE_YOUR_ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com'.substring(0, 30) + '...');
    console.log('   Request ready:', !!request);
  }, []);

  // Handle response
  useEffect(() => {
    console.log('📡 Response received:', response?.type);
    
    if (response?.type === 'success') {
      console.log('✅ Auth success!');
      console.log('📦 Authentication object:', JSON.stringify(response.authentication, null, 2));
      const { authentication } = response;
      getUserInfo(authentication.accessToken);
    } else if (response?.type === 'error') {
      console.error('❌ Auth error type:', response.type);
      console.error('❌ Error details:', JSON.stringify(response.error, null, 2));
      console.error('❌ Full response:', JSON.stringify(response, null, 2));
      Alert.alert('Authentication Error', `Type: ${response.error?.code || 'Unknown'}\nMessage: ${response.error?.message || 'Check console'}`);
      setLoading(false);
    } else if (response?.type === 'cancel') {
      console.log('⚠️ User cancelled login');
      setLoading(false);
    } else if (response?.type === 'dismiss') {
      console.log('⚠️ User dismissed login');
      setLoading(false);
    } else if (response) {
      console.log('⚠️ Unknown response type:', response.type);
      console.log('📦 Full response:', JSON.stringify(response, null, 2));
      setLoading(false);
    }
  }, [response]);

  const getUserInfo = async (token) => {
    if (!token) {
      console.error('❌ No access token provided');
      setLoading(false);
      return;
    }
    
    try {
      console.log('📥 Fetching user info from Google...');
      console.log('🔑 Access token (first 20 chars):', token.substring(0, 20) + '...');
      
      const response = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('📡 Google API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google API error:', errorText);
        throw new Error(`Google API error: ${response.status}`);
      }

      const userInfo = await response.json();
      console.log('✅ User info received:', JSON.stringify(userInfo, null, 2));

      // Send to backend
      console.log('📤 Sending to Spring Boot backend...');
      const result = await handleFirebaseAuth(token, {
        email: userInfo.email,
        name: userInfo.name,
        imageUrl: userInfo.picture,
      });

      console.log('📥 Backend response:', JSON.stringify(result, null, 2));

      if (!result.success) {
        console.error('❌ Backend rejected login:', result.message);
        Alert.alert('Login Failed', result.message);
      } else {
        console.log('🎉 Login successful!');
      }

    } catch (error) {
      console.error('❌ Error in getUserInfo:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('Error', `Failed to complete login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('🚀 Starting Google Sign-In...');
    console.log('📋 Request object exists:', !!request);
    console.log('📋 Request details:', JSON.stringify(request, null, 2));
    
    if (!request) {
      console.error('❌ Request not ready yet');
      Alert.alert('Error', 'Authentication not ready. Please wait and try again.');
      return;
    }
    
    setLoading(true);
    console.log('🔓 Opening Google Sign-In prompt...');
    promptAsync();
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>🌟</Text>
          <Text style={styles.appName}>SelfHelp</Text>
          <Text style={styles.tagline}>Your Personal Growth Companion</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="book" size={32} color={COLORS.white} />
            <Text style={styles.featureText}>Track Your Mood</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.white} />
            <Text style={styles.featureText}>Build Habits</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flag" size={32} color={COLORS.white} />
            <Text style={styles.featureText}>Achieve Goals</Text>
          </View>
        </View>

        <View style={styles.authSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={!request || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 40,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: COLORS.white,
    marginTop: 8,
    textAlign: 'center',
  },
  authSection: {
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});

export default LoginScreen;