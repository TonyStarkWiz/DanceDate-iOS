import { BackButton } from '@/components/ui/BackButton';
import { COLLECTIONS, db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SimpleMatch {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sharedEvents: string[];
  matchCount: number;
}

export const SimpleRealMatchesScreen: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<SimpleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadSimpleMatches();
    }
  }, [user?.id]);

  const loadSimpleMatches = async () => {
    try {
      setLoading(true);
      console.log('🧪 SimpleRealMatchesScreen: Loading simple matches for user:', user?.id);
      
      if (!user?.id) {
        console.log('🧪 SimpleRealMatchesScreen: No user ID, skipping load');
        setDebugInfo('No user ID available');
        return;
      }

      // Step 1: Get all event interests
      console.log('🧪 SimpleRealMatchesScreen: Getting all event interests...');
      const allInterestsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENT_INTERESTS));
      const allInterests = allInterestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('🧪 SimpleRealMatchesScreen: Found', allInterests.length, 'total interests');

      // Step 2: Get current user's interests
      console.log('🧪 SimpleRealMatchesScreen: Getting user interests...');
      const userInterestsQuery = query(
        collection(db, COLLECTIONS.EVENT_INTERESTS),
        where('userId', '==', user.id)
      );
      const userInterestsSnapshot = await getDocs(userInterestsQuery);
      const userInterests = userInterestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('🧪 SimpleRealMatchesScreen: User has', userInterests.length, 'interests');

      if (userInterests.length === 0) {
        setDebugInfo('No user interests found. Click "I\'m Interested" on some events first.');
        setMatches([]);
        return;
      }

      // Step 3: Find other users interested in the same events
      console.log('🧪 SimpleRealMatchesScreen: Finding matching users...');
      const userEventIds = userInterests.map(interest => interest.eventId);
      console.log('🧪 SimpleRealMatchesScreen: User interested in events:', userEventIds);

      const matchingUsers = new Map<string, { userId: string; sharedEvents: string[]; matchCount: number }>();

      // Find all interests for the same events
      allInterests.forEach(interest => {
        if (interest.userId !== user.id && userEventIds.includes(interest.eventId)) {
          const existing = matchingUsers.get(interest.userId);
          if (existing) {
            existing.sharedEvents.push(interest.eventTitle);
            existing.matchCount++;
          } else {
            matchingUsers.set(interest.userId, {
              userId: interest.userId,
              sharedEvents: [interest.eventTitle],
              matchCount: 1
            });
          }
        }
      });

      console.log('🧪 SimpleRealMatchesScreen: Found', matchingUsers.size, 'matching users');

      // Step 4: Get user details for matches
      console.log('🧪 SimpleRealMatchesScreen: Getting user details...');
      const simpleMatches: SimpleMatch[] = [];

      for (const [userId, matchData] of matchingUsers) {
        try {
          // Get user details from users collection
          const userQuery = query(collection(db, COLLECTIONS.USERS), where('__name__', '==', userId));
          const userSnapshot = await getDocs(userQuery);
          
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            simpleMatches.push({
              id: userId,
              userId: userId,
              userName: userData.name || userData.displayName || 'Unknown User',
              userEmail: userData.email || 'No email',
              sharedEvents: matchData.sharedEvents,
              matchCount: matchData.matchCount
            });
          } else {
            // Fallback: create match with just the ID
            simpleMatches.push({
              id: userId,
              userId: userId,
              userName: 'Unknown User',
              userEmail: 'No email',
              sharedEvents: matchData.sharedEvents,
              matchCount: matchData.matchCount
            });
          }
        } catch (error) {
          console.error('🧪 SimpleRealMatchesScreen: Error getting user details for', userId, error);
        }
      }

      setMatches(simpleMatches);
      setDebugInfo(`Found ${simpleMatches.length} matches from ${matchingUsers.size} potential users`);
      console.log('🧪 SimpleRealMatchesScreen: Set', simpleMatches.length, 'simple matches');

    } catch (error) {
      console.error('🧪 SimpleRealMatchesScreen: Error loading matches:', error);
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSimpleMatches();
    setRefreshing(false);
  };

  const renderMatchItem = ({ item: match }: { item: SimpleMatch }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>{match.userName.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{match.userName}</Text>
            <Text style={styles.userEmail}>{match.userEmail}</Text>
            <Text style={styles.matchCount}>
              {match.matchCount} shared event{match.matchCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sharedEventsSection}>
        <Text style={styles.sectionTitle}>Shared Events:</Text>
        {match.sharedEvents.slice(0, 3).map((event, index) => (
          <Text key={index} style={styles.eventText}>
            • {event}
          </Text>
        ))}
        {match.sharedEvents.length > 3 && (
          <Text style={styles.moreEvents}>
            +{match.sharedEvents.length - 3} more events
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart" size={64} color="rgba(255, 255, 255, 0.5)" />
      <Text style={styles.emptyStateTitle}>No Matches Found</Text>
      <Text style={styles.emptyStateText}>
        {debugInfo || 'Start showing interest in events to find dance partners!'}
      </Text>
      <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/eventList')}>
        <Ionicons name="calendar-outline" size={20} color="#fff" />
        <Text style={styles.browseButtonText}>Browse Events</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A4C93" />
          <Text style={styles.loadingText}>Loading Simple Matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      
      <View style={styles.header}>
        <Text style={styles.title}>Simple Real Matches</Text>
        <Text style={styles.subtitle}>
          {matches.length} match{matches.length !== 1 ? 'es' : ''} found
        </Text>
        <Text style={styles.debugInfo}>{debugInfo}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh-outline" size={20} color="#6A11CB" />
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/firestoreDebug')}
        >
          <Ionicons name="database-outline" size={20} color="#FF6B6B" />
          <Text style={styles.actionButtonText}>Debug Firestore</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6A11CB']}
            tintColor="#6A11CB"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
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
    marginBottom: 5,
  },
  debugInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: '#2e2e4a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6A4C93',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  matchCount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  sharedEventsSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  eventText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  moreEvents: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
});


