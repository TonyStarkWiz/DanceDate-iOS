import { useAuth } from '@/contexts/AuthContext';
import { eventBasedMatchingService } from '@/services/eventBasedMatchingService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DancePartner {
  id: string;
  name: string;
  imageUrl: string | null;
  eventTitle: string;
  matchTimestamp: number;
  danceStyle: string;
  location: string;
  bio: string;
  interests: string[];
}

export const DancePartnersScreen: React.FC = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState<DancePartner[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const danceStyles = ['All', 'Salsa', 'Bachata', 'Kizomba', 'Ballroom', 'Hip Hop', 'Contemporary'];

  useEffect(() => {
    if (user?.id) {
      loadPartners();
    }
  }, [user?.id]);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      console.log('🧪 DancePartnersScreen: Loading partners for user:', user?.id);
      
      if (!user?.id) {
        console.log('🧪 DancePartnersScreen: No user ID, skipping load');
        return;
      }

      // Get event-based matches from Firestore
      const eventMatches = await eventBasedMatchingService.findEventBasedMatches(user.id, 20);
      console.log('🧪 DancePartnersScreen: Found', eventMatches.length, 'event-based matches');
      
      // Transform Firestore data to DancePartner interface
      const transformedPartners: DancePartner[] = eventMatches.map((match, index) => {
        const sharedEvent = match.sharedEvents[0]; // Get the first shared event
        return {
          id: match.userId,
          name: match.potentialPartner.name || 'Unknown User',
          imageUrl: null,
          eventTitle: sharedEvent?.eventTitle || 'Shared Event Interest',
          matchTimestamp: Date.now() - (index * 3600000), // Simulate different timestamps
          danceStyle: match.commonInterests[0] || 'Dance',
          location: 'Location not available',
          bio: `Matched based on shared interest in ${match.sharedEvents.length} events.`,
          interests: match.commonInterests || [],
        };
      });

      setPartners(transformedPartners);
      console.log('🧪 DancePartnersScreen: Set', transformedPartners.length, 'partners');
      
    } catch (error) {
      console.error('🧪 DancePartnersScreen: Error loading partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPartners();
    setRefreshing(false);
  };

  const handlePartnerPress = (partner: DancePartner) => {
    router.push({
      pathname: '/partnerProfile/[partnerId]',
      params: {
        partnerId: partner.id,
      },
    });
  };

  const handleChatPress = (partnerId: string) => {
    router.push({
      pathname: '/chat/[partnerId]',
      params: {
        partnerId: partnerId,
      },
    });
  };

  const handleFilterChange = (style: string) => {
    setSelectedFilter(style);
    // Filtering will be handled by the component state
    // The actual filtering logic will be applied to the real data
  };

  const handleBrowseEvents = () => {
    router.push('/eventList');
  };

  const formatMatchTime = (timestamp: number) => {
    const now = Date.now();
    const diffInMillis = now - timestamp;
    
    if (diffInMillis < 60000) return 'Just now';
    if (diffInMillis < 3600000) return `${Math.floor(diffInMillis / 60000)}m ago`;
    if (diffInMillis < 86400000) return `${Math.floor(diffInMillis / 3600000)}h ago`;
    if (diffInMillis < 604800000) return `${Math.floor(diffInMillis / 86400000)}d ago`;
    return 'A week ago';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Matches</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Dance Style Filters */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {danceStyles.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.filterChip,
                selectedFilter === style && styles.filterChipActive,
              ]}
              onPress={() => handleFilterChange(style)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === style && styles.filterChipTextActive,
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {isLoading ? (
          // Loading state
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#6A11CB" />
            <Text style={styles.loadingText}>Loading dance partners...</Text>
          </View>
        ) : partners.length === 0 ? (
          // Empty state
          <View style={styles.emptyState}>
            <Ionicons name="heart" size={64} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.emptyStateTitle}>No matches yet</Text>
            <Text style={styles.emptyStateText}>
              Start browsing events to find dance partners!
            </Text>
            
            <TouchableOpacity style={styles.browseButton} onPress={handleBrowseEvents}>
              <Text style={styles.browseButtonText}>Browse Events</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Partners list
          <ScrollView
            style={styles.partnersContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {partners.map((partner) => (
              <TouchableOpacity
                key={partner.id}
                style={styles.partnerCard}
                onPress={() => handlePartnerPress(partner)}
              >
                <View style={styles.partnerHeader}>
                  {/* Partner Profile Image */}
                  <View style={styles.profileImageContainer}>
                    {partner.imageUrl ? (
                      <Image
                        source={{ uri: partner.imageUrl }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View style={styles.profileImagePlaceholder}>
                        <Ionicons name="person" size={30} color="#fff" />
                      </View>
                    )}
                  </View>
                  
                  {/* Partner Info */}
                  <View style={styles.partnerInfo}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <Text style={styles.matchEvent}>
                      Matched on: {partner.eventTitle}
                    </Text>
                    <Text style={styles.matchTime}>
                      {formatMatchTime(partner.matchTimestamp)}
                    </Text>
                  </View>
                  
                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    {/* Chat Button */}
                    <TouchableOpacity
                      style={styles.chatButton}
                      onPress={() => handleChatPress(partner.id)}
                    >
                      <Ionicons name="chatbubble" size={20} color="#fff" />
                    </TouchableOpacity>
                    
                    {/* Profile Button */}
                    <TouchableOpacity
                      style={styles.profileButton}
                      onPress={() => handlePartnerPress(partner)}
                    >
                      <Ionicons name="person" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Partner Bio */}
                <View style={styles.partnerBio}>
                  <Text style={styles.bioText}>{partner.bio}</Text>
                </View>
                
                {/* Partner Interests */}
                <View style={styles.interestsContainer}>
                  <Text style={styles.interestsLabel}>Interests:</Text>
                  <View style={styles.interestsList}>
                    {partner.interests.map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#6A4C93',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3A3A3A',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  filterChipActive: {
    backgroundColor: '#6A4C93',
    borderColor: '#6A4C93',
  },
  filterChipText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  browseButton: {
    backgroundColor: '#6A4C93',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  partnersContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  partnerCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
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
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6A4C93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  matchEvent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionButtons: {
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerBio: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  interestsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 8,
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
  loadingState: {
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


import { BackButton } from '../ui/BackButton';
      <BackButton />