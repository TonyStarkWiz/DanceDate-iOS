import { bilateralMatchingService } from '@/services/bilateralMatchingService';
import { testCollectionNameVariations, verifyCollectionNames } from '@/services/collectionVerification';
import { enhancedMatchingService } from '@/services/enhancedMatchingService';
import { eventBasedMatchingService } from '@/services/eventBasedMatchingService';
import { debugFirestoreCollections } from '@/services/firestoreDebug';
import { firestoreMatchDiscoveryService } from '@/services/firestoreMatchDiscoveryService';
import { matchDetectionService } from '@/services/matchDetectionService';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FirestoreDebugScreen() {
  const [debugOutput, setDebugOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runDebug = async () => {
    setIsLoading(true);
    setDebugOutput('');
    
    try {
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        originalLog(...args);
      };

      // Run the debug function
      await debugFirestoreCollections();
      
      // Restore console.log
      console.log = originalLog;
      
      // Update UI with captured output
      setDebugOutput(logs.join('\n'));
      
    } catch (error) {
      console.error('Debug error:', error);
      setDebugOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testBilateralMatching = async () => {
    setIsLoading(true);
    setDebugOutput('');
    
    try {
      const result = await bilateralMatchingService.markInterestAndDetectMatch(
        'test-event-123',
        'Test Salsa Event',
        'interested'
      );
      
      setDebugOutput(`Bilateral Match Result:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setDebugOutput(`Bilateral Match Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEventBasedMatching = async () => {
    setIsLoading(true);
    setDebugOutput('');
    
    try {
      const { auth } = await import('@/config/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setDebugOutput('No authenticated user found');
        return;
      }
      
      const matches = await eventBasedMatchingService.findEventBasedMatches(currentUser.uid, 10);
      
      setDebugOutput(`Event-Based Matches:\n${JSON.stringify(matches, null, 2)}`);
    } catch (error) {
      setDebugOutput(`Event-Based Match Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMatchDiscovery = async () => {
    setIsLoading(true);
    setDebugOutput('');
    
    try {
      const { auth } = await import('@/config/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setDebugOutput('No authenticated user found');
        return;
      }
      
      const result = await matchDetectionService.checkForMatchesAfterInterest(
        currentUser.uid,
        { id: 'test-event-123', title: 'Test Event' } as any
      );
      
      setDebugOutput(`Match Detection Result:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setDebugOutput(`Match Detection Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFirestoreDiscovery = async () => {
    setIsLoading(true);
    setDebugOutput('');
    
    try {
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        originalLog(...args);
      };

      // Test Firestore Match Discovery
      console.log('🧪 Testing Firestore Match Discovery Service...');
      
      // Get all matches
      const allMatches = await firestoreMatchDiscoveryService.getAllMatches();
      console.log(`🧪 All matches found: ${allMatches.length}`);
      
      // Get match statistics
      const stats = await firestoreMatchDiscoveryService.getMatchStatistics();
      console.log(`🧪 Match statistics:`, stats);
      
      // Get recent matches
      const recentMatches = await firestoreMatchDiscoveryService.getRecentMatches(5);
      console.log(`🧪 Recent matches: ${recentMatches.length}`);
      
      // Get current user matches if authenticated
      const { auth } = await import('@/config/firebase');
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userMatches = await firestoreMatchDiscoveryService.getUserMatches(currentUser.uid);
        console.log(`🧪 Current user matches: ${userMatches.length}`);
        
        const matchesWithProfiles = await firestoreMatchDiscoveryService.getMatchesWithProfiles(currentUser.uid);
        console.log(`🧪 User matches with profiles: ${matchesWithProfiles.length}`);
      }
      
      // Restore console.log
      console.log = originalLog;
      
      // Update UI with captured output
      setDebugOutput(logs.join('\n'));
      
    } catch (error) {
      console.error('Firestore discovery error:', error);
      setDebugOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCollections = async () => {
    setIsLoading(true);
    setDebugOutput('');
    
    try {
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        originalLog(...args);
      };

      // Run the verification
      const results = await verifyCollectionNames();
      
      // Restore console.log
      console.log = originalLog;
      
      // Update UI with captured output
      setDebugOutput(logs.join('\n'));
      
    } catch (error) {
      console.error('Collection verification error:', error);
      setDebugOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCollectionVariations = async () => {
    setIsLoading(true);
    setDebugOutput('');
    
    try {
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        originalLog(...args);
      };

      // Run the variations test
      await testCollectionNameVariations();
      
      // Restore console.log
      console.log = originalLog;
      
      // Update UI with captured output
      setDebugOutput(logs.join('\n'));
      
    } catch (error) {
      console.error('Collection variations error:', error);
      setDebugOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEnhancedMatching = async () => {
    setIsLoading(true);
    setDebugOutput('');
    
    try {
      const { auth } = await import('@/config/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setDebugOutput('No authenticated user found');
        return;
      }
      
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        originalLog(...args);
      };

      // Test enhanced matching
      console.log('🧪 Testing Enhanced Matching Service...');
      
      // Get user's current matches
      const currentMatches = await enhancedMatchingService.getUserMatches(currentUser.uid);
      console.log(`🧪 Current matches: ${currentMatches.length}`);
      
      // Get user's event interests
      const userInterests = await enhancedMatchingService.getUserEventInterests(currentUser.uid);
      console.log(`🧪 User interests: ${userInterests.length}`);
      
      // Find and create new matches
      const newMatches = await enhancedMatchingService.findAndCreateMatches(currentUser.uid);
      console.log(`🧪 New matches created: ${newMatches.length}`);
      
      // Get updated matches
      const updatedMatches = await enhancedMatchingService.getUserMatches(currentUser.uid);
      console.log(`🧪 Updated matches: ${updatedMatches.length}`);
      
      // Get all matches for debugging
      const allMatches = await enhancedMatchingService.getAllMatches();
      console.log(`🧪 Total matches in database: ${allMatches.length}`);
      
      // Restore console.log
      console.log = originalLog;
      
      // Update UI with captured output
      setDebugOutput(logs.join('\n'));
      
    } catch (error) {
      console.error('Enhanced matching error:', error);
      setDebugOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestMatch = async () => {
    setIsLoading(true);
    setDebugOutput('');
    
    try {
      const { auth } = await import('@/config/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setDebugOutput('No authenticated user found');
        return;
      }
      
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        originalLog(...args);
      };

      // Create a test match with a dummy user
      const testUserId = 'test-user-123';
      const matchId = await enhancedMatchingService.createTestMatch(currentUser.uid, testUserId);
      
      console.log(`🧪 Test match created: ${matchId}`);
      
      // Get the created match
      const matches = await enhancedMatchingService.getUserMatches(currentUser.uid);
      console.log(`🧪 User now has ${matches.length} matches`);
      
      // Restore console.log
      console.log = originalLog;
      
      // Update UI with captured output
      setDebugOutput(logs.join('\n'));
      
    } catch (error) {
      console.error('Create test match error:', error);
      setDebugOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firestore Debug</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={runDebug}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Running...' : '🔍 Run Full Debug'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testBilateralMatching}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : '🎯 Test Bilateral Matching'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testEventBasedMatching}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : '📊 Test Event-Based Matching'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testMatchDetection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : '🔍 Test Match Detection'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testFirestoreDiscovery}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : '🔍 Test Firestore Discovery'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={verifyCollections}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Verifying...' : '📋 Verify Collection Names'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testCollectionVariations}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : '🔄 Test Collection Variations'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testEnhancedMatching}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : '🚀 Test Enhanced Matching'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={createTestMatch}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : '➕ Create Test Match'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.outputContainer}>
        <Text style={styles.outputText}>{debugOutput || 'Click a button to start debugging...'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outputContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
  },
  outputText: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});


