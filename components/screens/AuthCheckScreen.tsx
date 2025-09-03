import { COLLECTIONS, db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export const AuthCheckScreen: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    setDebugLogs([]);

    try {
      addLog('🧪 AuthCheckScreen: Starting authentication check');
      
      // Check if user is logged in
      if (!user) {
        addLog('❌ AuthCheckScreen: No user logged in');
        addLog('❌ AuthCheckScreen: You need to log in first');
        return;
      }

      addLog(`✅ AuthCheckScreen: User is logged in`);
      addLog(`🧪 AuthCheckScreen: User ID: ${user.id}`);
      addLog(`🧪 AuthCheckScreen: User Email: ${user.email}`);
      addLog(`🧪 AuthCheckScreen: User Name: ${user.name}`);

      // Check if this user has any matches in Firestore
      addLog('🧪 AuthCheckScreen: Checking for existing matches in Firestore');
      
      const matchesQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId', '==', user.id)
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      addLog(`🧪 AuthCheckScreen: Found ${matchesSnapshot.size} existing matches for your user ID`);

      if (matchesSnapshot.size === 0) {
        addLog('❌ AuthCheckScreen: No existing matches found for your user ID');
        addLog('❌ AuthCheckScreen: This means you need to create real matches');
        addLog('❌ AuthCheckScreen: OR you might be logged in with the wrong account');
      } else {
        addLog('✅ AuthCheckScreen: Found existing matches!');
        matchesSnapshot.forEach(doc => {
          const data = doc.data();
          addLog(`🧪 AuthCheckScreen: Match ID: ${doc.id}`);
          addLog(`🧪 AuthCheckScreen: Partner: ${data.partnerName}`);
          addLog(`🧪 AuthCheckScreen: Score: ${data.score}%`);
        });
      }

      // Check if there are any matches for the known working user ID
      addLog('🧪 AuthCheckScreen: Checking known working user for comparison');
      const knownUserId = "lfhcWZ2RPmTEbw4Obwax3A98vs83";
      const knownMatchesQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId', '==', knownUserId)
      );
      
      const knownMatchesSnapshot = await getDocs(knownMatchesQuery);
      addLog(`🧪 AuthCheckScreen: Known user has ${knownMatchesSnapshot.size} matches`);

      if (knownMatchesSnapshot.size > 0 && matchesSnapshot.size === 0) {
        addLog('⚠️ AuthCheckScreen: WARNING: You might be logged in with the wrong account');
        addLog('⚠️ AuthCheckScreen: The known user has matches, but your current user does not');
        addLog('⚠️ AuthCheckScreen: Consider logging in with the account that has matches');
      }

    } catch (error) {
      addLog(`❌ AuthCheckScreen: Error during check: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const logoutAndCheck = async () => {
    addLog('🧪 AuthCheckScreen: Logging out current user');
    await signOutUser();
    addLog('✅ AuthCheckScreen: Logged out successfully');
    addLog('🧪 AuthCheckScreen: Please log in with the correct account');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔐 Auth Check</Text>
        <Text style={styles.subtitle}>Verify your login status</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={checkAuthStatus}
          disabled={loading}
        >
          <Text style={styles.debugButtonText}>
            {loading ? 'Checking...' : 'Check Auth Status'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.debugButton, styles.logoutButton]} 
          onPress={logoutAndCheck}
          disabled={loading}
        >
          <Text style={styles.debugButtonText}>
            Logout & Check
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      )}

      <ScrollView style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Auth Check Results:</Text>
        {debugLogs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#6A11CB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  debugButton: {
    backgroundColor: '#6A11CB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  logsContainer: {
    flex: 1,
    padding: 20,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 18,
    marginBottom: 5,
  },
});

