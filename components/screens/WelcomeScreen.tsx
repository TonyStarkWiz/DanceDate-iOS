import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

// Platform-specific imports
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const shimmerTranslateX = useRef(new Animated.Value(-200)).current;
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Configure Google Sign-In once
  useEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      GoogleSignin.configure({
        webClientId: '915121530642-kumscbkiupu4ail03c437froeprk099t.apps.googleusercontent.com', // Your web client ID
        offlineAccess: true,
      });
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        // Mobile path - use React Native Google Sign-In
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const userInfo = await GoogleSignin.signIn();
        
        // For mobile, we'll get the user info directly
        // The AuthContext should handle the authentication
        console.log('Mobile Google Sign-In successful:', userInfo);
        // Navigate to post-login welcome
        router.push('/postLoginWelcome');
      } else {
        // Web path - use Firebase Auth
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        if (result.user) {
          // For web, we can directly use the user object
          // The AuthContext should handle this automatically via onAuthStateChanged
          router.push('/postLoginWelcome');
        } else {
          throw new Error('No user received from Firebase Google Sign-In');
        }
      }
      
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      alert(`Google Sign-In failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerTranslateX, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerTranslateX, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, [shimmerTranslateX]);

  return (
    <LinearGradient
      colors={['#4A148C', '#1976D2']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Status Bar Placeholder */}
      <View style={styles.statusBar}>
        <Text style={styles.statusBarText}>6:42</Text>
        <View style={styles.statusBarIcons}>
          <View style={styles.statusBarIcon} />
          <View style={styles.statusBarIcon} />
          <View style={styles.statusBarIcon} />
          <View style={styles.wifiIcon} />
          <View style={styles.batteryIcon} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
                 {/* Top Card */}
         <View style={styles.topCard}>
           <View style={styles.cardContent}>
             <View style={styles.titleRow}>
               <Text style={styles.danceEmoji}>💃</Text>
               <Text style={styles.welcomeTitle}>Welcome to DanceDate</Text>
             </View>
             <Text style={styles.tagline}>Find your next partner</Text>
           </View>
         </View>

         {/* Features Card with Shimmer Effect */}
         <View style={styles.featuresCard}>
           <Animated.View
             style={[
               styles.shimmerOverlay,
               {
                 transform: [{ translateX: shimmerTranslateX }],
               },
             ]}
           />
           <Text style={styles.discoverText}>Discover</Text>
           <View style={styles.featuresRow}>
             <Text style={styles.featureItem}>✨ Match 💖</Text>
             <Text style={styles.featureItem}>— Book 🎟️</Text>
             <Text style={styles.featureItem}>— Post 🩰</Text>
           </View>
         </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, isGoogleSigningIn && styles.disabledButton]}
            onPress={handleGoogleSignIn}
            disabled={isGoogleSigningIn}
          >
            <Ionicons name="logo-google" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>
              {isGoogleSigningIn ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

                                <TouchableOpacity 
             style={styles.secondaryButton}
             onPress={() => router.push('/login')}
           >
             <Text style={styles.secondaryButtonText}>Log In with Email</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={styles.primaryButton}
             onPress={() => router.push('/create_account')}
           >
             <Text style={styles.primaryButtonText}>Create Account</Text>
           </TouchableOpacity>

           <TouchableOpacity style={styles.secondaryButton}>
             <Text style={styles.secondaryButtonText}>Continue as Guest (limited)</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={styles.secondaryButton}
             onPress={() => router.push('/takeTour')}
           >
             <Text style={styles.secondaryButtonText}>Take the Tour</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  statusBarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBarIcon: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  wifiIcon: {
    width: 16,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  batteryIcon: {
    width: 24,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  topCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: width * 0.6,
    transform: [{ skewX: '-20deg' }],
  },
  cardContent: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  danceEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
     featuresCard: {
     backgroundColor: 'rgba(255, 255, 255, 0.15)',
     borderRadius: 20,
     padding: 20,
     marginBottom: 40,
     width: '100%',
     alignItems: 'center',
     overflow: 'hidden',
     position: 'relative',
   },
  discoverText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  featureItem: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#4A148C',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#4A148C',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4A148C',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    height: 3,
    backgroundColor: '#fff',
    marginHorizontal: 100,
    marginBottom: 20,
    borderRadius: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default WelcomeScreen;
