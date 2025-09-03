import { COLLECTIONS, db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export const FirestoreDebugScreen: React.FC = () => {
  const { user } = useAuth();
  const [matchesData, setMatchesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const debugMatchesCollection = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setLoading(true);
    setDebugInfo('');

    try {
      console.log('🧪 FirestoreDebugScreen: Starting debug for user:', user.id);
      setDebugInfo(`🧪 Debugging for user: ${user.id}\n`);

      // 1. First, get the user document to see the matches array
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('🧪 FirestoreDebugScreen: User document data:', userData);
        setDebugInfo(prev => prev + `🧪 User document data:\n${JSON.stringify(userData, null, 2)}\n`);
        
        const userMatches = userData.matches || [];
        setDebugInfo(prev => prev + `🧪 User matches array: ${userMatches.length} items\n`);
        setDebugInfo(prev => prev + `🧪 User matches array content:\n${JSON.stringify(userMatches, null, 2)}\n`);
      } else {
        setDebugInfo(prev => prev + `🧪 User document not found!\n`);
      }

      // 2. Get all documents in matches collection
      const allMatchesQuery = query(collection(db, COLLECTIONS.MATCHES));
      const allMatchesSnapshot = await getDocs(allMatchesQuery);
      
      console.log('🧪 FirestoreDebugScreen: Total documents in matches collection:', allMatchesSnapshot.size);
      setDebugInfo(prev => prev + `🧪 Total documents in matches collection: ${allMatchesSnapshot.size}\n`);

      const allMatches: any[] = [];
      allMatchesSnapshot.forEach(doc => {
        const data = doc.data();
        allMatches.push({
          id: doc.id,
          ...data
        });
        console.log('🧪 FirestoreDebugScreen: Document:', doc.id, 'Data:', data);
      });

      setDebugInfo(prev => prev + `🧪 All matches documents:\n${JSON.stringify(allMatches, null, 2)}\n`);

      // Query for specific user matches
      const userMatchesQuery1 = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId1', '==', user.id)
      );
      
      const userMatchesQuery2 = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId2', '==', user.id)
      );

      const [userMatches1, userMatches2] = await Promise.all([
        getDocs(userMatchesQuery1),
        getDocs(userMatchesQuery2)
      ]);

      console.log('🧪 FirestoreDebugScreen: User matches as userId1:', userMatches1.size);
      console.log('🧪 FirestoreDebugScreen: User matches as userId2:', userMatches2.size);
      
      setDebugInfo(prev => prev + `🧪 User matches as userId1: ${userMatches1.size}\n`);
      setDebugInfo(prev => prev + `🧪 User matches as userId2: ${userMatches2.size}\n`);

      const userMatches: any[] = [];
      
      userMatches1.forEach(doc => {
        const data = doc.data();
        userMatches.push({
          id: doc.id,
          ...data,
          userRole: 'userId1'
        });
        console.log('🧪 FirestoreDebugScreen: User match as userId1:', doc.id, data);
      });

      userMatches2.forEach(doc => {
        const data = doc.data();
        userMatches.push({
          id: doc.id,
          ...data,
          userRole: 'userId2'
        });
        console.log('🧪 FirestoreDebugScreen: User match as userId2:', doc.id, data);
      });

      setMatchesData(userMatches);
      setDebugInfo(prev => prev + `🧪 User matches found: ${userMatches.length}\n`);
      setDebugInfo(prev => prev + `🧪 User matches data:\n${JSON.stringify(userMatches, null, 2)}\n`);

      // 4. Check other collections that might contain match data
      setDebugInfo(prev => prev + `🧪 Checking other collections...\n`);
      
      // Check event_matches collection
      try {
        const eventMatchesQuery = query(collection(db, COLLECTIONS.EVENT_MATCHES));
        const eventMatchesSnapshot = await getDocs(eventMatchesQuery);
        setDebugInfo(prev => prev + `🧪 Event matches collection: ${eventMatchesSnapshot.size} documents\n`);
        
        const eventMatches: any[] = [];
        eventMatchesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId1 === user.id || data.userId2 === user.id) {
            eventMatches.push({
              id: doc.id,
              ...data
            });
          }
        });
        
        if (eventMatches.length > 0) {
          setDebugInfo(prev => prev + `🧪 User event matches:\n${JSON.stringify(eventMatches, null, 2)}\n`);
        }
      } catch (error) {
        setDebugInfo(prev => prev + `🧪 Event matches collection error: ${error}\n`);
      }

      // Check participants collection
      try {
        const participantsQuery = query(collection(db, 'participants'));
        const participantsSnapshot = await getDocs(participantsQuery);
        setDebugInfo(prev => prev + `🧪 Participants collection: ${participantsSnapshot.size} documents\n`);
        
        const userParticipants: any[] = [];
        participantsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId === user.id) {
            userParticipants.push({
              id: doc.id,
              ...data
            });
          }
        });
        
        if (userParticipants.length > 0) {
          setDebugInfo(prev => prev + `🧪 User participants:\n${JSON.stringify(userParticipants, null, 2)}\n`);
        }
      } catch (error) {
        setDebugInfo(prev => prev + `🧪 Participants collection error: ${error}\n`);
      }

    } catch (error) {
      console.error('🧪 FirestoreDebugScreen: Error debugging matches:', error);
      setDebugInfo(prev => prev + `🧪 Error: ${error}\n`);
      Alert.alert('Error', 'Failed to debug matches collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Firestore Debug</Text>
        <Text style={styles.subtitle}>Debug matches collection</Text>
      </View>

      <TouchableOpacity 
        style={styles.debugButton} 
        onPress={debugMatchesCollection}
        disabled={loading}
      >
        <Text style={styles.debugButtonText}>
          {loading ? 'Debugging...' : 'Debug Matches Collection'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Debugging Firestore...</Text>
        </View>
      )}

      <ScrollView style={styles.debugContainer}>
        <Text style={styles.debugText}>{debugInfo}</Text>
      </ScrollView>

      {matchesData.length > 0 && (
        <View style={styles.matchesContainer}>
          <Text style={styles.matchesTitle}>Found Matches:</Text>
          {matchesData.map((match, index) => (
            <View key={index} style={styles.matchItem}>
              <Text style={styles.matchText}>ID: {match.id}</Text>
              <Text style={styles.matchText}>User Role: {match.userRole}</Text>
              <Text style={styles.matchText}>Status: {match.status}</Text>
              <Text style={styles.matchText}>Match Strength: {match.matchStrength}</Text>
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
  debugButton: {
    backgroundColor: '#6A11CB',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
  debugContainer: {
    flex: 1,
    padding: 20,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 18,
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


