import { BackButton } from '@/components/ui/BackButton';
import { COLLECTIONS, db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export const FirestoreDebugScreen: React.FC = () => {
  const { user } = useAuth();
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  const testDirectFirestore = async () => {
    try {
      setLoading(true);
      addResult('🧪 Testing direct Firestore access...');
      
      // Test 1: Check if we can access Firestore at all
      addResult('🧪 Testing basic Firestore connection...');
      const testQuery = query(collection(db, COLLECTIONS.EVENT_INTERESTS));
      const testSnapshot = await getDocs(testQuery);
      addResult(`🧪 ✅ Firestore connection works! Found ${testSnapshot.size} total documents`);
      
      // Test 2: Check all event interests
      addResult('🧪 Checking all event_interests documents...');
      const interestsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENT_INTERESTS));
      addResult(`🧪 Total event_interests: ${interestsSnapshot.size}`);
      
      if (interestsSnapshot.size > 0) {
        interestsSnapshot.forEach((doc, index) => {
          const data = doc.data();
          addResult(`🧪 Doc ${index + 1}: ID=${doc.id}, User=${data.userId}, Event=${data.eventTitle}`);
        });
      }
      
      // Test 3: Check user's interests specifically
      if (user?.id) {
        addResult(`🧪 Checking interests for user: ${user.id}`);
        const userInterestsQuery = query(
          collection(db, COLLECTIONS.EVENT_INTERESTS),
          where('userId', '==', user.id)
        );
        const userInterestsSnapshot = await getDocs(userInterestsQuery);
        addResult(`🧪 User interests: ${userInterestsSnapshot.size}`);
        
        userInterestsSnapshot.forEach((doc, index) => {
          const data = doc.data();
          addResult(`🧪 User Interest ${index + 1}: ${data.eventTitle} (${data.eventId})`);
        });
      }
      
      // Test 4: Check users collection
      addResult('🧪 Checking users collection...');
      const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      addResult(`🧪 Total users: ${usersSnapshot.size}`);
      
      if (usersSnapshot.size > 0) {
        usersSnapshot.forEach((doc, index) => {
          const data = doc.data();
          addResult(`🧪 User ${index + 1}: ${data.email || data.name || 'Unknown'} (${doc.id})`);
        });
      }
      
    } catch (error) {
      addResult(`🧪 ❌ Firestore error: ${error.message}`);
      console.error('🧪 FirestoreDebugScreen error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testUserAuth = () => {
    addResult('🧪 Testing user authentication...');
    addResult(`🧪 User ID: ${user?.id || 'NO USER ID'}`);
    addResult(`🧪 User Email: ${user?.email || 'NO EMAIL'}`);
    addResult(`🧪 User Name: ${user?.name || 'NO NAME'}`);
    addResult(`🧪 Auth State: ${user ? 'LOGGED IN' : 'NOT LOGGED IN'}`);
  };

  const testCollections = async () => {
    try {
      setLoading(true);
      addResult('🧪 Testing all collections...');
      
      const collections = [
        COLLECTIONS.USERS,
        COLLECTIONS.EVENT_INTERESTS,
        COLLECTIONS.EVENT_MATCHES,
        COLLECTIONS.LIKES,
        COLLECTIONS.DISLIKES,
        COLLECTIONS.CHATS,
        COLLECTIONS.MESSAGES
      ];
      
      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          addResult(`🧪 ${collectionName}: ${snapshot.size} documents`);
        } catch (error) {
          addResult(`🧪 ❌ ${collectionName}: Error - ${error.message}`);
        }
      }
      
    } catch (error) {
      addResult(`🧪 ❌ Collections test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      
      <View style={styles.header}>
        <Text style={styles.title}>Firestore Debug</Text>
        <Text style={styles.subtitle}>Direct database access testing</Text>
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
          onPress={testDirectFirestore}
          disabled={loading}
        >
          <Ionicons name="database-outline" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Test Firestore Direct</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={testCollections}
          disabled={loading}
        >
          <Ionicons name="folder-outline" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Test All Collections</Text>
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
          <Text style={styles.loadingText}>Querying Firestore...</Text>
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Debug Results:</Text>
        {debugResults.length === 0 ? (
          <Text style={styles.noResults}>No tests run yet. Click a test button above.</Text>
        ) : (
          debugResults.map((result, index) => (
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
    fontSize: 11,
    marginBottom: 3,
    fontFamily: 'monospace',
  },
});


