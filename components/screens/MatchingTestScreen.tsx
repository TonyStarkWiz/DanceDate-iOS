import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { eventInterestService } from '@/services/eventInterestService';
import { matchingDebugService } from '@/services/matchingDebugService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export const MatchingTestScreen: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testUserAuth = () => {
    addResult(`User ID: ${user?.id || 'NO USER ID'}`);
    addResult(`User Email: ${user?.email || 'NO EMAIL'}`);
    addResult(`User Name: ${user?.name || 'NO NAME'}`);
  };

  const testEventInterests = async () => {
    try {
      setLoading(true);
      addResult('Testing Event Interests...');
      
      if (!user?.id) {
        addResult('❌ No user ID available');
        return;
      }

      // Test 1: Get all event interests
      const allInterests = await matchingDebugService.debugAllEventInterests();
      addResult(`✅ All Event Interests: ${allInterests.length}`);

      // Test 2: Get user's interests
      const userInterests = await matchingDebugService.debugUserInterests(user.id);
      addResult(`✅ User Interests: ${userInterests.length}`);

      // Test 3: Show user's interests details
      if (userInterests.length > 0) {
        userInterests.slice(0, 3).forEach((interest, index) => {
          addResult(`  ${index + 1}. ${interest.eventTitle} (${interest.eventId})`);
        });
        if (userInterests.length > 3) {
          addResult(`  ... and ${userInterests.length - 3} more`);
        }
      } else {
        addResult('❌ No user interests found');
      }

    } catch (error) {
      addResult(`❌ Error testing interests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testMatching = async () => {
    try {
      setLoading(true);
      addResult('Testing Matching System...');
      
      if (!user?.id) {
        addResult('❌ No user ID available');
        return;
      }

      // Test matching
      const matches = await matchingDebugService.debugUserMatching(user.id);
      addResult(`✅ Found ${matches.length} potential matches`);

      if (matches.length > 0) {
        matches.slice(0, 3).forEach((match, index) => {
          addResult(`  ${index + 1}. ${match.potentialPartner.name} (${match.matchStrength}% match)`);
          addResult(`     Shared events: ${match.sharedEvents.length}`);
        });
        if (matches.length > 3) {
          addResult(`  ... and ${matches.length - 3} more matches`);
        }
      } else {
        addResult('❌ No matches found');
      }

    } catch (error) {
      addResult(`❌ Error testing matching: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFullSystem = async () => {
    try {
      setLoading(true);
      addResult('Running Full System Test...');
      
      if (!user?.id) {
        addResult('❌ No user ID available');
        return;
      }

      const results = await matchingDebugService.debugFullSystem(user.id);
      
      addResult(`✅ Full System Results:`);
      addResult(`  - All Interests: ${results.allInterests?.length || 0}`);
      addResult(`  - User Interests: ${results.userInterests?.length || 0}`);
      addResult(`  - User Matches: ${results.userMatches?.length || 0}`);

    } catch (error) {
      addResult(`❌ Full system error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificEvent = async () => {
    try {
      setLoading(true);
      addResult('Testing Specific Event Interest...');
      
      if (!user?.id) {
        addResult('❌ No user ID available');
        return;
      }

      // Get user's first interest to test
      const userInterests = await eventInterestService.getUserInterestedEvents(user.id);
      
      if (userInterests.length > 0) {
        const firstInterest = userInterests[0];
        addResult(`Testing event: ${firstInterest.eventTitle}`);
        
        const usersInterested = await matchingDebugService.debugEventInterests(firstInterest.eventId);
        addResult(`✅ Users interested in this event: ${usersInterested.length}`);
        
        usersInterested.forEach((userId, index) => {
          addResult(`  ${index + 1}. User ID: ${userId}`);
        });
      } else {
        addResult('❌ No user interests to test');
      }

    } catch (error) {
      addResult(`❌ Error testing specific event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      
      <View style={styles.header}>
        <Text style={styles.title}>Matching System Test</Text>
        <Text style={styles.subtitle}>Debug your matching system step by step</Text>
      </View>

      <View style={styles.testButtons}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={testUserAuth}
          disabled={loading}
        >
          <Ionicons name="person-outline" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Test User Auth</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={testEventInterests}
          disabled={loading}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Test Event Interests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={testMatching}
          disabled={loading}
        >
          <Ionicons name="heart-outline" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Test Matching</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={testSpecificEvent}
          disabled={loading}
        >
          <Ionicons name="search-outline" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Test Specific Event</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={testFullSystem}
          disabled={loading}
        >
          <Ionicons name="bug-outline" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Full System Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#ff4444' }]}
          onPress={clearResults}
          disabled={loading}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A4C93" />
          <Text style={styles.loadingText}>Running test...</Text>
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No tests run yet. Click a test button above.</Text>
        ) : (
          testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
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
  testButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  testButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  noResults: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  resultText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});


