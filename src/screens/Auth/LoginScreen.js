import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';
import { API_BASE_URL } from '../../constants/config';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const { handleGoogleAuth } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Open Google OAuth in browser
      const googleAuthUrl = `${API_BASE_URL}/oauth2/authorization/google`;
      
      // Listen for the redirect
      const handleUrl = async ({ url }) => {
        if (url.includes('?token=')) {
          const token = url.split('?token=')[1];
          await handleGoogleAuth(token);
          Linking.removeEventListener('url', handleUrl);
        }
      };

      Linking.addEventListener('url', handleUrl);
      
      // Open browser for Google login
      const supported = await Linking.canOpenURL(googleAuthUrl);
      if (supported) {
        await Linking.openURL(googleAuthUrl);
      } else {
        Alert.alert('Error', 'Cannot open Google login');
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Failed to open Google login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>🌟</Text>
          <Text style={styles.appName}>SelfHelp</Text>
          <Text style={styles.tagline}>Your Personal Growth Companion</Text>
        </View>

        {/* Features */}
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

        {/* Google Sign In Button */}
        <View style={styles.authSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={24} color={COLORS.error} />
            <Text style={styles.googleButtonText}>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
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