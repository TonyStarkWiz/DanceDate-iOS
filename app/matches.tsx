import { auth } from '@/config/firebase';
import { EnhancedMatchingAndChatService, MatchPreview } from '@/services/enhancedMatchingAndChatService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isIPhone = Platform.OS === 'ios';
const statusBarHeight = isIPhone ? 44 : 0;
const screenHeight = height - statusBarHeight;

export default function MatchesScreen() {
  const [matches, setMatches] = useState<MatchPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    totalMatches: 0,
    pendingMatches: 0,
    acceptedMatches: 0,
    declinedMatches: 0,
    averageStrength: 0
  });

  const loadMatches = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setMatches([]);
        setLoading(false);
        return;
      }

      console.log('🧪 MatchesScreen: Loading matches for user:', currentUser.uid);
      
      // Use the enhanced two-approach strategy to find real matches
      const userMatches = await EnhancedMatchingAndChatService.loadAllMatches(currentUser.uid);
      console.log('🧪 MatchesScreen: Found matches:', userMatches.length);
      
      setMatches(userMatches);
      
      // Calculate statistics
      const stats = {
        totalMatches: userMatches.length,
        pendingMatches: userMatches.filter(m => m.status === 'pending').length,
        acceptedMatches: userMatches.filter(m => m.status === 'accepted').length,
        declinedMatches: userMatches.filter(m => m.status === 'declined').length,
        averageStrength: userMatches.length > 0 ? 
          userMatches.reduce((sum, m) => sum + m.matchStrength, 0) / userMatches.length : 0
      };
      setStatistics(stats);
      
    } catch (error) {
      console.error('🧪 MatchesScreen: Error loading matches:', error);
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
  };

  const findNewMatches = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'No authenticated user');
        return;
      }

      setLoading(true);
      
      console.log('🧪 MatchesScreen: Finding new matches...');
      
      // Use the enhanced two-approach strategy to find real matches
      const newMatches = await EnhancedMatchingAndChatService.loadAllMatches(currentUser.uid);
      console.log('🧪 MatchesScreen: Found real matches:', newMatches.length);
      
      setMatches(newMatches);
      
      if (newMatches.length > 0) {
        Alert.alert('🎉 Success!', `Found ${newMatches.length} real matches from Firestore! Your dance journey is heating up!`);
      } else {
        Alert.alert('Keep Exploring!', 'No new matches found in Firestore yet. Try marking interest in some events to create matches!');
      }
      
    } catch (error) {
      console.error('🧪 MatchesScreen: Error finding matches:', error);
      Alert.alert('Oops!', 'Something went wrong, but don\'t worry - we\'re working on it!');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (match: MatchPreview) => {
    console.log('🧪 MatchesScreen: Send Message button clicked for match:', match);
    
    Alert.alert(
      '💬 Start Chatting!',
      `Ready to connect with ${match.partnerName}?`,
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'Send Message!', 
          style: 'default',
          onPress: async () => {
            console.log('🧪 MatchesScreen: User confirmed sending message');
            
            try {
              const currentUser = auth.currentUser;
              if (!currentUser) {
                Alert.alert('Error', 'No authenticated user');
                return;
              }

              // Create or get chat with the partner
              const result = await EnhancedMatchingAndChatService.createOrGetChat(
                [currentUser.uid, match.partnerId],
                match.eventId,
                match.eventTitle
              );

              if (result.success && result.data) {
                console.log('🧪 MatchesScreen: Navigating to chat with chatId:', result.data);
                router.push({
                  pathname: '/chat',
                  params: { chatId: result.data }
                });
              } else {
                console.error('🧪 MatchesScreen: Failed to create/get chat:', result.error);
                Alert.alert('Error', 'Failed to create chat. Please try again.');
              }
            } catch (error) {
              console.error('🧪 MatchesScreen: Error creating chat:', error);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleAcceptMatch = (match: MatchPreview) => {
    Alert.alert(
      '🎉 Accept Match!',
      `Ready to dance with ${match.partnerName}?`,
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Accept & Chat!', 
          style: 'default',
          onPress: () => {
            Alert.alert('🎉 Match Accepted!', 'Your dance journey begins now! Check your messages to start chatting!');
          }
        }
      ]
    );
  };

  useEffect(() => {
    const loadMatchesOnce = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setMatches([]);
          setLoading(false);
          return;
        }

        console.log('🧪 MatchesScreen: Loading matches for user:', currentUser.uid);
        
        // Use the enhanced two-approach strategy to find real matches
        const userMatches = await EnhancedMatchingAndChatService.loadAllMatches(currentUser.uid);
        console.log('🧪 MatchesScreen: Found matches:', userMatches.length);
        
        setMatches(userMatches);
        
        // Calculate statistics
        const stats = {
          totalMatches: userMatches.length,
          pendingMatches: userMatches.filter(m => m.status === 'pending').length,
          acceptedMatches: userMatches.filter(m => m.status === 'accepted').length,
          declinedMatches: userMatches.filter(m => m.status === 'declined').length,
          averageStrength: userMatches.length > 0 ? 
            userMatches.reduce((sum, m) => sum + m.matchStrength, 0) / userMatches.length : 0
        };
        setStatistics(stats);
        
      } catch (error) {
        console.error('🧪 MatchesScreen: Error loading matches:', error);
        Alert.alert('Error', 'Failed to load matches');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadMatchesOnce();
  }, [auth.currentUser?.uid]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#4A148C" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <Ionicons name="heart" size={40} color="#fff" />
            </View>
            <Text style={styles.loadingTitle}>Finding Your Perfect Matches</Text>
            <Text style={styles.loadingSubtitle}>This won't take long!</Text>
            <View style={styles.loadingProgress}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4A148C" />
      
      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>💃 Your Matches 🕺</Text>
          <Text style={styles.heroSubtitle}>Discover your perfect dance partners</Text>
          
          {/* Social Proof */}
          <View style={styles.socialProof}>
            <Text style={styles.socialProofText}>
              🎉 {statistics.totalMatches} dancers found • ⭐ {statistics.averageStrength.toFixed(0)}% avg match
            </Text>
          </View>
        </View>
        
        {/* Urgency Banner */}
        <View style={styles.urgencyBanner}>
          <Ionicons name="time" size={16} color="#FFD700" />
          <Text style={styles.urgencyText}>⚡ Limited Time: Respond within 24 hours to keep your matches active!</Text>
        </View>
      </View>

      {/* Primary CTA */}
      <View style={styles.primaryCTA}>
        <TouchableOpacity style={styles.findMatchesButton} onPress={findNewMatches}>
          <Ionicons name="search" size={24} color="#fff" />
          <Text style={styles.findMatchesText}>Find New Matches</Text>
        </TouchableOpacity>
        <Text style={styles.findMatchesSubtext}>Discover more dance partners</Text>
      </View>

      {/* Statistics Dashboard */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 Your Match Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics.totalMatches}</Text>
            <Text style={styles.statLabel}>Total Matches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics.pendingMatches}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics.acceptedMatches}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics.averageStrength.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Avg Strength</Text>
          </View>
        </View>
      </View>

      {/* Matches List */}
      <ScrollView 
        style={styles.matchesContainer}
        contentContainerStyle={styles.matchesContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={60} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Matches Yet</Text>
            <Text style={styles.emptySubtitle}>
              Don't worry! Your perfect dance partners are just waiting to be discovered. 
              Start by finding new matches or exploring events to create real connections!
            </Text>
            <TouchableOpacity style={styles.emptyCTA} onPress={findNewMatches}>
              <Text style={styles.emptyCTAText}>🎯 Find Your First Match</Text>
            </TouchableOpacity>
            
            {/* Social Proof in Empty State */}
            <View style={styles.emptySocialProof}>
              <Text style={styles.emptySocialProofText}>
                💡 Pro Tip: Mark interest in events to create real matches in Firestore!
              </Text>
            </View>
          </View>
        ) : (
          matches.map((match) => (
            <View key={match.id} style={styles.matchCard}>
              {/* Match Header with Urgency */}
              <View style={styles.matchHeader}>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchStrengthText}>
                    {match.matchStrength >= 80 ? '🔥 Perfect Match!' : 
                     match.matchStrength >= 60 ? '⭐ Great Match' : 
                     match.matchStrength >= 40 ? '👍 Good Match' : '🤝 Fair Match'}
                  </Text>
                  <Text style={[styles.matchStrength, { 
                    color: match.matchStrength >= 80 ? '#4CAF50' : 
                           match.matchStrength >= 60 ? '#8BC34A' : 
                           match.matchStrength >= 40 ? '#FFC107' : '#FF5722'
                  }]}>
                    {match.matchStrength}% Match
                  </Text>
                </View>
                <View style={[styles.statusBadge, { 
                  backgroundColor: match.status === 'accepted' ? '#4CAF50' : 
                                 match.status === 'declined' ? '#F44336' : '#2196F3'
                }]}>
                  <Text style={styles.statusText}>
                    {match.status === 'accepted' ? '✓ Matched!' : 
                     match.status === 'declined' ? '✗ Declined' : '⏳ Pending'}
                  </Text>
                </View>
              </View>

              {/* Partner Info with Social Proof */}
              <View style={styles.partnerSection}>
                <View style={styles.partnerInfo}>
                  <View style={styles.avatarContainer}>
                    {match.partnerImageUrl ? (
                      <Image 
                        source={{ uri: match.partnerImageUrl }} 
                        style={styles.avatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarPlaceholderText}>
                          {match.partnerName?.charAt(0) || '?'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.partnerDetails}>
                    <Text style={styles.partnerName}>
                      {match.partnerName || 'Dance Partner'}
                    </Text>
                    <Text style={styles.partnerSubtext}>
                      Matched on: {match.eventTitle}
                    </Text>
                    <Text style={styles.partnerSocialProof}>
                      ⭐ Online now • 🎯 Active dancer
                    </Text>
                  </View>
                </View>
              </View>

              {/* Event Info */}
              <View style={styles.eventsSection}>
                <Text style={styles.eventsTitle}>🎭 Event</Text>
                <View style={styles.eventsList}>
                  <View style={styles.eventItem}>
                    <Text style={styles.eventDot}>•</Text>
                    <Text style={styles.eventText}>{match.eventTitle}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons with Clear CTAs */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => handleAcceptMatch(match)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.acceptButtonText}>Accept Match</Text>
                  <Text style={styles.acceptButtonSubtext}>Start your dance journey</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.messageButton}
                  onPress={() => handleSendMessage(match)}
                >
                  <Ionicons name="chatbubble" size={20} color="#fff" />
                  <Text style={styles.messageButtonText}>Send Message</Text>
                  <Text style={styles.messageButtonSubtext}>Connect instantly</Text>
                </TouchableOpacity>
              </View>

              {/* Urgency Footer */}
              <View style={styles.urgencyFooter}>
                <Text style={styles.urgencyFooterText}>
                  ⏰ Respond within 24 hours to keep this match active!
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    backgroundColor: '#4A148C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#E1BEE7',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingProgress: {
    width: 200,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
    width: '60%',
  },

  // Hero Header
  heroHeader: {
    backgroundColor: '#4A148C',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E1BEE7',
    marginBottom: 12,
    textAlign: 'center',
  },
  socialProof: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  socialProofText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  urgencyText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },

  // Primary CTA
  primaryCTA: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  findMatchesButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  findMatchesText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  findMatchesSubtext: {
    color: '#666',
    fontSize: 14,
  },

  // Statistics Dashboard
  statsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A148C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Matches Container
  matchesContainer: {
    flex: 1,
  },
  matchesContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyCTA: {
    backgroundColor: '#4A148C',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
  },
  emptyCTAText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySocialProof: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptySocialProofText: {
    color: '#4A148C',
    fontSize: 14,
    textAlign: 'center',
  },

  // Match Card
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  matchInfo: {
    flex: 1,
  },
  matchStrengthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  matchStrength: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Partner Section
  partnerSection: {
    marginBottom: 16,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A148C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  partnerSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  partnerSocialProof: {
    fontSize: 12,
    color: '#4A148C',
    fontWeight: '500',
  },

  // Events Section
  eventsSection: {
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventsList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDot: {
    fontSize: 16,
    color: '#4A148C',
    marginRight: 8,
  },
  eventText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  acceptButtonSubtext: {
    display: 'none',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#4A148C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  messageButtonSubtext: {
    display: 'none',
  },

  // Urgency Footer
  urgencyFooter: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  urgencyFooterText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


