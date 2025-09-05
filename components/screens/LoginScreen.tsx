import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  const { signIn, user, loading } = useAuth();

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Load saved credentials and check auth state
  useEffect(() => {
    loadSavedCredentials();
    if (user) {
      router.replace('/postLoginWelcome');
    }
  }, [user]);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberCredentials(true);
      }
    } catch (error) {
      console.log('🧪 Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async () => {
    if (rememberCredentials) {
      try {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } catch (error) {
        console.log('🧪 Error saving credentials:', error);
      }
    } else {
      try {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      } catch (error) {
        console.log('🧪 Error removing credentials:', error);
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleSignIn = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      console.log('🧪 Attempting sign in with email:', email);
      await signIn(email.trim(), password);
      console.log('🧪 Sign in successful');
      
      await saveCredentials();
      
      console.log('🧪 Navigating to post login welcome');
      router.replace('/postLoginWelcome');
    } catch (error: any) {
      console.error('🧪 Sign in error:', error);
      let errorMessage = 'Invalid email or password';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
        setEmailError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
        setPasswordError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
        setEmailError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
        Alert.alert('Sign In Error', errorMessage);
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
        Alert.alert('Network Error', errorMessage);
      } else {
        Alert.alert('Sign In Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert(
      'Google Sign-In Temporarily Disabled',
      'Google Sign-In requires a development build. Please use email/password authentication for now, or run: npx eas build --profile development --platform ios',
      [
        {
          text: 'OK',
          onPress: () => console.log('🧪 User acknowledged Google Sign-In disabled message')
        }
      ]
    );
  };

  const handleCreateAccount = () => {
    router.push('/create_account');
  };

  const handleForgotPassword = () => {
    // TODO: Implement password reset
    Alert.alert('Password Reset', 'Password reset functionality will be available soon. Please contact support for assistance.');
  };

  const handleGuestMode = () => {
    Alert.alert(
      'Guest Mode',
      'Guest mode has limited functionality. You can browse events but cannot book or interact with other users.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue as Guest', onPress: () => router.push('/(tabs)') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4A148C', '#1976D2', '#0D47A1']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoEmoji}>💃</Text>
                  <Text style={styles.logoText}>DanceDate</Text>
                </View>
                <Text style={styles.tagline}>Connect through dance</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue your dance journey</Text>

                {/* Email Field */}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, emailError && styles.inputError]}
                    placeholder="Email"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                {/* Password Field */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, passwordError && styles.inputError]}
                    placeholder="Password"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setPasswordVisible(!isPasswordVisible)}
                    testID="eye-icon"
                  >
                    <Ionicons
                      name={isPasswordVisible ? 'eye-off' : 'eye'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                {/* Remember Credentials */}
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberCredentials(!rememberCredentials)}
                >
                  <View style={[styles.checkbox, rememberCredentials && styles.checkboxChecked]} testID="remember-checkbox">
                    {rememberCredentials && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={styles.rememberText}>Remember my credentials</Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
                  onPress={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" testID="activity-indicator" />
                  ) : (
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {/* Or Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign In */}
                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                  <Ionicons name="logo-google" size={20} color="#333" />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Guest Mode */}
                <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode}>
                  <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>

                {/* Create Account Link */}
                <View style={styles.createAccountContainer}>
                  <Text style={styles.createAccountText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={handleCreateAccount}>
                    <Text style={styles.createAccountLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoEmoji: {
    fontSize: 40,
    marginRight: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.9,
  },
  formSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 50,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  inputIcon: {
    position: 'absolute',
    left: 20,
    top: 18,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 18,
    zIndex: 1,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4A148C',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A148C',
  },
  rememberText: {
    color: '#333',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#4A148C',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#4A148C',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    color: '#666',
    fontSize: 16,
    marginHorizontal: 15,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: '100%',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: '100%',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4A148C',
  },
  guestButtonText: {
    color: '#4A148C',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  createAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountText: {
    color: '#666',
    fontSize: 16,
  },
  createAccountLink: {
    color: '#4A148C',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;

import { BackButton } from '../ui/BackButton';
      <BackButton />