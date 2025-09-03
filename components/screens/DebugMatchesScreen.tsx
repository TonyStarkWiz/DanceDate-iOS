import { COLLECTIONS, db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { matchingService } from '@/services/matchingService';
import { Match } from '@/types/matching';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
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

export const DebugMatchesScreen: React.FC = () => {
  const { user } = useAuth();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCompleteFlow = async () => {
    setLoading(true);
    setDebugLogs([]);
    setMatches([]);

    try {
      addLog('🧪 DebugMatchesScreen: Starting complete flow test');
      addLog(`🧪 DebugMatchesScreen: User ID: ${user?.id}`);

      if (!user?.id) {
        addLog('🧪 DebugMatchesScreen: No user ID available');
        return;
      }

      // Step 1: Check existing matches
      addLog('🧪 DebugMatchesScreen: Step 1 - Checking existing matches');
      const existingMatches = await matchingService.getUserMatches(user.id);
      addLog(`🧪 DebugMatchesScreen: Existing matches: ${existingMatches.length}`);

      // Step 2: Create a test match directly in Firestore
      addLog('🧪 DebugMatchesScreen: Step 2 - Creating test match directly in Firestore');
      const testMatchId = `test_match_${user.id}_${Date.now()}`;
      const testMatchData = {
        userId: user.id,
        partnerId: 'test-partner-direct',
        partnerName: 'Test Partner Direct',
        partnerLocation: 'Test City',
        partnerBio: 'Test bio for direct creation',
        matchType: 'dance_partner',
        partnerInterests: ['Salsa', 'Bachata'],
        score: 95,
        status: 'matched',
        matchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        await setDoc(doc(db, COLLECTIONS.MATCHES, testMatchId), testMatchData);
        addLog(`🧪 DebugMatchesScreen: Successfully created test match with ID: ${testMatchId}`);
      } catch (error) {
        addLog(`🧪 DebugMatchesScreen: Error creating test match: ${error}`);
      }

      // Step 3: Verify the test match was created
      addLog('🧪 DebugMatchesScreen: Step 3 - Verifying test match creation');
      const verifyQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId', '==', user.id)
      );
      const verifySnapshot = await getDocs(verifyQuery);
      addLog(`🧪 DebugMatchesScreen: Found ${verifySnapshot.size} matches for user in Firestore`);

      verifySnapshot.forEach(doc => {
        const data = doc.data();
        addLog(`🧪 DebugMatchesScreen: Match document ${doc.id}:`);
        addLog(`🧪 DebugMatchesScreen:   userId: ${data.userId}`);
        addLog(`🧪 DebugMatchesScreen:   partnerId: ${data.partnerId}`);
        addLog(`🧪 DebugMatchesScreen:   partnerName: ${data.partnerName}`);
        addLog(`🧪 DebugMatchesScreen:   status: ${data.status}`);
      });

      // Step 4: Test the matching service again
      addLog('🧪 DebugMatchesScreen: Step 4 - Testing matching service retrieval');
      const newMatches = await matchingService.getUserMatches(user.id);
      addLog(`🧪 DebugMatchesScreen: Matching service returned: ${newMatches.length} matches`);

      newMatches.forEach((match, index) => {
        addLog(`🧪 DebugMatchesScreen: Match ${index + 1}:`);
        addLog(`🧪 DebugMatchesScreen:   id: ${match.id}`);
        addLog(`🧪 DebugMatchesScreen:   partnerName: ${match.partnerName}`);
        addLog(`🧪 DebugMatchesScreen:   matchStrength: ${match.matchStrength}`);
        addLog(`🧪 DebugMatchesScreen:   status: ${match.status}`);
      });

      setMatches(newMatches);

      // Step 5: Test with known working user ID
      addLog('🧪 DebugMatchesScreen: Step 5 - Testing with known working user ID');
      const knownUserId = "lfhcWZ2RPmTEbw4Obwax3A98vs83";
      const knownMatches = await matchingService.getUserMatches(knownUserId);
      addLog(`🧪 DebugMatchesScreen: Known user matches: ${knownMatches.length}`);

    } catch (error) {
      addLog(`🧪 DebugMatchesScreen: General error: ${error}`);
    } finally {
      setLoading(false);
      addLog('🧪 DebugMatchesScreen: Complete flow test finished');
    }
  };

  const clearTestData = async () => {
    setLoading(true);
    addLog('🧪 DebugMatchesScreen: Clearing test data');
    
    try {
      const verifyQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId', '==', user?.id)
      );
      const verifySnapshot = await getDocs(verifyQuery);
      
      addLog(`🧪 DebugMatchesScreen: Found ${verifySnapshot.size} test matches to delete`);
      
      // Note: In production, you'd want to delete these properly
      // For now, we'll just log them
      verifySnapshot.forEach(doc => {
        addLog(`🧪 DebugMatchesScreen: Would delete: ${doc.id}`);
      });
      
    } catch (error) {
      addLog(`🧪 DebugMatchesScreen: Error clearing test data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Debug Matches</Text>
        <Text style={styles.subtitle}>Complete flow testing</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={testCompleteFlow}
          disabled={loading}
        >
          <Text style={styles.debugButtonText}>
            {loading ? 'Testing...' : 'Test Complete Flow'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.debugButton, styles.clearButton]} 
          onPress={clearTestData}
          disabled={loading}
        >
          <Text style={styles.debugButtonText}>
            Clear Test Data
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Running debug tests...</Text>
        </View>
      )}

      <ScrollView style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Debug Logs:</Text>
        {debugLogs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>

      {matches.length > 0 && (
        <View style={styles.matchesContainer}>
          <Text style={styles.matchesTitle}>Found Matches ({matches.length}):</Text>
          {matches.map((match, index) => (
            <View key={index} style={styles.matchItem}>
              <Text style={styles.matchText}>ID: {match.id}</Text>
              <Text style={styles.matchText}>Partner: {match.partnerName}</Text>
              <Text style={styles.matchText}>Location: {match.partnerLocation}</Text>
              <Text style={styles.matchText}>Score: {match.matchStrength}%</Text>
              <Text style={styles.matchText}>Status: {match.status}</Text>
            </View>
          ))}
        </View>
      )}
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
  clearButton: {
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
  matchesContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
  },
  matchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  matchItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  matchText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
});
