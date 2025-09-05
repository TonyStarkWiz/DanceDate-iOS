import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { eventBasedMatchingService, EventMatchSuggestion } from '@/services/eventBasedMatchingService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

export const EventBasedMatchingScreen: React.FC = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<EventMatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadMatchSuggestions();
    }
  }, [user]);

  const loadMatchSuggestions = async () => {
    try {
      setLoading(true);
      console.log('🧪 EventBasedMatchingScreen: Loading match suggestions...');
      
      const matchSuggestions = await eventBasedMatchingService.findEventBasedMatches(user!.id, 20);
      setSuggestions(matchSuggestions);
      
      console.log('🧪 EventBasedMatchingScreen: Loaded', matchSuggestions.length, 'suggestions');
    } catch (error) {
      console.error('🧪 EventBasedMatchingScreen: Error loading suggestions:', error);
      Alert.alert('Error', 'Failed to load match suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatchSuggestions();
    setRefreshing(false);
  };

  const handleMatchPress = (suggestion: EventMatchSuggestion) => {
    Alert.alert(
      `Match with ${suggestion.potentialPartner.name}`,
      `Match Strength: ${suggestion.matchStrength}%\n\nShared Events: ${suggestion.sharedEvents.length}\nCommon Interests: ${suggestion.commonInterests.join(', ')}`,
      [
        {
          text: 'View Profile',
          onPress: () => {
            // Navigate to user profile
            router.push(`/partnerProfile/${suggestion.userId}`);
          }
        },
        {
          text: 'Send Message',
          onPress: () => {
            // Navigate to chat
            router.push(`/chat/${suggestion.userId}`);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleCreateMatch = async (suggestion: EventMatchSuggestion) => {
    try {
      console.log('🧪 EventBasedMatchingScreen: Creating match with:', suggestion.userId);
      
      const sharedEventIds = suggestion.sharedEvents.map(event => event.eventId);
      await eventBasedMatchingService.createEventBasedMatch(user!.id, suggestion.userId, sharedEventIds);
      
      Alert.alert(
        'Match Created! 🎉',
        `You've been matched with ${suggestion.potentialPartner.name} based on your shared event interests!`,
        [
          {
            text: 'Send Message',
            onPress: () => router.push(`/chat/${suggestion.userId}`)
          },
          { text: 'OK', style: 'default' }
        ]
      );
      
      // Refresh suggestions
      await loadMatchSuggestions();
    } catch (error) {
      console.error('🧪 EventBasedMatchingScreen: Error creating match:', error);
      Alert.alert('Error', 'Failed to create match. Please try again.');
    }
  };

  const renderMatchSuggestion = ({ item: suggestion }: { item: EventMatchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleMatchPress(suggestion)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{suggestion.potentialPartner.name}</Text>
            <Text style={styles.matchStrength}>{suggestion.matchStrength}% Match</Text>
          </View>
        </View>
        <View style={styles.matchBadge}>
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={styles.matchBadgeText}>{suggestion.sharedEvents.length}</Text>
        </View>
      </View>
      
      <View style={styles.sharedEvents}>
        <Text style={styles.sharedEventsTitle}>Shared Events:</Text>
        {suggestion.sharedEvents.slice(0, 3).map((event, index) => (
          <Text key={index} style={styles.eventTitle} numberOfLines={1}>
            • {event.eventTitle}
          </Text>
        ))}
        {suggestion.sharedEvents.length > 3 && (
          <Text style={styles.moreEvents}>+{suggestion.sharedEvents.length - 3} more</Text>
        )}
      </View>
      
      {suggestion.commonInterests.length > 0 && (
        <View style={styles.interestsContainer}>
          <Text style={styles.interestsTitle}>Common Interests:</Text>
          <View style={styles.interestsList}>
            {suggestion.commonInterests.slice(0, 4).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.matchButton}
          onPress={() => handleCreateMatch(suggestion)}
        >
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={styles.matchButtonText}>Create Match</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => router.push(`/chat/${suggestion.userId}`)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#6A11CB" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color="#6A11CB" />
      <Text style={styles.emptyTitle}>No Match Suggestions</Text>
      <Text style={styles.emptySubtitle}>
        Start showing interest in dance events to find potential partners with similar interests!
      </Text>
      <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/eventList')}>
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
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Finding potential partners...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Event-Based Matches</Text>
        <Text style={styles.subtitle}>
          Find partners based on shared event interests
        </Text>
      </View>

      {/* Match Suggestions */}
      <FlatList
        data={suggestions}
        renderItem={renderMatchSuggestion}
        keyExtractor={(item) => item.userId}
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  suggestionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6A11CB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  matchStrength: {
    fontSize: 14,
    color: '#6A11CB',
    fontWeight: '600',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  matchBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  sharedEvents: {
    marginBottom: 15,
  },
  sharedEventsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  moreEvents: {
    fontSize: 12,
    color: '#6A11CB',
    fontStyle: 'italic',
  },
  interestsContainer: {
    marginBottom: 15,
  },
  interestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  interestText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  matchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  messageButtonText: {
    color: '#6A11CB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});


