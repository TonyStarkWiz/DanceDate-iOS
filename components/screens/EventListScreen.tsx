import { BackButton } from '@/components/ui/BackButton';
import { EventMatchModal } from '@/components/ui/EventMatchModal';
import { NextStepsGuide } from '@/components/ui/NextStepsGuide';
import { PremiumUpgradePopup } from '@/components/ui/PremiumUpgradePopup';
import { useAuth } from '@/contexts/AuthContext';
import { useDeadEndPrevention } from '@/hooks/useDeadEndPrevention';
import { aiAgentRepository } from '@/services/aiAgentRepository';
import { DisplayableEvent } from '@/services/danceEventsApi';
import { EventMatchSuggestion } from '@/services/eventBasedMatchingService';
import { eventInterestService } from '@/services/eventInterestService';
import { usageTracker } from '@/services/googleCustomSearchService';
import { LocationData, locationService, PostalCodeValidator } from '@/services/locationService';
import { matchDetectionService } from '@/services/matchDetectionService';
import { premiumUpgradeManager } from '@/services/premiumUpgradeManager';
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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export const EventListScreen: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<DisplayableEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  
  // Premium status
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(true);
  
  // Match modal state
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<EventMatchSuggestion | null>(null);
  const [checkingForMatches, setCheckingForMatches] = useState(false);
  
  // Track user interests
  const [userInterests, setUserInterests] = useState<Set<string>>(new Set());
  const [loadingInterests, setLoadingInterests] = useState(false);

  // Postal code search
  const [postalCode, setPostalCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [postalCodeValid, setPostalCodeValid] = useState(false);
  const [showPostalCodeInput, setShowPostalCodeInput] = useState(false);

  // Usage tracking
  const [usageStats, setUsageStats] = useState({
    todayUsage: 0,
    isPremium: false,
    canSearch: true
  });

  // Dead End Prevention
  const deadEndPrevention = useDeadEndPrevention({
    currentScreen: 'eventList',
    userInterests: Array.from(userInterests),
    isPremium,
    inactivityThreshold: 180000, // 3 minutes
    enableAutoSuggestions: true
  });

  // Premium Upgrade Popup State
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [premiumTriggerType, setPremiumTriggerType] = useState<string>('');
  const [premiumCountdown, setPremiumCountdown] = useState(300);

  useEffect(() => {
    if (user?.id) {
      loadEvents();
      loadUserInterests();
      checkPremiumStatus();
      loadUsageStats();
    } else {
      // If no user, still load sample events
      loadEvents();
    }
  }, [user?.id]);

  // Check for premium upgrade popup triggers
  useEffect(() => {
    if (user?.id && !isPremium) {
      const checkUpgrade = () => {
        const lastActive = user?.lastActive ? new Date(user.lastActive).getTime() : Date.now();
        const timeOnSite = Math.floor((Date.now() - lastActive) / 1000); // Convert to seconds
        
        const upgradeCheck = premiumUpgradeManager.shouldShowUpgrade(
          user.id,
          isPremium,
          usageStats.todayUsage,
          timeOnSite,
          1 // page views
        );

        if (upgradeCheck.shouldShow) {
          console.log('🧪 Premium popup should show:', upgradeCheck);
          setPremiumTriggerType(upgradeCheck.triggerType);
          setPremiumCountdown(upgradeCheck.countdownSeconds);
          setShowPremiumPopup(true);
          premiumUpgradeManager.recordPopupShown(user.id, upgradeCheck.triggerType);
        }
      };

      // Check after a delay to ensure user is engaged
      const timeout = setTimeout(checkUpgrade, 5000); // 5 seconds delay
      return () => clearTimeout(timeout);
    }
  }, [user?.id, isPremium, usageStats.todayUsage]);

  // Validate postal code when it changes
  useEffect(() => {
    if (postalCode) {
      const validation = PostalCodeValidator.validatePostalCode(postalCode, selectedCountry);
      setPostalCodeValid(validation.isValid);
    } else {
      setPostalCodeValid(false);
    }
  }, [postalCode, selectedCountry]);

  const loadEvents = async (useUserLocation: boolean = false, postalCodeData?: { code: string; country: string }) => {
    try {
      setLoading(true);
      
      let location: LocationData | undefined;
      
      if (useUserLocation && userLocation) {
        location = userLocation;
      } else if (postalCodeData && postalCodeData.code) {
        // Use postal code location
        location = {
          latitude: 27.6648, // Would be geocoded in real implementation
          longitude: -81.5158,
          locationName: `${postalCodeData.code}, ${postalCodeData.country}`,
          country: postalCodeData.country
        };
      }
      
      // Check usage limits
      if (user?.id) {
        const canSearch = await usageTracker.canPerformSearch(user.id, 'events');
        if (!canSearch) {
          Alert.alert(
            'Search Limit Reached',
            'You have reached your daily search limit. Upgrade to premium for unlimited searches.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Upgrade', onPress: () => router.push('/premiumUpgrade') }
            ]
          );
          return;
        }
      }
      
      // Use AI Agent Repository for event discovery
      const discoveryResult = await aiAgentRepository.discoverHighConversionEvents({
        location,
        screen: 'events',
        maxResults: 20,
        useGoogleSearch: true
      });
      
      setEvents(discoveryResult.events);
      
      // Track usage if user is logged in
      if (user?.id) {
        await usageTracker.trackSearchUsage(user.id, 'events');
        loadUsageStats(); // Refresh usage stats
      }
      
    } catch (error) {
      console.error('Error loading events:', error);
      
      // Always show sample events as fallback
      const sampleResult = await aiAgentRepository.getSampleEvents('events');
      setEvents(sampleResult.events);
      
      Alert.alert('Info', 'Showing sample events. Real events will load when available.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserInterests = async () => {
    try {
      setLoadingInterests(true);
      
      if (!user?.id) {
        return;
      }

      const interests = await eventInterestService.getUserInterestedEvents(user.id);
      const interestIds = new Set(interests.map(interest => interest.eventId));
      
      setUserInterests(interestIds);
      
    } catch (error) {
      console.error('Error loading user interests:', error);
      // Fallback: set empty interests if there's an error
      setUserInterests(new Set());
    } finally {
      setLoadingInterests(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      setPremiumLoading(true);
      console.log('🧪 EventListScreen: Checking premium status...');
      
      if (!user?.id) {
        console.log('🧪 EventListScreen: No user ID, skipping premium check');
        return;
      }

      // Check localStorage for premium status (in real app, this would be Firestore)
      const premiumKey = `premium_${user.id}`;
      const isPremium = localStorage.getItem(premiumKey) === 'true';
      setIsPremium(isPremium);
      console.log('🧪 EventListScreen: Premium status:', isPremium);
      
    } catch (error) {
      console.error('🧪 EventListScreen: Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setPremiumLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      if (!user?.id) return;
      
      const stats = await usageTracker.getUsageStats(user.id, 'events');
      setUsageStats(stats);
      console.log('🧪 EventListScreen: Usage stats:', stats);
      
    } catch (error) {
      console.error('🧪 EventListScreen: Error loading usage stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents(useLocation);
    await loadUserInterests();
      setRefreshing(false);
  };

  const handleUseLocation = async () => {
    try {
      console.log('🧪 EventListScreen: Requesting GPS location...');
      
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      setUseLocation(true);
      setShowPostalCodeInput(false);
      
      Alert.alert(
        'Location Set',
        `Using location: ${location.locationName || `${location.latitude}, ${location.longitude}`}`,
        [{ text: 'OK' }]
      );
      
      await loadEvents(true);
    } catch (error) {
      console.error('🧪 EventListScreen: Error getting location:', error);
      Alert.alert('Location Error', 'Failed to get your location. Please try again or use postal code search.');
    }
  };

  const handlePostalCodeSearch = async () => {
    if (!postalCodeValid) {
      Alert.alert('Invalid Postal Code', 'Please enter a valid postal code for the selected country.');
      return;
    }
    
    await loadEvents(false, { code: postalCode, country: selectedCountry });
    setShowPostalCodeInput(false);
  };

  const handleEventPress = (event: DisplayableEvent) => {
    console.log('🧪 EventListScreen: Event pressed:', event.title);
    
    Alert.alert(
      event.title,
      `${event.description || 'No description available'}\n\nInstructor: ${event.instructor}\nLocation: ${event.location}\nSource: ${event.source}`,
      [
        {
          text: 'View Details',
          onPress: () => {
            // Navigate to event detail screen
            router.push(`/eventDetail/${event.title}/${event.instructor}/${event.location}`);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleInterestPress = async (event: DisplayableEvent) => {
    try {
      console.log('🧪 EventListScreen: User interested in event:', event.title);
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to show interest in events.');
        return;
      }
      
      // Save user interest to Firestore
      await eventInterestService.saveEventInterest(user.id, event);
      
      // Update local state to reflect the interest
      setUserInterests(prev => {
        const newSet = new Set([...prev, event.id]);
        console.log('🧪 EventListScreen: Updated userInterests set:', Array.from(newSet));
        return newSet;
      });
      
      // Check for matches after saving interest
      setCheckingForMatches(true);
      try {
        const matchResult = await matchDetectionService.checkForMatchesImmediately(user.id, event);
        
        if (matchResult.newMatches.length > 0) {
          console.log('🧪 EventListScreen: Found new matches!', matchResult.newMatches.length);
          
          // Show the first new match in the modal
          setCurrentMatch(matchResult.newMatches[0]);
          setShowMatchModal(true);
        } else {
          // Show success message if no matches
          Alert.alert(
            'Interest Recorded! 🎉',
            `You've shown interest in "${event.title}". We'll keep you updated about this event!`,
            [
              { text: 'OK', style: 'default' }
            ]
          );
        }
      } catch (matchError) {
        console.error('🧪 EventListScreen: Error checking for matches:', matchError);
        // Still show success message even if match check fails
        Alert.alert(
          'Interest Recorded! 🎉',
          `You've shown interest in "${event.title}". We'll keep you updated about this event!`,
          [
            { text: 'OK', style: 'default' }
          ]
        );
      } finally {
        setCheckingForMatches(false);
      }
      
    } catch (error) {
      console.error('🧪 EventListScreen: Error recording interest:', error);
      
      // Show specific error message based on error type
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('permissions')) {
        Alert.alert(
          'Permission Error', 
          'Unable to save your interest due to permission issues. Please try logging out and back in.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to record your interest. Please try again.');
      }
      
      setCheckingForMatches(false);
    }
  };

  // Modal handlers
  const handleCloseModal = () => {
    setShowMatchModal(false);
    setCurrentMatch(null);
  };

  const handleViewProfile = (userId: string) => {
    console.log('🧪 EventListScreen: Viewing profile for user:', userId);
    router.push(`/partnerProfile/${userId}`);
  };

  const handleStartChat = (userId: string) => {
    console.log('🧪 EventListScreen: Starting chat with user:', userId);
    router.push('/chat');
  };

  const handleDismissMatch = () => {
    // Could add logic here to mark this match as dismissed
  };

  const renderEventItem = ({ item: event }: { item: DisplayableEvent }) => {
    const isInterested = userInterests.has(event.id);
    
    return (
      <TouchableOpacity
        style={styles.eventItem}
        onPress={() => handleEventPress(event)}
        activeOpacity={0.7}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>{event.source}</Text>
          </View>
        </View>
        
        <Text style={styles.eventInstructor}>by {event.instructor}</Text>
        <Text style={styles.eventLocation}>📍 {event.location}</Text>
        
        {event.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
        )}
        
        {event.tags && event.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {event.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.eventFooter}>
          <Text style={styles.eventDate}>
            {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date TBD'}
          </Text>
          <View style={styles.eventActions}>
            <TouchableOpacity 
              style={[styles.interestButton, checkingForMatches && styles.interestButtonDisabled]}
              onPress={(e) => {
                e.stopPropagation();
                handleInterestPress(event);
              }}
              disabled={checkingForMatches}
            >
              {checkingForMatches ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons 
                  name={userInterests.has(event.id) ? "heart" : "heart-outline"} 
                  size={16} 
                  color="#fff" 
                />
              )}
              <Text style={styles.interestButtonText}>
                {checkingForMatches ? 'Checking...' : (userInterests.has(event.id) ? 'Interested' : 'I\'m Interested')}
              </Text>
            </TouchableOpacity>
            {event.url && (
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={(e) => {
                  e.stopPropagation();
                  // Handle external link
                  Alert.alert('External Link', 'This would open the event website in a browser.');
                }}
              >
                <Ionicons name="link-outline" size={16} color="#6A11CB" />
                <Text style={styles.linkText}>View Event</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color="#6A11CB" />
      <Text style={styles.emptyTitle}>No Events Found</Text>
      <Text style={styles.emptySubtitle}>
        {useLocation 
          ? 'No dance events found in your area. Try expanding your search radius or check back later.'
          : 'No dance events available at the moment. The AI search might be temporarily unavailable.'
        }
      </Text>
      {!useLocation && !showPostalCodeInput && (
        <TouchableOpacity style={styles.locationButton} onPress={handleUseLocation}>
          <Ionicons name="location-outline" size={20} color="#fff" />
          <Text style={styles.locationButtonText}>Use My Location</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.refreshButton} onPress={async () => {
        try {
          setLoading(true);
          await loadEvents(useLocation);
          console.log('🧪 EventListScreen: Refreshed events');
        } catch (error) {
          console.error('🧪 EventListScreen: Error refreshing:', error);
          Alert.alert('Error', 'Failed to refresh events');
        } finally {
          setLoading(false);
        }
      }}>
        <Ionicons name="refresh-outline" size={20} color="#fff" />
        <Text style={styles.refreshButtonText}>Refresh Events</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Finding dance events with AI...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dance Events</Text>
        <Text style={styles.subtitle}>
          {events.length} event{events.length !== 1 ? 's' : ''} found
          {useLocation && userLocation ? ' near you' : ''}
        </Text>
        
        {/* Premium Status */}
        {!premiumLoading && (
          <View style={styles.premiumStatus}>
            <Ionicons 
              name={isPremium ? "diamond" : "diamond-outline"} 
              size={16} 
              color={isPremium ? "#FFD700" : "#999"} 
            />
            <Text style={[styles.premiumText, isPremium && styles.premiumTextActive]}>
              {isPremium ? 'Premium Search' : 'Free Search'}
            </Text>
            {isPremium && (
              <Text style={styles.premiumSubtext}>
                Powered by Google Custom Search
              </Text>
            )}
          </View>
        )}

        {/* Usage Stats */}
        {user?.id && (
          <View style={styles.usageStats}>
            <Text style={styles.usageText}>
              Searches today: {usageStats.todayUsage}/5
            </Text>
            {!usageStats.canSearch && (
              <Text style={styles.usageWarning}>
                Daily limit reached. Upgrade for unlimited searches.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, useLocation && styles.actionButtonActive]}
          onPress={handleUseLocation}
        >
          <Ionicons name="location-outline" size={20} color={useLocation ? '#fff' : '#6A11CB'} />
          <Text style={[styles.actionButtonText, useLocation && styles.actionButtonTextActive]}>
            {useLocation ? 'Using GPS' : 'Use GPS'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, showPostalCodeInput && styles.actionButtonActive]}
          onPress={() => setShowPostalCodeInput(!showPostalCodeInput)}
        >
          <Ionicons name="search-outline" size={20} color={showPostalCodeInput ? '#fff' : '#6A11CB'} />
          <Text style={[styles.actionButtonText, showPostalCodeInput && styles.actionButtonTextActive]}>
            {showPostalCodeInput ? 'Postal Code' : 'Postal Code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => loadEvents(false)}
        >
          <Ionicons name="refresh-outline" size={20} color="#6A11CB" />
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, deadEndPrevention.isUserStuck && styles.actionButtonUrgent]}
          onPress={deadEndPrevention.forceSuggestNextAction}
        >
          <Ionicons name="compass" size={20} color={deadEndPrevention.isUserStuck ? "#FF6B6B" : "#6A11CB"} />
          <Text style={[styles.actionButtonText, deadEndPrevention.isUserStuck && styles.actionButtonTextUrgent]}>
            {deadEndPrevention.isUserStuck ? 'Help!' : 'Guide'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPremium]}
          onPress={() => {
            setPremiumTriggerType('promotional');
            setPremiumCountdown(300);
            setShowPremiumPopup(true);
            if (user?.id) {
              premiumUpgradeManager.recordPopupShown(user.id, 'promotional');
            }
          }}
        >
          <Ionicons name="diamond" size={20} color="#FFD700" />
          <Text style={[styles.actionButtonText, styles.actionButtonTextPremium]}>
            Upgrade
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, isPremium && styles.premiumButtonActive]}
          onPress={() => router.push('/premiumUpgrade')}
        >
          <Ionicons 
            name={isPremium ? "diamond" : "diamond-outline"} 
            size={20} 
            color={isPremium ? "#FFD700" : "#6A11CB"} 
          />
          <Text style={[styles.actionButtonText, isPremium && styles.premiumButtonTextActive]}>
            {isPremium ? 'Premium' : 'Upgrade'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Postal Code Input */}
      {showPostalCodeInput && (
        <View style={styles.postalCodeContainer}>
          <View style={styles.postalCodeRow}>
          <TextInput
              style={[styles.postalCodeInput, postalCodeValid && styles.postalCodeInputValid]}
              placeholder="Enter postal code"
              value={postalCode}
              onChangeText={setPostalCode}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.countryButton, selectedCountry === 'US' && styles.countryButtonActive]}
              onPress={() => setSelectedCountry('US')}
            >
              <Text style={[styles.countryButtonText, selectedCountry === 'US' && styles.countryButtonTextActive]}>
                US
              </Text>
            </TouchableOpacity>
              <TouchableOpacity
              style={[styles.countryButton, selectedCountry === 'UK' && styles.countryButtonActive]}
              onPress={() => setSelectedCountry('UK')}
              >
              <Text style={[styles.countryButtonText, selectedCountry === 'UK' && styles.countryButtonTextActive]}>
                UK
              </Text>
              </TouchableOpacity>
              </View>
          {postalCode && (
            <Text style={[styles.validationText, postalCodeValid ? styles.validationTextValid : styles.validationTextInvalid]}>
              {PostalCodeValidator.validatePostalCode(postalCode, selectedCountry).message}
            </Text>
          )}
              <TouchableOpacity
            style={[styles.searchButton, !postalCodeValid && styles.searchButtonDisabled]}
            onPress={handlePostalCodeSearch}
            disabled={!postalCodeValid}
              >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchButtonText}>Search by Code</Text>
              </TouchableOpacity>
        </View>
      )}

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEventItem}
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

      {/* Next Steps Guide - Prevents Dead Ends */}
      <NextStepsGuide
        currentScreen="eventList"
        userInterests={Array.from(userInterests)}
        isPremium={isPremium}
        showTitle={true}
        maxSuggestions={3}
      />
      
      {/* Match Modal */}
      <EventMatchModal
        visible={showMatchModal}
        match={currentMatch}
        onClose={handleCloseModal}
        onViewProfile={handleViewProfile}
        onStartChat={handleStartChat}
        onDismiss={handleDismissMatch}
      />

      {/* Premium Upgrade Popup */}
      <PremiumUpgradePopup
        visible={showPremiumPopup}
        onClose={() => {
          setShowPremiumPopup(false);
          if (user?.id && premiumTriggerType) {
            premiumUpgradeManager.recordPopupDismissed(user.id, premiumTriggerType);
          }
        }}
        onSuccess={() => {
          setShowPremiumPopup(false);
          if (user?.id && premiumTriggerType) {
            premiumUpgradeManager.recordConversion(user.id, premiumTriggerType);
          }
          // Refresh premium status
          checkPremiumStatus();
          // Reload events to show premium features
          loadEvents();
        }}
        triggerType={premiumTriggerType as any}
        countdownSeconds={premiumCountdown}
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonActive: {
    backgroundColor: '#6A11CB',
    borderColor: '#6A11CB',
  },
  actionButtonText: {
    color: '#6A11CB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
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
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 15,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  sourceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sourceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventInstructor: {
    fontSize: 14,
    color: '#6A11CB',
    fontWeight: '600',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  interestButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  premiumStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
  },
  premiumText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  premiumTextActive: {
    color: '#FFD700',
  },
  premiumSubtext: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  premiumButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  premiumButtonTextActive: {
    color: '#FFD700',
  },
  interestButtonDisabled: {
    opacity: 0.6,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#6A11CB',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  usageStats: {
    alignItems: 'center',
    marginTop: 8,
  },
  usageText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  usageWarning: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  postalCodeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
  },
  postalCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postalCodeInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
  postalCodeInputValid: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  countryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
  },
  countryButtonActive: {
    backgroundColor: '#6A11CB',
  },
  countryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  countryButtonTextActive: {
    color: '#fff',
  },
  validationText: {
    fontSize: 12,
    marginBottom: 10,
  },
  validationTextValid: {
    color: '#4CAF50',
  },
  validationTextInvalid: {
    color: '#FF6B6B',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A11CB',
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonUrgent: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  actionButtonTextUrgent: {
    color: '#fff',
  },
  actionButtonPremium: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
  },
  actionButtonTextPremium: {
    color: '#FFD700',
  },
});
