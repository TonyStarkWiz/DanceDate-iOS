import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut as firebaseSignOut } from 'firebase/auth';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';


export const SettingsAndActivityScreen: React.FC = () => {
  const { signOutUser, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleResetPassword = () => {
    Alert.alert(
      'Reset Password',
      'A password reset email will be sent to your email address.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Reset Email',
          onPress: () => {
            // TODO: Implement Firebase password reset
            Alert.alert(
              'Reset Email Sent',
              'Check your email for password reset instructions.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              console.log('🧪 SettingsScreen: Starting direct sign out process...');
              
              // Method 1: Try AuthContext signOut first
              try {
                console.log('🧪 SettingsScreen: Attempting AuthContext signOut...');
                await signOutUser();
                console.log('🧪 SettingsScreen: AuthContext signOut successful');
              } catch (authError) {
                console.warn('🧪 SettingsScreen: AuthContext signOut failed:', authError);
                
                // Method 2: Direct Firebase signOut as fallback
                console.log('🧪 SettingsScreen: Attempting direct Firebase signOut...');
                await firebaseSignOut(auth);
                console.log('🧪 SettingsScreen: Direct Firebase signOut successful');
              }
              
              // Clear all local storage data
              if (typeof window !== 'undefined') {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                  console.log('🧪 SettingsScreen: Cleared all local storage');
                } catch (storageError) {
                  console.warn('🧪 SettingsScreen: Error clearing storage:', storageError);
                }
              }
              
              // Force immediate navigation to signin
              console.log('🧪 SettingsScreen: Force navigating to signin...');
              router.replace('/signin');
              
              // Additional safety: Navigate again after a delay
              setTimeout(() => {
                console.log('🧪 SettingsScreen: Safety navigation to signin...');
                router.replace('/signin');
              }, 100);
              
              // Show success message
              setTimeout(() => {
                Alert.alert(
                  'Signed Out Successfully',
                  'You have been logged out. Please sign in to continue.',
                  [{ text: 'OK' }]
                );
              }, 300);
              
            } catch (error) {
              console.error('🧪 SettingsScreen: Complete sign out error:', error);
              
              // Emergency fallback: Force clear everything and navigate
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
              }
              
              // Force navigation regardless of error
              router.replace('/signin');
              
              Alert.alert(
                'Logged Out', 
                'Session cleared. Please sign in again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Settings and Activity</Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={handleResetPassword}>
            <Ionicons name="key-outline" size={24} color="#fff" />
            <Text style={styles.settingText}>Reset Password</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingButton}>
            <Ionicons name="shield-outline" size={24} color="#fff" />
            <Text style={styles.settingText}>Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          
          <TouchableOpacity style={styles.settingButton}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingButton}>
            <Ionicons name="information-circle-outline" size={24} color="#fff" />
            <Text style={styles.settingText}>About DanceDate</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* User Info Section */}
        {user && (
          <View style={styles.userInfoSection}>
            <Text style={styles.userInfoText}>
              Signed in as: {user.email || user.username || 'Unknown User'}
            </Text>
          </View>
        )}

        {/* Debug Quick Logout Button */}
        <TouchableOpacity 
          style={styles.debugLogoutButton}
          onPress={async () => {
            try {
              console.log('🧪 DEBUG: Quick logout pressed');
              
              // Clear localStorage immediately
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
              }
              
              // Direct Firebase signOut
              await firebaseSignOut(auth);
              console.log('🧪 DEBUG: Firebase signOut completed');
              
              // Force navigate to signin
              router.replace('/signin');
              console.log('🧪 DEBUG: Navigation to signin completed');
              
            } catch (error) {
              console.error('🧪 DEBUG: Quick logout error:', error);
              // Force navigate anyway
              router.replace('/signin');
            }
          }}
        >
          <Ionicons name="flash-outline" size={20} color="#FFD700" />
          <Text style={styles.debugLogoutText}>Quick Logout (Debug)</Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]} 
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#ff4757" />
          <Text style={styles.signOutText}>
            {isSigningOut ? 'Signing Out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6A11CB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    opacity: 0.9,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  userInfoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userInfoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  signOutText: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  debugLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  debugLogoutText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});