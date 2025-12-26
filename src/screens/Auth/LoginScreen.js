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
import * as AuthSession from 'expo-auth-session';


WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const { handleFirebaseAuth } = useAuth();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'selfhelp',
  useProxy: true,
});

const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: '1036194311354-fna7r9urun9gv8sf02bipvlf78lqrfn4.apps.googleusercontent.com',
  androidClientId: '1036194311354-m8hvrftmru48srfo5a1uiaauhr3k5ev7.apps.googleusercontent.com',
  redirectUri: redirectUri,
});

// Add this debug log
useEffect(() => {
  console.log('🔗 Redirect URI:', redirectUri);
  console.log('🔧 Auth ready:', !!request);
}, []);
  // Debug configuration on mount
useEffect(() => {
  if (response?.type === 'success') {
    getUserInfo(response.authentication.accessToken);
  } else if (response?.type === 'error') {
    Alert.alert('Auth Error', response.error?.message || 'Unknown error');
    setLoading(false);
  } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
    setLoading(false);
  }
}, [response]);

  // Handle response

const getUserInfo = async (token) => {
  try {
    console.log('📥 Getting user info...');
    
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to get user info');

    const userInfo = await response.json();
    console.log('✅ User:', userInfo.email);

    const result = await handleFirebaseAuth(token, {
      email: userInfo.email,
      name: userInfo.name,
      imageUrl: userInfo.picture,
    });

    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};

const handleGoogleSignIn = () => {
  if (!request) {
    Alert.alert('Error', 'Please wait...');
    return;
  }
  setLoading(true);
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
                <Text style={styles.googleButtonText}>Continue with Googl😂</Text>
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