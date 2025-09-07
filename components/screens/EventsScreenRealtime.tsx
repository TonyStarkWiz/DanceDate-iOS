import { BackButton } from '@/components/ui/BackButton';
import { MatchNotification } from '@/components/ui/MatchNotification';
import { useAuth } from '@/contexts/AuthContext';
import { useInterestState } from '@/hooks/useInterestState';
import { DanceEvent, eventsApiService } from '@/services/eventsApiService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '../ThemedText';

/**
 * 🧪 APPROACH 2: Real-time Interest State Component
 * Uses Firestore real-time listeners for automatic UI synchronization
 */
const InterestButton: React.FC<{ event: DanceEvent; onPress: () => void }> = ({ event, onPress }) => {
  const { isInterested, isLoading } = useInterestState(event.id);
  
  return (
    <TouchableOpacity
      style={[
        styles.interestButton,
        isInterested && styles.interestButtonActive,
        isLoading && styles.interestButtonLoading
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Ionicons 
            name={isInterested ? "heart" : "heart-outline"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.interestButtonText}>
            {isInterested ? "Interested!" : "I'm Interested"}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default function EventsScreenRealtime() {
  const { user } = useAuth();
  const [events, setEvents] = useState<DanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matchingEventId, setMatchingEventId] = useState<number | null>(null);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<{
    partnerName: string;
    eventTitle: string;
    partnerId: string;
    chatId?: string;
  } | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log('🧪 EventsScreenRealtime: Loading events from Dance Events API');
      const fetchedEvents = await eventsApiService.fetchEvents(1, 25);
      console.log('🧪 EventsScreenRealtime: Loaded', fetchedEvents.length, 'events');
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('🧪 EventsScreenRealtime: Error loading events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleMarkInterest = async (event: DanceEvent) => {
    if (!user) {
      Alert.alert('Please log in', 'You need to be logged in to mark interest in events.');
      return;
    }

    try {
      setMatchingEventId(event.id);
      console.log(`🧪 🎯 Marking interest in event: ${event.name} (${event.id})`);

      const result = await eventsApiService.markInterestInEvent(event);

      if (result.success && result.matched && result.partnerName) {
        console.log(`🧪 🎉 Bilateral match found with: ${result.partnerName}`);
        setCurrentMatch({
          partnerName: result.partnerName,
          eventTitle: event.name,
          partnerId: 'unknown'
        });
        setShowMatchNotification(true);
      } else if (result.success) {
        console.log(`🧪 ℹ️ Interest marked, no bilateral match yet`);
        Alert.alert(
          'Interest Marked!',
          `You've shown interest in "${event.name}". We'll notify you when someone else is interested too!`
        );
      } else {
        Alert.alert('Error', 'Failed to mark interest. Please try again.');
      }
    } catch (error) {
      console.error('🧪 ❌ Error marking interest:', error);
      Alert.alert('Error', 'Failed to mark interest. Please try again.');
    } finally {
      setMatchingEventId(null);
    }
  };

  const renderEventItem = ({ item }: { item: DanceEvent }) => (
    <TouchableOpacity style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <ThemedText type="subtitle" style={styles.eventTitle}>
          {item.name}
        </ThemedText>
        <View style={styles.eventMeta}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.eventLocation}>
            {item.location.name || item.location.city}, {item.location.country}
          </Text>
        </View>
      </View>
      
      <View style={styles.eventDetails}>
        <View style={styles.eventInfo}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.eventDate}>
            {new Date(item.startDate).toLocaleDateString()}
            {item.endDate && item.endDate !== item.startDate && 
              ` - ${new Date(item.endDate).toLocaleDateString()}`
            }
          </Text>
        </View>
        
        <View style={styles.eventTags}>
          {Object.values(item.dances).slice(0, 3).map((dance, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{dance}</Text>
            </View>
          ))}
          {Object.values(item.dances).length > 3 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>+{Object.values(item.dances).length - 3}</Text>
            </View>
          )}
        </View>
      </View>
      
      {item.description && (
        <View style={styles.eventDescription}>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      )}

      {/* 🧪 Real-time Interest Button */}
      <InterestButton 
        event={item} 
        onPress={() => handleMarkInterest(item)} 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A1CEDC" />
          <ThemedText>Loading events...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <ThemedText type="title">Dance Events</ThemedText>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.eventsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <ThemedText type="subtitle">No events found</ThemedText>
            <Text style={styles.emptyText}>
              No dance events available at the moment
            </Text>
          </View>
        }
      />

      {/* High-Conversion Match Notification */}
      {currentMatch && (
        <MatchNotification
          visible={showMatchNotification}
          partnerName={currentMatch.partnerName}
          eventTitle={currentMatch.eventTitle}
          onClose={() => setShowMatchNotification(false)}
          onViewProfile={() => {
            setShowMatchNotification(false);
            router.push(`/partnerProfile/${currentMatch.partnerId}`);
          }}
          onStartChat={() => {
            setShowMatchNotification(false);
            router.push('/chat');
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  eventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  eventDescription: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  interestButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  interestButtonLoading: {
    backgroundColor: '#ccc',
  },
  interestButtonActive: {
    backgroundColor: '#4CAF50',
  },
  interestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
