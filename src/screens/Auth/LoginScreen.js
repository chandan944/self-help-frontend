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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const { handleFirebaseAuth } = useAuth();

  useEffect(() => {
    console.log('🔧 Configuring Google Sign-In...');
    
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '1:1036194311354:android:826179f3a5f05a00be2683.apps.googleusercontent.com', // From Firebase Console
      offlineAccess: true,
    });
    
    console.log('✅ Google Sign-In configured');
  }, []);

  const handleGoogleSignIn = async () => {
    console.log('🚀 Starting Google Sign-In process...');
    setLoading(true);

    try {
      // Step 1: Check if device supports Google Play services
      console.log('📱 Checking Google Play services...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('✅ Google Play services available');

      // Step 2: Sign in with Google
      console.log('🔐 Getting Google user info...');
      const { idToken, user } = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful:', user.email);
      console.log('🎫 ID Token received:', idToken.substring(0, 20) + '...');

      // Step 3: Create Firebase credential
      console.log('🔥 Creating Firebase credential...');
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('✅ Firebase credential created');

      // Step 4: Sign in to Firebase
      console.log('🔥 Signing in to Firebase...');
      const firebaseUser = await auth().signInWithCredential(googleCredential);
      console.log('✅ Firebase authentication successful:', firebaseUser.user.email);

      // Step 5: Get Firebase ID token
      console.log('🎫 Getting Firebase ID token...');
      const firebaseIdToken = await firebaseUser.user.getIdToken();
      console.log('✅ Firebase ID token received:', firebaseIdToken.substring(0, 20) + '...');

      // Step 6: Send to your backend
      console.log('📤 Sending token to backend...');
      const result = await handleFirebaseAuth(firebaseIdToken, {
        email: firebaseUser.user.email,
        name: firebaseUser.user.displayName,
        imageUrl: firebaseUser.user.photoURL,
      });

      if (result.success) {
        console.log('✅ Login successful!');
      } else {
        console.error('❌ Backend authentication failed:', result.message);
        Alert.alert('Login Failed', result.message);
      }

    } catch (error) {
      console.error('❌ Google Sign-In Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'sign_in_cancelled') {
        console.log('ℹ️ User cancelled sign-in');
      } else if (error.code === 'in_progress') {
        console.log('⏳ Sign-in already in progress');
      } else if (error.code === 'play_services_not_available') {
        Alert.alert('Error', 'Google Play Services not available');
      } else {
        Alert.alert('Error', 'Failed to sign in with Google');
      }
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
            onPress={handleGoogleSignIn}
            disabled={loading}
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