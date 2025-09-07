import { CountryDropdown } from '@/components/ui/CountryDropdown';
import { IntentSelectionBottomSheet, IntentType } from '@/components/ui/IntentSelectionBottomSheet';
import { useAuth } from '@/contexts/AuthContext';
import { FormalBallEvent, FormalBallSearchOptions, formalBallSearchService } from '@/services/formalBallSearchService';
import { intentBasedMatchingService } from '@/services/intentBasedMatchingService';
import { LocationData, locationService, PostalCodeValidator } from '@/services/locationService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export const BallScreen: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [postalCode, setPostalCode] = useState('');
  const [isPostalCodeValid, setIsPostalCodeValid] = useState(false);
  const [showFormalBallEvents, setShowFormalBallEvents] = useState(false);
  const [formalBallEvents, setFormalBallEvents] = useState<FormalBallEvent[]>([]);
  const [isSearchingEvents, setIsSearchingEvents] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const [specializedRemainingSearches, setSpecializedRemainingSearches] = useState(3);
  const [showSpecializedPaywall, setShowSpecializedPaywall] = useState(false);
  
  // Interest tracking
  const [userInterests, setUserInterests] = useState<Set<string>>(new Set());
  const [loadingInterests, setLoadingInterests] = useState<Set<string>>(new Set());
  
  // Intent-based matching
  const [showIntentBottomSheet, setShowIntentBottomSheet] = useState(false);
  const [selectedEventForIntent, setSelectedEventForIntent] = useState<FormalBallEvent | null>(null);

  useEffect(() => {
    // Initialize screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    if (user?.id) {
      loadUserInterests();
    }
    
    return () => clearTimeout(timer);
  }, [user?.id]);

  // Load user's event interests from Firestore
  const loadUserInterests = async () => {
    try {
      if (!user?.id) {
        console.log('🧪 BallScreen: No user ID, skipping interest load');
        return;
      }
      
      console.log('🧪 BallScreen: Loading user interests from Firestore...');
      
      // Import Firebase modules
      const { db } = await import('@/config/firebase');
      const { collection, query, getDocs } = await import('firebase/firestore');
      const { toDocId } = await import('@/config/firebase');
      
      // Query the users/{userId}/interested_events subcollection
      const interestsRef = collection(db, 'users', user.id, 'interested_events');
      const interestsSnapshot = await getDocs(interestsRef);
      
      const interestIds = new Set<string>();
      interestsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.eventId) {
          // Use the raw eventId as stored in Firestore (not decoded)
          interestIds.add(data.eventId);
        }
      });
      
      console.log('🧪 BallScreen: Loaded', interestIds.size, 'user interests from Firestore');
      console.log('🧪 BallScreen: Interest IDs:', Array.from(interestIds));
      
      setUserInterests(interestIds);
      
      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`userInterests_${user.id}`, JSON.stringify(Array.from(interestIds)));
          console.log('🧪 BallScreen: Saved interests to localStorage as backup');
        } catch (storageError) {
          console.warn('🧪 BallScreen: Error saving to localStorage:', storageError);
        }
      }
      
    } catch (error) {
      console.error('🧪 BallScreen: Error loading user interests from Firestore:', error);
      
      // Fallback: try to load from localStorage
      if (typeof window !== 'undefined' && user?.id) {
        try {
          const cachedInterests = localStorage.getItem(`userInterests_${user.id}`);
          if (cachedInterests) {
            const interestIds = new Set<string>(JSON.parse(cachedInterests));
            setUserInterests(interestIds);
            console.log('🧪 BallScreen: Loaded interests from localStorage fallback');
          }
        } catch (fallbackError) {
          console.warn('🧪 BallScreen: Fallback localStorage load failed:', fallbackError);
        }
      }
    }
  };

  // Validate postal code when it changes
  useEffect(() => {
    if (postalCode) {
      const validation = PostalCodeValidator.validatePostalCode(postalCode, selectedCountry);
      setIsPostalCodeValid(validation.isValid);
    } else {
      setIsPostalCodeValid(false);
    }
  }, [postalCode, selectedCountry]);

  const handleUseMyLocation = async () => {
    try {
      console.log('🧪 BallScreen: Requesting GPS location...');
      setIsSearchingEvents(true);
      
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      setUseLocation(true);
      
      Alert.alert(
        'Location Set',
        `Using location: ${location.locationName || `${location.latitude}, ${location.longitude}`}`,
        [{ text: 'OK' }]
      );
      
      // Search for formal ball events using location
      await searchFormalBallEvents({ location });
      
    } catch (error) {
      console.error('🧪 BallScreen: Error getting location:', error);
      Alert.alert('Location Error', 'Failed to get your location. Please try again or use postal code search.');
      setIsSearchingEvents(false);
    }
  };

  const handleSearchByCode = async () => {
    if (selectedCountry && postalCode && isPostalCodeValid) {
      setIsSearchingEvents(true);
      
      try {
        // Search for formal ball events using postal code
        await searchFormalBallEvents({ 
          postalCode, 
          country: selectedCountry 
        });
      } catch (error) {
        console.error('🧪 BallScreen: Error searching by postal code:', error);
        Alert.alert('Search Error', 'Failed to search for formal ball events. Please try again.');
        setIsSearchingEvents(false);
      }
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid postal code and select a country.');
    }
  };

  // Main search function for formal ball events
  const searchFormalBallEvents = async (options: FormalBallSearchOptions) => {
    try {
      console.log('🧪 BallScreen: Searching for formal ball events with options:', options);
      
      const events = await formalBallSearchService.searchFormalBallEvents({
        ...options,
        maxResults: 15
      });
      
      setFormalBallEvents(events);
      setShowFormalBallEvents(true);
      setIsSearchingEvents(false);
      
      if (events.length === 0) {
        Alert.alert(
          'No Events Found', 
          'No formal ball events found in your area. Try expanding your search or checking back later.'
        );
      } else {
        Alert.alert('Search Complete', `Found ${events.length} formal ball events in your area!`);
      }
      
    } catch (error) {
      console.error('🧪 BallScreen: Error searching for formal ball events:', error);
      Alert.alert('Search Error', 'Failed to search for formal ball events. Please try again.');
      setIsSearchingEvents(false);
    }
  };

  const handleSpecializedSearch = async (searchType: string) => {
    if (specializedRemainingSearches > 0) {
      setSpecializedRemainingSearches(prev => prev - 1);
      setIsSearchingEvents(true);
      
      try {
        // Map search types to event types
        const eventTypeMap: { [key: string]: string[] } = {
          'Charity Ball': ['charity'],
          'Masquerade Ball': ['masquerade'],
          'Waltz Ball': ['waltz', 'viennese']
        };
        
        const eventTypes = eventTypeMap[searchType] || [];
        
        // Use current location or postal code
        const searchOptions: FormalBallSearchOptions = useLocation && userLocation 
          ? { location: userLocation, eventTypes }
          : { postalCode, country: selectedCountry, eventTypes };
        
        await searchFormalBallEvents(searchOptions);
        
      } catch (error) {
        console.error('🧪 BallScreen: Error in specialized search:', error);
        Alert.alert('Search Error', 'Failed to perform specialized search. Please try again.');
        setIsSearchingEvents(false);
      }
    } else {
      setShowSpecializedPaywall(true);
    }
  };

  const handleRefreshEvents = async () => {
    setIsSearchingEvents(true);
    
    try {
      // Refresh with current search parameters
      const searchOptions: FormalBallSearchOptions = useLocation && userLocation 
        ? { location: userLocation }
        : { postalCode, country: selectedCountry };
      
      await searchFormalBallEvents(searchOptions);
      
    } catch (error) {
      console.error('🧪 BallScreen: Error refreshing events:', error);
      Alert.alert('Refresh Error', 'Failed to refresh events. Please try again.');
      setIsSearchingEvents(false);
    }
  };

  const handleEventPress = (event: FormalBallEvent) => {
    // Navigate to event detail or open external link
    if (event.link) {
      // For now, show alert with event details
      Alert.alert(
        event.title,
        `${event.description}\n\nLocation: ${event.location}\nDate: ${event.date || 'TBD'}\nTime: ${event.time || 'TBD'}\nPrice: ${event.price || 'Contact for pricing'}\n\nDance Styles: ${event.danceStyles.join(', ')}`,
        [
          { text: 'Close', style: 'cancel' },
          { text: 'View Details', onPress: () => {
            // In a real app, you might open the external link or navigate to a detail screen
            console.log('🧪 BallScreen: Opening event link:', event.link);
          }}
        ]
      );
    } else {
      // Navigate to a generic event detail screen
      router.push('/eventList' as any);
    }
  };

  const handleUpgradeToPremium = () => {
    router.push('/(tabs)/premium' as any);
  };

  const handleUpgradeSpecialized = (tier: string) => {
    setShowSpecializedPaywall(false);
    Alert.alert('Upgrade Complete', `You've been upgraded to ${tier}!`);
  };

  // Handle "I'm Interested" button press for ball events
  const handleInterestPress = async (event: FormalBallEvent) => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to show interest in ball events.');
        return;
      }

      console.log('🧪 BallScreen: User interested in ball event:', event.title);
      
      // Show intent selection bottom sheet
      setSelectedEventForIntent(event);
      setShowIntentBottomSheet(true);
      
    } catch (error) {
      console.error('🧪 BallScreen: Error showing intent selection:', error);
      Alert.alert('Error', 'Failed to show intent selection. Please try again.');
    }
  };

  // Handle intent selection from bottom sheet
  const handleIntentSelected = async (intent: IntentType) => {
    try {
      if (!user || !selectedEventForIntent) {
        console.error('🧪 BallScreen: No user or selected event for intent');
        return;
      }

      console.log('🧪 BallScreen: Intent selected:', intent, 'for event:', selectedEventForIntent.title);
      
      // Close bottom sheet
      setShowIntentBottomSheet(false);
      
      // IMMEDIATE STATE CHANGE - Update UI instantly for better UX
      setUserInterests(prev => {
        const newSet = new Set([...prev, selectedEventForIntent.id]);
        console.log('🧪 BallScreen: Immediately updated userInterests set:', Array.from(newSet));
        
        // Also save to localStorage immediately for persistence
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`userInterests_${user.id}`, JSON.stringify(Array.from(newSet)));
            console.log('🧪 BallScreen: Immediately saved to localStorage');
          } catch (storageError) {
            console.warn('🧪 BallScreen: Error saving to localStorage:', storageError);
          }
        }
        
        return newSet;
      });
      
      // Add to loading state
      setLoadingInterests(prev => new Set([...prev, selectedEventForIntent.id]));
      
      // Save user intent to Firestore
      await intentBasedMatchingService.saveUserIntent(user.id, selectedEventForIntent.id, intent);
      
      // Check for matches based on intent
      const matchResult = await intentBasedMatchingService.checkForMatch(user.id, selectedEventForIntent.id, selectedEventForIntent.title, intent);
      
      if (matchResult.matched) {
        console.log('🧪 BallScreen: Found intent-based match!');
        
        // Show match alert
        Alert.alert(
          '🎉 You Have a Match!',
          `You matched with someone for "${selectedEventForIntent.title}"! You both have compatible intentions for this ball event.`,
          [
            {
              text: 'View Matches',
              onPress: () => {
                router.push('/(tabs)/matches');
              }
            },
            { text: 'OK', style: 'default' }
          ]
        );
      } else {
        // Show success message if no matches
        Alert.alert(
          'Interest Recorded! 🎉',
          `You've shown interest in "${selectedEventForIntent.title}" with ${intent} intent. We'll notify you if someone else is interested too!`,
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }
      
    } catch (error) {
      console.error('🧪 BallScreen: Error processing intent:', error);
      Alert.alert('Error', 'Failed to record your interest. Please try again.');
    } finally {
      // Remove from loading state
      setLoadingInterests(prev => {
        const newSet = new Set(prev);
        if (selectedEventForIntent) {
          newSet.delete(selectedEventForIntent.id);
        }
        return newSet;
      });
      
      // Clear selected event
      setSelectedEventForIntent(null);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A4C93" />
          <Text style={styles.loadingText}>Loading Formal Ball Events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>🎩 Find Formal Ball Events Near You</Text>
          <Text style={styles.subtitle}>Discover elegant formal ball events in your area</Text>
        </View>

        {/* Location Input Section */}
        <View style={styles.locationSection}>
          {/* Country Selection */}
          <View style={styles.countryContainer}>
            <Text style={styles.countryLabel}>Select Country:</Text>
            <CountryDropdown
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              style={styles.countryDropdown}
            />
          </View>

          {/* Postal Code Input */}
          <View style={styles.postalCodeContainer}>
            <Ionicons name="location" size={20} color="#6A4C93" />
            <TextInput
              style={styles.postalCodeInput}
              placeholder="Enter postal code"
              placeholderTextColor="#999"
              value={postalCode}
              onChangeText={setPostalCode}
            />
          </View>

          {/* Validation Message */}
          {postalCode && (
            <Text style={[
              styles.validationText, 
              isPostalCodeValid ? styles.validationTextValid : styles.validationTextInvalid
            ]}>
              {PostalCodeValidator.validatePostalCode(postalCode, selectedCountry).message}
            </Text>
          )}

          <View style={styles.locationButtons}>
            <TouchableOpacity style={styles.locationButton} onPress={handleUseMyLocation}>
              <Ionicons name="location" size={18} color="#fff" />
              <Text style={styles.locationButtonText}>📍 Use My Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.locationButton,
                styles.searchButton,
                (!selectedCountry || !postalCode || !isPostalCodeValid) && styles.disabledButton
              ]}
              onPress={handleSearchByCode}
              disabled={!selectedCountry || !postalCode || !isPostalCodeValid}
            >
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.locationButtonText}>🔍 Search by Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI-Powered Upgrade Card */}
        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>🎩 Try AI-Powered Formal Ball Dance Finder</Text>
          <Text style={styles.upgradeSubtitle}>
            Get AI Agent Event Search, Partner Matching & Chatting
          </Text>

          <View style={styles.freeTierStatus}>
            <Ionicons name="time" size={16} color="#FFD700" />
            <Text style={styles.freeTierText}>5 searches/day • 7-day trial</Text>
          </View>

          {/* Annual Plan */}
          <View style={styles.planCard}>
            <View style={styles.bestValueBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={styles.planTitle}>Annual Premium</Text>
            <Text style={styles.planSavings}>Save $30/year (2 months free)</Text>
            <Text style={styles.planPrice}>$149.99</Text>
            <Text style={styles.planPeriod}>per year</Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeToPremium}>
              <Text style={styles.upgradeButtonText}>Start Annual Premium</Text>
            </TouchableOpacity>
          </View>

          {/* Monthly Plan */}
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Monthly Premium</Text>
            <Text style={styles.planPrice}>$14.99</Text>
            <Text style={styles.planPeriod}>per month</Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeToPremium}>
              <Text style={styles.upgradeButtonText}>Start Monthly Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Specialized Search Options */}
        <View style={styles.specializedSection}>
          <Text style={styles.sectionTitle}>🎩 Specialized Formal Ball Searches</Text>
          
          <TouchableOpacity
            style={styles.specializedButton}
            onPress={() => handleSpecializedSearch('Charity Ball')}
          >
            <Text style={styles.specializedButtonText}>🎗️ Charity Ball Events</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.specializedButton}
            onPress={() => handleSpecializedSearch('Masquerade Ball')}
          >
            <Text style={styles.specializedButtonText}>🎭 Masquerade Ball Events</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.specializedButton}
            onPress={() => handleSpecializedSearch('Waltz Ball')}
          >
            <Text style={styles.specializedButtonText}>💃 Waltz & Viennese Ball Events</Text>
          </TouchableOpacity>
        </View>

        {/* Formal Ball Events Section */}
        {showFormalBallEvents && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsTitle}>🎩 Formal Ball Events Found</Text>
            
            {formalBallEvents.length > 0 ? (
              <FlatList
                data={formalBallEvents}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.eventCard}
                    onPress={() => handleEventPress(item)}
                  >
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{item.title}</Text>
                      {item.price && (
                        <Text style={styles.eventPrice}>{item.price}</Text>
                      )}
                    </View>
                    
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventLocation}>📍 {item.location}</Text>
                      {item.date && (
                        <Text style={styles.eventDateTime}>
                          📅 {item.date} {item.time && `at ${item.time}`}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.eventStyles}>
                      {item.danceStyles.map((style, index) => (
                        <View key={index} style={styles.styleTag}>
                          <Text style={styles.styleTagText}>{style}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <Text style={styles.eventDescription}>{item.description}</Text>
                    
                    {/* Event Actions */}
                    <View style={styles.eventActions}>
                      {/* I'm Interested Button */}
                      <Pressable
                        style={[
                          styles.interestButton,
                          userInterests.has(item.id) && styles.interestButtonActive,
                          loadingInterests.has(item.id) && styles.interestButtonDisabled
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleInterestPress(item);
                        }}
                        disabled={loadingInterests.has(item.id)}
                        hitSlop={12}
                        accessibilityRole="button"
                      >
                        {loadingInterests.has(item.id) ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Ionicons 
                            name={userInterests.has(item.id) ? "heart" : "heart-outline"} 
                            size={16} 
                            color="#fff" 
                          />
                        )}
                        <Text style={styles.interestButtonText}>
                          {loadingInterests.has(item.id) ? 'Saving...' : (userInterests.has(item.id) ? 'Interested' : "I'm Interested")}
                        </Text>
                      </Pressable>
                      
                      {/* Event Type Badge */}
                      <View style={styles.eventTypeBadge}>
                        <Text style={styles.eventTypeText}>
                          {item.eventType.charAt(0).toUpperCase() + item.eventType.slice(1)} Ball
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.eventFooter}>
                      <Text style={styles.eventSource}>via {item.source}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No formal ball events found in your area.</Text>
                <Text style={styles.noEventsSubtext}>Try expanding your search or checking back later.</Text>
              </View>
            )}

            <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshEvents}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.refreshButtonText}>🔄 Refresh Events</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator */}
        {isSearchingEvents && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.generatingText}>🎩 Searching for formal ball events...</Text>
          </View>
        )}

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <Text style={styles.trustText}>✨ Trusted by dancers worldwide ✨</Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Specialized Search Paywall Modal */}
      {showSpecializedPaywall && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upgrade to Premium</Text>
            <Text style={styles.modalMessage}>
              You&apos;ve used all your free specialized searches. Upgrade to premium for unlimited access!
            </Text>
            
            <TouchableOpacity
              style={styles.modalUpgradeButton}
              onPress={() => handleUpgradeSpecialized('Premium')}
            >
              <Text style={styles.modalUpgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowSpecializedPaywall(false)}
            >
              <Text style={styles.modalCancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Intent Selection Bottom Sheet */}
      <IntentSelectionBottomSheet
        visible={showIntentBottomSheet}
        onIntentSelected={handleIntentSelected}
        onDismiss={() => {
          setShowIntentBottomSheet(false);
          setSelectedEventForIntent(null);
        }}
      />
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#6A11CB',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  locationSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#6A11CB',
  },
  countryContainer: {
    marginBottom: 16,
  },
  countryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  countryDropdown: {
    marginBottom: 0,
  },
  postalCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  postalCodeInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  validationText: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  validationTextValid: {
    color: '#4CAF50',
  },
  validationTextInvalid: {
    color: '#FF5722',
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchButton: {
    backgroundColor: '#6A11CB',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  upgradeCard: {
    margin: 20,
    backgroundColor: '#1D1E33',
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  freeTierStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  freeTierText: {
    color: '#ccc',
    fontSize: 12,
    marginLeft: 8,
  },
  planCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  bestValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bestValueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  planTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planSavings: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 8,
  },
  planPrice: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planPeriod: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 12,
  },
  specializedSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  specializedButton: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  specializedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventsSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  eventsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  eventPrice: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventLocation: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  eventDateTime: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    transform: [{ scale: 1 }],
  },
  interestButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF4757',
    transform: [{ scale: 1.05 }],
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  interestButtonDisabled: {
    opacity: 0.6,
  },
  interestButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  eventTypeBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  eventTypeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventType: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  eventSource: {
    color: '#999',
    fontSize: 12,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEventsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  noEventsSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  eventStyles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  styleTag: {
    backgroundColor: '#6A4C93',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  styleTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventDescription: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  generatingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 12,
  },
  trustSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  trustText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 100,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalUpgradeButton: {
    backgroundColor: '#6A4C93',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalUpgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
