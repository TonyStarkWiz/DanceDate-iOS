import { CountryDropdown } from '@/components/ui/CountryDropdown';
import { IntentSelectionBottomSheet, IntentType } from '@/components/ui/IntentSelectionBottomSheet';
import { PremiumUpgradePopup } from '@/components/ui/PremiumUpgradePopup';
import { useAuth } from '@/contexts/AuthContext';
import { eventInterestService } from '@/services/eventInterestService';
import { googleCustomSearchClient, GoogleSearchResult } from '@/services/googleCustomSearchService';
import { intentBasedMatchingService } from '@/services/intentBasedMatchingService';
import { LocationData, locationService, PostalCodeValidator } from '@/services/locationService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Simplified Event interface for dance events from Google Search
interface DanceEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  source: string;
  url?: string;
  image?: string;
}

export const EventListScreen: React.FC = () => {
  Alert.alert('🧪 EventListScreen', 'Component is mounting!');
  
  const { user } = useAuth();
  const [events, setEvents] = useState<DanceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Location state
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationMethod, setLocationMethod] = useState<'none' | 'gps' | 'postal'>('none');
  
  // Postal code search
  const [postalCode, setPostalCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [postalCodeValid, setPostalCodeValid] = useState(false);
  
  // Search state
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Interest tracking
  const [userInterests, setUserInterests] = useState<Set<string>>(new Set());
  const [loadingInterests, setLoadingInterests] = useState<Set<string>>(new Set());
  
  // Premium status
  const [isPremium, setIsPremium] = useState(false);
  
  // Premium Upgrade Popup State
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [premiumTriggerType, setPremiumTriggerType] = useState<string>('');
  const [premiumCountdown, setPremiumCountdown] = useState(300);
  
  // Intent Selection Bottom Sheet State
  const [showIntentBottomSheet, setShowIntentBottomSheet] = useState(false);
  const [selectedEventForIntent, setSelectedEventForIntent] = useState<DanceEvent | null>(null);

  useEffect(() => {
    Alert.alert('🧪 useEffect 1', `User ID: ${user?.id || 'No user'}`);
    if (user?.id) {
      checkPremiumStatus();
      loadUserInterests();
    }
  }, [user?.id]);

  // Also reload interests when events change to ensure sync
  useEffect(() => {
    Alert.alert('🧪 useEffect 2', `Events length: ${events.length}, User: ${user?.id || 'No user'}`);
    if (user?.id && events.length > 0) {
      loadUserInterests();
    }
  }, [events.length, user?.id]);

  // Validate postal code when it changes
  useEffect(() => {
    if (postalCode) {
      const validation = PostalCodeValidator.validatePostalCode(postalCode, selectedCountry);
      setPostalCodeValid(validation.isValid);
    } else {
      setPostalCodeValid(false);
    }
  }, [postalCode, selectedCountry]);

  // Load user's event interests from Firestore
  const loadUserInterests = async () => {
    try {
      if (!user?.id) {
        console.log('🧪 EventListScreen: No user ID, skipping interest load');
        return;
      }
      
      console.log('🧪 EventListScreen: Loading user interests from Firestore...');
      const interests = await eventInterestService.getUserInterestedEvents(user.id);
      const interestIds = new Set(interests.map(interest => interest.eventId));
      
      console.log('🧪 EventListScreen: Loaded', interestIds.size, 'user interests from Firestore');
      console.log('🧪 EventListScreen: Interest IDs:', Array.from(interestIds));
      
      setUserInterests(interestIds);
      
      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`userInterests_${user.id}`, JSON.stringify(Array.from(interestIds)));
          console.log('🧪 EventListScreen: Saved interests to localStorage as backup');
        } catch (storageError) {
          console.warn('🧪 EventListScreen: Error saving to localStorage:', storageError);
        }
      }
      
    } catch (error) {
      console.error('🧪 EventListScreen: Error loading user interests from Firestore:', error);
      
      // Fallback: try to load from localStorage
      if (typeof window !== 'undefined' && user?.id) {
        try {
          const cachedInterests = localStorage.getItem(`userInterests_${user.id}`);
          if (cachedInterests) {
            const interestIds = new Set<string>(JSON.parse(cachedInterests));
            setUserInterests(interestIds);
            console.log('🧪 EventListScreen: Loaded interests from localStorage fallback');
          }
        } catch (fallbackError) {
          console.warn('🧪 EventListScreen: Fallback localStorage load failed:', fallbackError);
        }
      }
    }
  };

  // Transform Google Search results to our DanceEvent format
  const transformSearchResults = (results: GoogleSearchResult[]): DanceEvent[] => {
    return results.map((result, index) => ({
      id: `${result.link}-${index}`,
      title: result.title,
      description: result.snippet,
      location: 'Location from search result',
      source: result.source,
      url: result.link,
      image: result.image
    }));
  };

  // Handle "Use My Location" button press
  const handleUseMyLocation = async () => {
    try {
      console.log('🧪 EventListScreen: Getting GPS location...');
      setLoading(true);
      
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      setLocationMethod('gps');
      
      // Search for dance events using GPS location
      await searchDanceEvents(location);
      
      Alert.alert(
        'Location Set',
        `Using your location: ${location.locationName || `${location.latitude}, ${location.longitude}`}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('🧪 EventListScreen: GPS error:', error);
      Alert.alert(
        'Location Error', 
        'Failed to get your location. Please try the postal code option instead.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle postal code search
  const handlePostalCodeSearch = async () => {
    if (!postalCodeValid) {
      Alert.alert(
        'Invalid Postal Code', 
        'Please enter a valid postal code for the selected country.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      console.log('🧪 EventListScreen: Searching by postal code:', postalCode, selectedCountry);
      setLoading(true);
      
      // Create location data from postal code (simplified - in real app would geocode)
      const location: LocationData = {
        latitude: 40.7128, // Would be geocoded from postal code
        longitude: -74.0060,
        locationName: `${postalCode}, ${selectedCountry}`,
        postalCode: postalCode,
        country: selectedCountry
      };
      
      setUserLocation(location);
      setLocationMethod('postal');
      
      // Search for dance events using postal code location
      await searchDanceEvents(location);
      
    } catch (error) {
      console.error('🧪 EventListScreen: Postal code search error:', error);
      Alert.alert(
        'Search Error',
        'Failed to search events by postal code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Main search function that calls Google Custom Search
  const searchDanceEvents = async (location: LocationData) => {
    try {
      console.log('🧪 EventListScreen: Searching dance events for location:', location);
      
      const locationString = location.locationName || `${location.latitude}, ${location.longitude}`;
      
      // Use Google Custom Search to find dance events
      const searchResults = await googleCustomSearchClient.searchDanceEvents(
        'dance events classes lessons', 
        locationString, 
        20
      );
      
      if (searchResults.length === 0) {
        Alert.alert(
          'No Events Found',
          'No dance events found in this location. Try a different area or check back later.',
          [{ text: 'OK' }]
        );
        setEvents([]);
        return;
      }
      
      // Transform and set events
      const danceEvents = transformSearchResults(searchResults);
      Alert.alert('🧪 Events Loaded', `Found ${danceEvents.length} events!`);
      setEvents(danceEvents);
      setSearchPerformed(true);
      
      console.log('🧪 EventListScreen: Found', danceEvents.length, 'dance events');
      
    } catch (error) {
      console.error('🧪 EventListScreen: Search error:', error);
      Alert.alert(
        'Search Error',
        'Failed to search for dance events. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      setEvents([]);
    }
  };

  // Handle "I'm Interested" button press - now shows intent selection
  const handleInterestPress = async (event: DanceEvent) => {
    console.log('🧪 EventListScreen: handleInterestPress called for event:', event.title, 'ID:', event.id);
    Alert.alert('🧪 Interest Button Pressed!', `Event: ${event.title}\nID: ${event.id}`);
    
    try {
      if (!user) {
        Alert.alert('🧪 No User', 'You must be logged in to show interest in events.');
        return;
      }

      Alert.alert('🧪 User Found', `User ID: ${user.id}`);
      
      // Show intent selection bottom sheet
      console.log('🧪 EventListScreen: Setting selectedEventForIntent and showing bottom sheet');
      setSelectedEventForIntent(event);
      setShowIntentBottomSheet(true);
      console.log('🧪 EventListScreen: Bottom sheet should now be visible');
      
    } catch (error) {
      Alert.alert('Error', `Failed to process interest: ${error}`);
    }
  };

  // Handle intent selection from bottom sheet
  const handleIntentSelected = async (intentType: IntentType) => {
    console.log('🧪 EventListScreen: handleIntentSelected called with intent:', intentType);
    console.log('🧪 EventListScreen: selectedEventForIntent:', selectedEventForIntent?.title);
    console.log('🧪 EventListScreen: user:', user?.id);
    
    // Add a simple alert to confirm this function is being called
    Alert.alert('🧪 DEBUG', `handleIntentSelected called with intent: ${intentType}`);
    
    if (!selectedEventForIntent || !user) {
      console.log('🧪 EventListScreen: Missing selectedEventForIntent or user, returning early');
      return;
    }
    
    try {
      Alert.alert('🧪 Intent Selected', `Intent: ${intentType} for event: ${selectedEventForIntent.title}`);
      
      // Save user intent
      console.log('🧪 EventListScreen: Saving user intent to Firestore...');
      await intentBasedMatchingService.saveUserIntent(user.id, selectedEventForIntent.id, intentType);
      
      // Check for matches
      console.log('🧪 EventListScreen: Checking for matches...');
      const matchResult = await intentBasedMatchingService.checkForMatch(
        user.id,
        selectedEventForIntent.id,
        selectedEventForIntent.title,
        intentType
      );
      
      // Update UI state - always save the interest regardless of match result
      console.log('🧪 EventListScreen: Updating userInterests state...');
      console.log('🧪 EventListScreen: Current userInterests before update:', Array.from(userInterests));
      
      // Import toDocId to encode the event ID the same way as Firestore
      const { toDocId } = await import('@/config/firebase');
      const safeEventId = toDocId(selectedEventForIntent.id);
      console.log('🧪 EventListScreen: Original eventId:', selectedEventForIntent.id);
      console.log('🧪 EventListScreen: Safe eventId for UI:', safeEventId);
      
      setUserInterests(prev => {
        console.log('🧪 EventListScreen: setUserInterests callback called with prev:', Array.from(prev));
        const newSet = new Set(prev);
        newSet.add(safeEventId); // Use the same encoded ID as Firestore
        console.log('🧪 EventListScreen: Updated userInterests:', Array.from(newSet));
        
        // Also save to localStorage for persistence
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`userInterests_${user.id}`, JSON.stringify(Array.from(newSet)));
            console.log('🧪 EventListScreen: Saved interest to localStorage:', safeEventId);
          } catch (storageError) {
            console.warn('🧪 EventListScreen: Error saving to localStorage:', storageError);
          }
        }
        
        return newSet;
      });
      
      // Force a re-render by logging the state after the update
      setTimeout(() => {
        console.log('🧪 EventListScreen: userInterests after state update:', Array.from(userInterests));
      }, 100);
      
      // Close bottom sheet
      console.log('🧪 EventListScreen: Closing bottom sheet...');
      setShowIntentBottomSheet(false);
      setSelectedEventForIntent(null);
      
    } catch (error) {
      console.error('🧪 EventListScreen: Error in handleIntentSelected:', error);
      Alert.alert('Error', `Failed to process intent: ${error}`);
      setShowIntentBottomSheet(false);
      setSelectedEventForIntent(null);
    }
  };


  const checkPremiumStatus = async () => {
    try {
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
    }
  };

  const onRefresh = async () => {
    if (locationMethod === 'none') {
      Alert.alert(
        'No Location Set',
        'Please select a location method first (GPS or postal code).',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setRefreshing(true);
    
    // Reload both events and interests
    const promises = [];
    
    if (userLocation) {
      promises.push(searchDanceEvents(userLocation));
    }
    
    if (user?.id) {
      promises.push(loadUserInterests());
    }
    
    await Promise.all(promises);
    console.log('🧪 EventListScreen: Refresh completed - events and interests reloaded');
    
    setRefreshing(false);
  };

  // Handle event press
  const handleEventPress = (event: DanceEvent) => {
    Alert.alert(
      event.title,
      event.description,
      [
        {
          text: 'View Online',
          onPress: () => {
            if (event.url) {
              // In a real app, this would open the URL
              console.log('🧪 Opening URL:', event.url);
              Alert.alert('Info', 'This would open the event website in a browser.');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Reset search to start over
  const resetSearch = () => {
    setEvents([]);
    setUserLocation(null);
    setLocationMethod('none');
    setSearchPerformed(false);
    setPostalCode('');
    setSelectedCountry('US');
    setPostalCodeValid(false);
  };

  // Render individual event item
  const renderEventItem = ({ item: event }: { item: DanceEvent }) => {
    Alert.alert('🧪 Rendering Event', `Title: ${event.title}\nID: ${event.id}`);
    
    // Import toDocId to encode the event ID the same way as Firestore
    const { toDocId } = require('@/config/firebase');
    const safeEventId = toDocId(event.id);
    const isInterested = userInterests.has(safeEventId);
    const isLoading = loadingInterests.has(safeEventId);
    
    console.log('🧪 EventListScreen: Checking interest for event:', event.title);
    console.log('🧪 EventListScreen: Original eventId:', event.id);
    console.log('🧪 EventListScreen: Safe eventId:', safeEventId);
    console.log('🧪 EventListScreen: isInterested:', isInterested);
    console.log('🧪 EventListScreen: userInterests:', Array.from(userInterests));
    
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
        
        <Text style={styles.eventDescription} numberOfLines={3}>
          {event.description}
        </Text>
        
        <View style={styles.eventFooter}>
          <Text style={styles.eventLocation}>📍 {event.location}</Text>
          
          <View style={styles.eventActions}>
            {/* I'm Interested Button */}
            <Pressable
              style={({ pressed }) => [
                styles.interestButton,
                isInterested && styles.interestButtonActive,
                isLoading && styles.interestButtonDisabled,
                pressed && { opacity: 0.7 },
                { position: 'relative', zIndex: 2 }
              ]}
              onPress={(e) => {
                if (e?.stopPropagation) e.stopPropagation();
                Alert.alert('🧪 Button Click Detected', `Event: ${event.title}`);
                handleInterestPress(event);
              }}
              disabled={isLoading}
              accessibilityRole="button"
              hitSlop={12}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons 
                  name={isInterested ? "heart" : "heart-outline"} 
                  size={16} 
                  color="#fff" 
                />
              )}
              <Text style={styles.interestButtonText}>
                {isLoading ? 'Saving...' : (isInterested ? 'Interested' : "I'm Interested")}
              </Text>
            </Pressable>
            
            {/* View Event Button */}
            {event.url && (
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleEventPress(event);
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

  // Render empty state when no location is selected
  const renderLocationPrompt = () => (
    <View style={styles.locationPromptContainer}>
      <Ionicons name="location-outline" size={80} color="#6A11CB" />
      <Text style={styles.locationPromptTitle}>Find Dance Events</Text>
      <Text style={styles.locationPromptSubtitle}>
        Choose how you'd like to search for dance events in your area:
      </Text>
      
      <TouchableOpacity 
        style={styles.locationButton}
        onPress={handleUseMyLocation}
        disabled={loading}
      >
        {loading && locationMethod === 'gps' ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="navigate" size={20} color="#fff" />
        )}
        <Text style={styles.locationButtonText}>
          {loading && locationMethod === 'gps' ? 'Getting Location...' : 'Use My Location'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.orText}>OR</Text>
      
      <View style={styles.postalCodeSection}>
        <Text style={styles.postalCodeLabel}>Enter your postal code:</Text>
        
        <View style={styles.postalCodeRow}>
          <CountryDropdown
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            style={styles.countryDropdown}
          />
          
          <TextInput
            style={[styles.postalCodeInput, postalCodeValid && styles.postalCodeInputValid]}
            placeholder="Postal code"
            value={postalCode}
            onChangeText={setPostalCode}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
        
        {postalCode && (
          <Text style={[styles.validationText, postalCodeValid ? styles.validationTextValid : styles.validationTextInvalid]}>
            {PostalCodeValidator.validatePostalCode(postalCode, selectedCountry).message}
          </Text>
        )}
        
        <TouchableOpacity
          style={[styles.searchButton, (!postalCodeValid || loading) && styles.searchButtonDisabled]}
          onPress={handlePostalCodeSearch}
          disabled={!postalCodeValid || loading}
        >
          {loading && locationMethod === 'postal' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="search" size={20} color="#fff" />
          )}
          <Text style={styles.searchButtonText}>
            {loading && locationMethod === 'postal' ? 'Searching...' : 'Search Events'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state when no events found
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color="#6A11CB" />
      <Text style={styles.emptyTitle}>No Dance Events Found</Text>
      <Text style={styles.emptySubtitle}>
        No dance events found in this location. Try a different area or check back later.
      </Text>
      <TouchableOpacity style={styles.resetButton} onPress={resetSearch}>
        <Ionicons name="refresh-outline" size={20} color="#fff" />
        <Text style={styles.resetButtonText}>Try Different Location</Text>
      </TouchableOpacity>
    </View>
  );

  // Main render method
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>
            {locationMethod === 'gps' ? 'Getting your location...' : 'Searching dance events...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dance Events</Text>
        {searchPerformed && (
          <Text style={styles.subtitle}>
            {events.length} event{events.length !== 1 ? 's' : ''} found
            {userLocation && ` near ${userLocation.locationName || 'your location'}`}
          </Text>
        )}
        
        {searchPerformed && (
          <TouchableOpacity 
            style={styles.resetLocationButton}
            onPress={resetSearch}
          >
            <Ionicons name="location-outline" size={16} color="#6A11CB" />
            <Text style={styles.resetLocationText}>Change Location</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {!searchPerformed ? (
        renderLocationPrompt()
      ) : events.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {Alert.alert('🧪 About to Render FlatList', `Events count: ${events.length}`)}
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
          />
        </>
      )}

      {/* Premium Upgrade Popup */}
      <PremiumUpgradePopup
        visible={showPremiumPopup}
        onClose={() => setShowPremiumPopup(false)}
        onSuccess={() => {
          setShowPremiumPopup(false);
          checkPremiumStatus();
        }}
        triggerType={premiumTriggerType as any}
        countdownSeconds={premiumCountdown}
      />

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
    backgroundColor: '#4A148C',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 10,
  },
  resetLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
  },
  resetLocationText: {
    color: '#6A11CB',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
    textAlign: 'center',
  },
  locationPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  locationPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  locationPromptSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    minWidth: 200,
    justifyContent: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  orText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 20,
  },
  postalCodeSection: {
    width: '100%',
    alignItems: 'center',
  },
  postalCodeLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  postalCodeRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    gap: 10,
  },
  countryDropdown: {
    flex: 1,
  },
  postalCodeInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  postalCodeInputValid: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  validationText: {
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
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
    backgroundColor: '#6A11CB',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    justifyContent: 'center',
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 8,
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
  eventDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 15,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  linkText: {
    color: '#6A11CB',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
