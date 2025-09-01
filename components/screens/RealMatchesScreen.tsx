import { BackButton } from '@/components/ui/BackButton';
import { COLLECTIONS, db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { matchingDebugService } from '@/services/matchingDebugService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RealMatch {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sharedEvents: Array<{
    eventId: string;
    eventTitle: string;
    eventInstructor: string;
    eventLocation: string;
  }>;
  matchStrength: number;
  commonInterests: string[];
  lastActive: string;
  profilePicture?: string;
}

export const RealMatchesScreen: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<RealMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadRealMatches();
    }
  }, [user?.id]);

  const loadRealMatches = async () => {
    try {
      setLoading(true);
      console.log('🧪 RealMatchesScreen: Loading real matches for user:', user?.id);
      
      if (!user?.id) {
        console.log('🧪 RealMatchesScreen: No user ID, skipping load');
        return;
      }

      // Step 1: Get all event interests
      console.log('🧪 RealMatchesScreen: Getting all event interests...');
      const allInterestsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENT_INTERESTS));
      const allInterests = allInterestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('🧪 RealMatchesScreen: Found', allInterests.length, 'total interests');

      // Step 2: Get current user's interests
      console.log('🧪 RealMatchesScreen: Getting user interests...');
      const userInterestsQuery = query(
        collection(db, COLLECTIONS.EVENT_INTERESTS),
        where('userId', '==', user.id)
      );
      const userInterestsSnapshot = await getDocs(userInterestsQuery);
      const userInterests = userInterestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('🧪 RealMatchesScreen: User has', userInterests.length, 'interests');

      if (userInterests.length === 0) {
        setDebugInfo('No user interests found. Click "I\'m Interested" on some events first.');
        setMatches([]);
        return;
      }

      // Step 3: Find other users interested in the same events
      console.log('🧪 RealMatchesScreen: Finding matching users...');
      const userEventIds = userInterests.map(interest => interest.eventId);
      console.log('🧪 RealMatchesScreen: User interested in events:', userEventIds);

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

      console.log('🧪 RealMatchesScreen: Found', matchingUsers.size, 'matching users');

      // Step 4: Get user details for matches
      console.log('🧪 RealMatchesScreen: Getting user details...');
      const realMatches: RealMatch[] = [];

      for (const [userId, matchData] of matchingUsers) {
        try {
          // Get user details from users collection
          const userQuery = query(collection(db, COLLECTIONS.USERS), where('__name__', '==', userId));
          const userSnapshot = await getDocs(userQuery);
          
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            realMatches.push({
              id: userId,
              userId: userId,
              userName: userData.name || userData.displayName || 'Unknown User',
              userEmail: userData.email || 'No email',
              sharedEvents: matchData.sharedEvents.map(eventTitle => ({
                eventId: 'unknown',
                eventTitle: eventTitle,
                eventInstructor: 'Unknown',
                eventLocation: 'Unknown'
              })),
              matchStrength: Math.min(matchData.matchCount * 25, 100),
              commonInterests: matchData.sharedEvents,
              lastActive: 'Recently',
              profilePicture: userData.profilePicture
            });
          } else {
            // Fallback: create match with just the ID
            realMatches.push({
              id: userId,
              userId: userId,
              userName: 'Unknown User',
              userEmail: 'No email',
              sharedEvents: matchData.sharedEvents.map(eventTitle => ({
                eventId: 'unknown',
                eventTitle: eventTitle,
                eventInstructor: 'Unknown',
                eventLocation: 'Unknown'
              })),
              matchStrength: Math.min(matchData.matchCount * 25, 100),
              commonInterests: matchData.sharedEvents,
              lastActive: 'Recently',
              profilePicture: undefined
            });
          }
        } catch (error) {
          console.error('🧪 RealMatchesScreen: Error getting user details for', userId, error);
        }
      }

      setMatches(realMatches);
      setDebugInfo(`Found ${realMatches.length} matches from ${matchingUsers.size} potential users`);
      console.log('🧪 RealMatchesScreen: Set', realMatches.length, 'real matches');

    } catch (error) {
      console.error('🧪 RealMatchesScreen: Error loading matches:', error);
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRealMatches();
    setRefreshing(false);
  };

  const handleDebugSystem = async () => {
    try {
      console.log('🧪 RealMatchesScreen: Running debug system...');
      
      if (!user?.id) {
        Alert.alert('Debug Error', 'No user ID available');
        return;
      }

      const debugResults = await matchingDebugService.debugFullSystem(user.id);
      
      Alert.alert(
        'Real Matches Debug Results',
        `All Interests: ${debugResults.allInterests?.length || 0}\n` +
        `User Interests: ${debugResults.userInterests?.length || 0}\n` +
        `User Matches: ${debugResults.userMatches?.length || 0}\n\n` +
        `Current Matches: ${matches.length}\n\n` +
        `Check console for detailed logs.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('🧪 RealMatchesScreen: Debug error:', error);
      Alert.alert('Debug Error', 'Failed to run debug. Check console for details.');
    }
  };

  const handleMatchPress = (match: RealMatch) => {
    console.log('🧪 RealMatchesScreen: Viewing match:', match.userName);
    router.push(`/partnerProfile/${match.userId}`);
  };

  const handleStartChat = (match: RealMatch) => {
    console.log('🧪 RealMatchesScreen: Starting chat with:', match.userName);
    router.push('/chat');
  };

  const renderMatchItem = ({ item: match }: { item: RealMatch }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleMatchPress(match)}
      activeOpacity={0.7}
    >
      <View style={styles.matchHeader}>
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            {match.profilePicture ? (
              <Text style={styles.profileInitial}>{match.userName.charAt(0)}</Text>
            ) : (
              <Ionicons name="person" size={24} color="#fff" />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{match.userName}</Text>
            <Text style={styles.userEmail}>{match.userEmail}</Text>
            <Text style={styles.matchStrength}>
              {match.matchStrength}% Match
            </Text>
          </View>
        </View>
        <View style={styles.matchActions}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={(e) => {
              e.stopPropagation();
              handleStartChat(match);
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sharedEventsSection}>
        <Text style={styles.sectionTitle}>Shared Events ({match.sharedEvents.length})</Text>
        {match.sharedEvents.slice(0, 3).map((event, index) => (
          <View key={index} style={styles.eventItem}>
            <Text style={styles.eventTitle}>{event.eventTitle}</Text>
            <Text style={styles.eventDetails}>
              by {event.eventInstructor} • {event.eventLocation}
            </Text>
          </View>
        ))}
        {match.sharedEvents.length > 3 && (
          <Text style={styles.moreEvents}>
            +{match.sharedEvents.length - 3} more events
          </Text>
        )}
      </View>

      {match.commonInterests.length > 0 && (
        <View style={styles.interestsSection}>
          <Text style={styles.sectionTitle}>Common Interests</Text>
          <View style={styles.interestsList}>
            {match.commonInterests.slice(0, 5).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart" size={64} color="rgba(255, 255, 255, 0.5)" />
      <Text style={styles.emptyStateTitle}>No Real Matches Yet</Text>
      <Text style={styles.emptyStateText}>
        Start showing interest in events to find dance partners!
      </Text>
      <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/events')}>
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
          <Text style={styles.loadingText}>Loading Real Matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Real Matches</Text>
        <Text style={styles.subtitle}>
          {matches.length} match{matches.length !== 1 ? 'es' : ''} found
        </Text>
        <Text style={styles.debugInfo}>{debugInfo}</Text>
      </View>

      {/* Action Buttons */}
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
          onPress={handleDebugSystem}
        >
          <Ionicons name="bug-outline" size={20} color="#FFD700" />
          <Text style={styles.actionButtonText}>Debug System</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/matchingTest')}
        >
          <Ionicons name="flask-outline" size={20} color="#00FF00" />
          <Text style={styles.actionButtonText}>Test System</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/firestoreDebug')}
        >
          <Ionicons name="database-outline" size={20} color="#FF6B6B" />
          <Text style={styles.actionButtonText}>Firestore Debug</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/simpleRealMatches')}
        >
          <Ionicons name="heart-outline" size={20} color="#00FFFF" />
          <Text style={styles.actionButtonText}>Simple Matches</Text>
        </TouchableOpacity>
      </View>

      {/* Matches List */}
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
  matchStrength: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  matchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharedEventsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  eventDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  moreEvents: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  interestsSection: {
    marginBottom: 10,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#3A3A3A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  interestText: {
    fontSize: 10,
    color: '#ccc',
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
