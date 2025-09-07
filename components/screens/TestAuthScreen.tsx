import { AdvancedButton } from '@/components/ui/AdvancedButton';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { MaterialCard } from '@/components/ui/MaterialCard';
import { useAuth } from '@/contexts/AuthContext';
import { DanceDifficulty, SubscriptionTier } from '@/types/user';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import { BackButton } from '../ui/BackButton';

export const TestAuthScreen: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('testuser');
  const [testResult, setTestResult] = useState<string>('');

  const {
    user,
    loading,
    signIn,
    signUp,
    signOutUser,
    signInWithGoogle,
    updateUserProfile,
    updateUserPreferences,
    updatePremiumStatus,
    refreshUserData,
  } = useAuth();

  const logTest = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResult(prev => `${prev}\n[${timestamp}] ${message}`);
    console.log('🧪 Test:', message);
  };

  const testEmailSignIn = async () => {
    try {
      logTest('Testing email sign-in...');
      await signIn(email, password);
      logTest('✅ Email sign-in successful!');
    } catch (error: any) {
      logTest(`❌ Email sign-in failed: ${error.message}`);
    }
  };

  const testEmailSignUp = async () => {
    try {
      logTest('Testing email sign-up...');
      await signUp(email, password, username);
      logTest('✅ Email sign-up successful!');
    } catch (error: any) {
      logTest(`❌ Email sign-up failed: ${error.message}`);
    }
  };

  const testGoogleSignIn = async () => {
    try {
      logTest('Testing Google sign-in...');
      // This would normally get the ID token from Google Sign-In
      // For testing, we'll simulate the flow
      logTest('⚠️ Google sign-in requires actual Google OAuth setup');
      logTest('   To test: 1. Configure Google OAuth client IDs');
      logTest('             2. Set up Google Sign-In in your app');
      logTest('             3. Get actual ID token from Google');
    } catch (error: any) {
      logTest(`❌ Google sign-in test failed: ${error.message}`);
    }
  };

  const testSignOut = async () => {
    try {
      logTest('Testing sign-out...');
      await signOutUser();
      logTest('✅ Sign-out successful!');
    } catch (error: any) {
      logTest(`❌ Sign-out failed: ${error.message}`);
    }
  };

  const testUpdateProfile = async () => {
    if (!user) {
      logTest('❌ Cannot test profile update: no user logged in');
      return;
    }

    try {
      logTest('Testing profile update...');
      await updateUserProfile({
        bio: 'Updated bio from test',
        username: 'updated_' + username,
      });
      logTest('✅ Profile update successful!');
    } catch (error: any) {
      logTest(`❌ Profile update failed: ${error.message}`);
    }
  };

  const testUpdatePreferences = async () => {
    if (!user) {
      logTest('❌ Cannot test preferences update: no user logged in');
      return;
    }

    try {
      logTest('Testing preferences update...');
      await updateUserPreferences({
        experienceLevel: DanceDifficulty.INTERMEDIATE,
        lastUpdated: Date.now(),
      });
      logTest('✅ Preferences update successful!');
    } catch (error: any) {
      logTest(`❌ Preferences update failed: ${error.message}`);
    }
  };

  const testUpdatePremiumStatus = async () => {
    if (!user) {
      logTest('❌ Cannot test premium update: no user logged in');
      return;
    }

    try {
      logTest('Testing premium status update...');
      await updatePremiumStatus({
        isPremium: true,
        subscriptionTier: SubscriptionTier.PREMIUM_MONTHLY,
        aiSearchesRemaining: 100,
      });
      logTest('✅ Premium status update successful!');
    } catch (error: any) {
      logTest(`❌ Premium status update failed: ${error.message}`);
    }
  };

  const testRefreshUserData = async () => {
    if (!user) {
      logTest('❌ Cannot test data refresh: no user logged in');
      return;
    }

    try {
      logTest('Testing user data refresh...');
      await refreshUserData();
      logTest('✅ User data refresh successful!');
    } catch (error: any) {
      logTest(`❌ User data refresh failed: ${error.message}`);
    }
  };

  const testLocationServices = async () => {
    try {
      logTest('Testing location services...');
      const { default: locationService } = await import('@/services/locationService');
      
      const isAvailable = await locationService.isLocationServicesAvailable();
      logTest(`📍 Location services available: ${isAvailable}`);
      
      if (isAvailable) {
        const location = await locationService.getCurrentLocation();
        if (location) {
          logTest(`📍 Current location: ${location.coords.latitude}, ${location.coords.longitude}`);
        } else {
          logTest('📍 Could not get current location');
        }
      }
    } catch (error: any) {
      logTest(`❌ Location services test failed: ${error.message}`);
    }
  };

  const testCloudFunctions = async () => {
    try {
      logTest('Testing Cloud Functions...');
      const { default: cloudFunctions } = await import('@/services/cloudFunctions');
      
      logTest('✅ Cloud Functions service loaded successfully');
      logTest('⚠️ Note: Actual Cloud Functions require backend deployment');
    } catch (error: any) {
      logTest(`❌ Cloud Functions test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setTestResult('🧪 Starting comprehensive authentication tests...\n');
    
    // Test core authentication
    await testEmailSignUp();
    await testEmailSignIn();
    await testUpdateProfile();
    await testUpdatePreferences();
    await testUpdatePremiumStatus();
    await testRefreshUserData();
    
    // Test additional services
    await testLocationServices();
    await testCloudFunctions();
    
    // Test sign-out
    await testSignOut();
    
    logTest('🎉 All tests completed!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>🧪 Authentication Test Suite</Text>
        
        {/* Current Auth State */}
        <MaterialCard style={styles.stateCard}>
          <Text style={styles.sectionTitle}>Current Authentication State</Text>
          <Text style={styles.stateText}>
            Loading: {loading ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.stateText}>
            User: {user ? `${user.name} (${user.email})` : 'Not logged in'}
          </Text>
          {user && (
            <>
              <Text style={styles.stateText}>
                Username: {user.username}
              </Text>
              <Text style={styles.stateText}>
                Premium: {user.premiumUser?.isPremium ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.stateText}>
                Verified: {user.isVerified ? 'Yes' : 'No'}
              </Text>
            </>
          )}
        </MaterialCard>

        {/* Test Credentials */}
        <MaterialCard style={styles.inputCard}>
          <Text style={styles.sectionTitle}>Test Credentials</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </MaterialCard>

        {/* Test Buttons */}
        <View style={styles.buttonContainer}>
          <AdvancedButton
            title="Run All Tests"
            onPress={runAllTests}
            variant="primary"
            size="large"
            fullWidth
            icon="play"
          />
          
          <AdvancedButton
            title="Test Email Sign-Up"
            onPress={testEmailSignUp}
            variant="secondary"
            icon="person-add"
          />
          
          <AdvancedButton
            title="Test Email Sign-In"
            onPress={testEmailSignIn}
            variant="outline"
            icon="log-in"
          />
          
          <AdvancedButton
            title="Test Google Sign-In"
            onPress={testGoogleSignIn}
            variant="ghost"
            icon="logo-google"
          />
          
          <AdvancedButton
            title="Test Profile Update"
            onPress={testUpdateProfile}
            variant="secondary"
            icon="create"
          />
          
          <AdvancedButton
            title="Test Preferences Update"
            onPress={testUpdatePreferences}
            variant="outline"
            icon="settings"
          />
          
          <AdvancedButton
            title="Test Premium Update"
            onPress={testUpdatePremiumStatus}
            variant="primary"
            icon="star"
          />
          
          <AdvancedButton
            title="Test Data Refresh"
            onPress={testRefreshUserData}
            variant="ghost"
            icon="refresh"
          />
          
          <AdvancedButton
            title="Test Location Services"
            onPress={testLocationServices}
            variant="secondary"
            icon="location"
          />
          
          <AdvancedButton
            title="Test Cloud Functions"
            onPress={testCloudFunctions}
            variant="outline"
            icon="cloud"
          />
          
          <AdvancedButton
            title="Test Sign-Out"
            onPress={testSignOut}
            variant="danger"
            icon="log-out"
          />
        </View>

        {/* Test Results */}
        <MaterialCard style={styles.resultsCard}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <Text style={styles.resultsText}>{testResult || 'No tests run yet'}</Text>
        </MaterialCard>

        {/* Floating Action Button */}
        <FloatingActionButton
          icon="refresh"
          onPress={() => setTestResult('')}
          variant="surface"
          position="bottom-right"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#6A4C93',
  },
  stateCard: {
    marginBottom: 16,
    backgroundColor: '#E8F5E8',
  },
  inputCard: {
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  resultsCard: {
    marginBottom: 100, // Space for FAB
    backgroundColor: '#F8F9FA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  stateText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  resultsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 18,
  },
});
      <BackButton />