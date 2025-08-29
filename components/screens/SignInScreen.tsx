import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(false);
  
  const { signIn, signInWithGoogle, user, loading } = useAuth();

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
    // Auto-redirect if already authenticated
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
      console.log('Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async () => {
    if (rememberCredentials) {
      try {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } catch (error) {
        console.log('Error saving credentials:', error);
      }
    } else {
      try {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      } catch (error) {
        console.log('Error removing credentials:', error);
      }
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Since signIn doesn't return a boolean, we'll assume success if no error is thrown
      await saveCredentials();
      // Update user profile if username is provided
      if (username.trim()) {
        // TODO: Implement Cloud Functions call to updateUserProfile
        console.log('🧪 Updating user profile with username:', username);
      }
      router.replace('/postLoginWelcome');
    } catch (error) {
      Alert.alert('Sign In Error', 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      console.log('🧪 Starting Google Sign-In process...');
      
      // Import the service dynamically to avoid build issues
      const { default: googleSignInService } = await import('@/services/googleSignIn');
      
      console.log('🧪 Google Sign-In service imported successfully');
      
      // Check if Google Play Services are available
      const isAvailable = await googleSignInService.isGooglePlayServicesAvailable();
      console.log('🧪 Google Play Services available:', isAvailable);
      
      if (!isAvailable) {
        Alert.alert('Error', 'Google Play Services not available');
        return;
      }

      // Sign in with Google
      console.log('🧪 Attempting Google Sign-In...');
      const { idToken } = await googleSignInService.signIn();
      console.log('🧪 Google Sign-In successful, got ID token');
      
      // Use the AuthContext to complete the sign-in
      console.log('🧪 Calling signInWithGoogle with ID token...');
      await signInWithGoogle(idToken);
      console.log('🧪 signInWithGoogle completed successfully');
      
      // Show success alert
      Alert.alert(
        '🎉 Success!', 
        'Google Sign-In completed successfully!\n\nUser is now logged in.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/postLoginWelcome')
          }
        ]
      );
      
    } catch (error: any) {
      console.error('🧪 Google Sign-In error:', error);
      
      // Create comprehensive error information
      const errorInfo = {
        message: error.message || 'No error message',
        code: error.code || 'No error code',
        name: error.name || 'No error name',
        stack: error.stack || 'No stack trace',
        toString: error.toString(),
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        authState: {
          user: user ? 'EXISTS' : 'NULL',
          loading: loading,
          hasGoogleService: 'Will check...'
        }
      };
      
      // Check if Google Sign-In service exists
      try {
        const { default: googleSignInService } = await import('@/services/googleSignIn');
        errorInfo.authState.hasGoogleService = 'YES';
      } catch (importError) {
        errorInfo.authState.hasGoogleService = 'NO - Import failed';
      }
      
      // Show comprehensive error alert
      Alert.alert(
        '🚨 COMPREHENSIVE ERROR REPORT', 
        `=== GOOGLE SIGN-IN FAILURE ===\n\n` +
        `📱 Error Details:\n` +
        `• Message: ${errorInfo.message}\n` +
        `• Code: ${errorInfo.code}\n` +
        `• Name: ${errorInfo.name}\n` +
        `• Time: ${errorInfo.timestamp}\n\n` +
        `🌐 Environment:\n` +
        `• URL: ${errorInfo.url}\n` +
        `• User Agent: ${errorInfo.userAgent.substring(0, 50)}...\n\n` +
        `🔐 Auth State:\n` +
        `• User: ${errorInfo.authState.user}\n` +
        `• Loading: ${errorInfo.authState.loading}\n` +
        `• Google Service: ${errorInfo.authState.hasGoogleService}\n\n` +
        `📋 Full Error Object:\n${errorInfo.fullError.substring(0, 200)}...\n\n` +
        `💡 Next Steps:\n` +
        `1. Check browser console for full logs\n` +
        `2. Verify Firebase config files are present\n` +
        `3. Confirm OAuth client IDs are correct\n` +
        `4. Check network tab for failed requests`,
        [
          {
            text: '📋 Copy Error Info',
            onPress: () => {
              const errorText = JSON.stringify(errorInfo, null, 2);
              navigator.clipboard.writeText(errorText);
              Alert.alert('✅ Copied!', 'Error information copied to clipboard');
            }
          },
          {
            text: '🔍 Show Full Error',
            onPress: () => {
              Alert.alert(
                '📋 COMPLETE ERROR OBJECT',
                errorInfo.fullError,
                [{ text: 'OK' }]
              );
            }
          },
          { text: '❌ Close' }
        ]
      );
      
      // Also log everything to console
      console.group('🚨 COMPREHENSIVE GOOGLE SIGN-IN ERROR');
      console.log('Error Object:', error);
      console.log('Error Info:', errorInfo);
      console.log('Current Auth State:', { user, loading });
      console.log('Environment:', { url: errorInfo.url, userAgent: errorInfo.userAgent });
      console.groupEnd();
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/create_account');
  };

  const handleForgotPassword = () => {
    // TODO: Implement password reset
    Alert.alert('Password Reset', 'Password reset will be implemented soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>DanceDate</Text>
          </View>
          <Text style={styles.tagline}>Connect through dance</Text>
        </View>

        {/* Authentication Status Indicator */}
        <View style={styles.statusSection}>
          <View style={[styles.statusIndicator, { backgroundColor: user ? '#4CAF50' : '#FF9800' }]}>
            <Text style={styles.statusText}>
              🔐 {user ? 'LOGGED IN' : 'NOT LOGGED IN'}
            </Text>
          </View>
          {user && (
            <Text style={styles.userInfo}>
              Welcome, {user.name || user.email || 'User'}!
            </Text>
          )}
          
          {/* Debug Panel - Shows Exact Auth State */}
          <View style={styles.debugPanel}>
            <Text style={styles.debugTitle}>🔍 Authentication Debug Info:</Text>
            <Text style={styles.debugText}>User Object: {user ? 'EXISTS' : 'NULL'}</Text>
            <Text style={styles.debugText}>User ID: {user?.id || 'N/A'}</Text>
            <Text style={styles.debugText}>User Email: {user?.email || 'N/A'}</Text>
            <Text style={styles.debugText}>User Name: {user?.name || 'N/A'}</Text>
            <Text style={styles.debugText}>Auth Loading: {loading ? 'YES' : 'NO'}</Text>
            <Text style={styles.debugText}>Timestamp: {new Date().toLocaleTimeString()}</Text>
          </View>
        </View>

        {/* Sign In Form */}
        <View style={styles.formSection}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your dance journey</Text>

          {/* Username Field */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username (optional)"
              placeholderTextColor="#666"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Remember Credentials */}
          <TouchableOpacity
            style={styles.rememberContainer}
            onPress={() => setRememberCredentials(!rememberCredentials)}
          >
            <View style={[styles.checkbox, rememberCredentials && styles.checkboxChecked]}>
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
              <ActivityIndicator color="#fff" />
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

          {/* Create Account Link */}
          <View style={styles.createAccountContainer}>
            <Text style={styles.createAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleCreateAccount}>
              <Text style={styles.createAccountLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C', // Solid purple background
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
  oldTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light purple background
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light purple background
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
  },
  showButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  showButtonText: {
    fontSize: 18,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 16,
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
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A148C',
    borderColor: '#4A148C',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberText: {
    color: '#fff',
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: '#4A148C', // Same purple as background
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
  },
  signUpLink: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeBar: {
    height: 4,
    backgroundColor: '#333',
    marginHorizontal: 120,
    marginBottom: 20,
    borderRadius: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 80, // Add some padding at the bottom for the home bar
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  statusIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userInfo: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  debugPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  debugTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'left',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  formSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputIcon: {
    position: 'absolute',
    left: 20,
    top: 18,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 18,
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
    backgroundColor: '#fff',
    opacity: 0.3,
  },
  dividerText: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  createAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
  },
  createAccountLink: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
});

export default SignInScreen;
