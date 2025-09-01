import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { eventBasedMatchingService } from '@/services/eventBasedMatchingService';
import { eventInterestService } from '@/services/eventInterestService';
import { matchDetectionService } from '@/services/matchDetectionService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export const LogoutDebugScreen: React.FC = () => {
  const { user, signOutUser, forceClearSession } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNormalLogout = async () => {
    try {
      setIsProcessing(true);
      console.log('🧪 LogoutDebugScreen: Starting normal logout...');
      
      await signOutUser();
      
      Alert.alert(
        'Logout Complete',
        'Normal logout completed. Check if you can now sign in as a different user.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.push('/signin')
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('🧪 LogoutDebugScreen: Normal logout error:', error);
      Alert.alert('Logout Error', 'Normal logout failed. Try force clear instead.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceClear = async () => {
    try {
      setIsProcessing(true);
      console.log('🧪 LogoutDebugScreen: Starting force clear...');
      
      await forceClearSession();
      
      Alert.alert(
        'Force Clear Complete',
        'All session data has been forcefully cleared. You should now be able to sign in as a different user.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.push('/signin')
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('🧪 LogoutDebugScreen: Force clear error:', error);
      Alert.alert('Force Clear Error', 'Force clear failed. Try refreshing the app.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefreshApp = () => {
    Alert.alert(
      'Refresh App',
      'This will refresh the entire app and clear all cached data. This should definitely resolve any session persistence issues.',
      [
        {
          text: 'Refresh Now',
          onPress: () => {
            // Force a hard refresh
            window.location.reload();
          }
        },
        { text: 'Cancel' }
      ]
    );
  };

  const checkAuthState = () => {
    const currentUser = user;
    Alert.alert(
      'Current Auth State',
      `User ID: ${currentUser?.id || 'None'}\nEmail: ${currentUser?.email || 'None'}\nName: ${currentUser?.name || 'None'}\n\nIf you see user data here, the session is still active.`,
      [{ text: 'OK' }]
    );
  };

  const checkFirestoreData = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to check Firestore data.');
      return;
    }

    try {
      console.log('🧪 LogoutDebugScreen: Checking Firestore data for user:', user.id);
      
      // Check event interests
      const interests = await eventInterestService.getUserInterestedEvents(user.id);
      console.log('🧪 LogoutDebugScreen: User event interests:', interests.length);
      
      // Check event-based matches
      const matches = await eventBasedMatchingService.findEventBasedMatches(user.id, 10);
      console.log('🧪 LogoutDebugScreen: Event-based matches:', matches.length);
      
      // Check user matches
      const userMatches = await eventBasedMatchingService.getUserEventMatches(user.id);
      console.log('🧪 LogoutDebugScreen: User matches:', userMatches.length);
      
      Alert.alert(
        'Firestore Data Check',
        `Event Interests: ${interests.length}\nEvent-Based Matches: ${matches.length}\nUser Matches: ${userMatches.length}\n\nCheck console for detailed logs.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('🧪 LogoutDebugScreen: Error checking Firestore data:', error);
      Alert.alert('Error', 'Failed to check Firestore data. See console for details.');
    }
  };

  const clearMatchCache = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to clear match cache.');
      return;
    }

    try {
      matchDetectionService.clearKnownMatches(user.id);
      console.log('🧪 LogoutDebugScreen: Cleared match cache for user:', user.id);
      Alert.alert('Success', 'Match cache cleared. Next "I\'m Interested" click will show all matches as new.');
    } catch (error) {
      console.error('🧪 LogoutDebugScreen: Error clearing match cache:', error);
      Alert.alert('Error', 'Failed to clear match cache.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      
      <View style={styles.header}>
        <Text style={styles.title}>Logout Debug Screen</Text>
        <Text style={styles.subtitle}>Test different logout methods</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Auth State</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              User ID: {user?.id || 'None'}
            </Text>
            <Text style={styles.infoText}>
              Email: {user?.email || 'None'}
            </Text>
            <Text style={styles.infoText}>
              Name: {user?.name || 'None'}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.checkButton} onPress={checkAuthState}>
            <Ionicons name="information-circle-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Check Auth State</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logout Methods</Text>
          
          <TouchableOpacity 
            style={[styles.logoutButton, isProcessing && styles.buttonDisabled]} 
            onPress={handleNormalLogout}
            disabled={isProcessing}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>
              {isProcessing ? 'Processing...' : 'Normal Logout'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.forceButton, isProcessing && styles.buttonDisabled]} 
            onPress={handleForceClear}
            disabled={isProcessing}
          >
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>
              {isProcessing ? 'Processing...' : 'Force Clear Session'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.refreshButton, isProcessing && styles.buttonDisabled]} 
            onPress={handleRefreshApp}
            disabled={isProcessing}
          >
            <Ionicons name="refresh-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>
              Refresh App (Nuclear Option)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionText}>
              1. <Text style={styles.bold}>Normal Logout:</Text> Standard logout process
            </Text>
            <Text style={styles.instructionText}>
              2. <Text style={styles.bold}>Force Clear:</Text> Aggressively clears all session data
            </Text>
            <Text style={styles.instructionText}>
              3. <Text style={styles.bold}>Refresh App:</Text> Reloads entire app (last resort)
            </Text>
            <Text style={styles.instructionText}>
              4. After logout, try going to the sign-in screen to test if you can input credentials
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => router.push('/signin')}
          >
            <Ionicons name="log-in-outline" size={20} color="#6A11CB" />
            <Text style={styles.quickButtonText}>Go to Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => router.push('/welcome')}
          >
            <Ionicons name="home-outline" size={20} color="#6A11CB" />
            <Text style={styles.quickButtonText}>Go to Welcome</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={checkFirestoreData}
          >
            <Ionicons name="database-outline" size={20} color="#6A11CB" />
            <Text style={styles.quickButtonText}>Check Firestore Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={clearMatchCache}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4757" />
            <Text style={styles.quickButtonText}>Clear Match Cache</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  forceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3838',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  quickButtonText: {
    color: '#6A11CB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
