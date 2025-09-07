import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { eventInterestService } from '@/services/eventInterestService';
import { googleCustomSearchClient } from '@/services/googleCustomSearchService';
import { LocationData, locationService, PostalCodeValidator } from '@/services/locationService';
import { matchDetectionService } from '@/services/matchDetectionService';
import { CountryDropdown } from '../ui/CountryDropdown';

// Mock data for dance classes - replace with real API calls later
const mockDanceClasses = [
  {
    id: '1',
    title: 'Beginner Salsa Fundamentals',
    instructor: 'Maria Rodriguez',
    location: 'Dance Studio Downtown',
    date: 'Every Monday & Wednesday',
    time: '7:00 PM - 8:30 PM',
    price: '$25/class',
    danceStyle: 'Salsa',
    description: 'Learn the basics of salsa dancing with professional instruction',
    imageUrl: null,
  },
  {
    id: '2',
    title: 'Intermediate Bachata',
    instructor: 'Carlos Mendez',
    location: 'Latin Dance Academy',
    date: 'Every Tuesday & Thursday',
    time: '8:00 PM - 9:30 PM',
    price: '$30/class',
    danceStyle: 'Bachata',
    description: 'Advanced bachata techniques and partner work',
    imageUrl: null,
  },
  {
    id: '3',
    title: 'Advanced Argentine Tango',
    instructor: 'Elena Vasquez',
    location: 'Tango Palace',
    date: 'Every Friday',
    time: '6:30 PM - 9:00 PM',
    price: '$40/class',
    danceStyle: 'Argentine Tango',
    description: 'Master the art of Argentine tango with expert guidance',
    imageUrl: null,
  },
];

// Mock video lessons data
const mockVideoLessons = [
  {
    id: '1',
    title: 'Salsa Basic Steps Tutorial',
    instructorName: 'Maria Rodriguez',
    danceStyle: { name: 'Salsa' },
    duration: '15:30',
    difficulty: 'Beginner',
  },
  {
    id: '2',
    title: 'Bachata Sensual Moves',
    instructorName: 'Carlos Mendez',
    danceStyle: { name: 'Bachata' },
    duration: '22:15',
    difficulty: 'Intermediate',
  },
  {
    id: '3',
    title: 'Tango Footwork Mastery',
    instructorName: 'Elena Vasquez',
    danceStyle: { name: 'Argentine Tango' },
    duration: '18:45',
    difficulty: 'Advanced',
  },
];

// Dance category data
const danceCategories = [
  {
    name: 'Salsa',
    description: '🔥 Hot Latin Rhythms',
    color: '#E91E63',
  },
  {
    name: 'Bachata',
    description: '💕 Romantic & Sensual',
    color: '#9C27B0',
  },
  {
    name: 'Kizomba',
    description: '🌍 African Fusion',
    color: '#3F51B5',
  },
  {
    name: 'West Coast Swing',
    description: '🎵 Smooth & Elegant',
    color: '#009688',
  },
  {
    name: 'Argentine Tango',
    description: '🎭 Dramatic & Passionate',
    color: '#795548',
  },
  {
    name: 'Hip Hop',
    description: '🎤 Urban & Energetic',
    color: '#607D8B',
  },
];

export const ClassesScreen: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [postalCode, setPostalCode] = useState('');
  const [isPostalCodeValid, setIsPostalCodeValid] = useState(false);
  const [showAiGeneratedEvents, setShowAiGeneratedEvents] = useState(false);
  const [aiGeneratedEvents, setAiGeneratedEvents] = useState(mockDanceClasses);
  const [isGeneratingEvents, setIsGeneratingEvents] = useState(false);
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);
  const [localEvents, setLocalEvents] = useState(mockDanceClasses);
  const [videos, setVideos] = useState(mockVideoLessons);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Interest tracking
  const [userInterests, setUserInterests] = useState<Set<string>>(new Set());
  const [loadingInterests, setLoadingInterests] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    if (user?.id) {
      loadUserInterests();
    }
    
    return () => clearTimeout(timer);
  }, [user?.id]);

  // Load user's event interests from Firestore
  const loadUserInterests = async () => {
    try {
      if (!user?.id) {
        console.log('🧪 ClassesScreen: No user ID, skipping interest load');
        return;
      }
      
      console.log('🧪 ClassesScreen: Loading user interests from Firestore...');
      const interests = await eventInterestService.getUserInterestedEvents(user.id);
      const interestIds = new Set(interests.map(interest => interest.eventId));
      
      console.log('🧪 ClassesScreen: Loaded', interestIds.size, 'user interests from Firestore');
      console.log('🧪 ClassesScreen: Interest IDs:', Array.from(interestIds));
      
      setUserInterests(interestIds);
      
      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`userInterests_${user.id}`, JSON.stringify(Array.from(interestIds)));
          console.log('🧪 ClassesScreen: Saved interests to localStorage as backup');
        } catch (storageError) {
          console.warn('🧪 ClassesScreen: Error saving to localStorage:', storageError);
        }
      }
      
    } catch (error) {
      console.error('🧪 ClassesScreen: Error loading user interests from Firestore:', error);
      
      // Fallback: try to load from localStorage
      if (typeof window !== 'undefined' && user?.id) {
        try {
          const cachedInterests = localStorage.getItem(`userInterests_${user.id}`);
          if (cachedInterests) {
            const interestIds = new Set(JSON.parse(cachedInterests));
            setUserInterests(interestIds);
            console.log('🧪 ClassesScreen: Loaded interests from localStorage fallback');
          }
        } catch (fallbackError) {
          console.warn('🧪 ClassesScreen: Fallback localStorage load failed:', fallbackError);
        }
      }
    }
  };

  const handleUseMyLocation = async () => {
    try {
      setIsGettingLocation(true);
      setSearchError(null);
      
      console.log('🧪 ClassesScreen: Getting user location...');
      const location = await locationService.getCurrentLocation();
      
      setCurrentLocation(location);
      console.log('🧪 ClassesScreen: Location obtained:', location);
      
      // Search for dance classes using Google Custom Search
      await searchDanceClasses(location.locationName || `${location.latitude},${location.longitude}`);
      
    } catch (error) {
      console.error('🧪 ClassesScreen: Location error:', error);
      setSearchError('Failed to get your location. Please try again or use postal code search.');
      Alert.alert('Location Error', 'Unable to get your current location. Please try using the postal code search instead.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSearchByCode = async () => {
    if (selectedCountry && postalCode && isPostalCodeValid) {
      try {
        setIsGeneratingEvents(true);
        setSearchError(null);
        
        console.log('🧪 ClassesScreen: Searching by postal code:', postalCode, selectedCountry);
        
        // Validate postal code format
        const validation = PostalCodeValidator.validatePostalCode(postalCode, selectedCountry);
        if (!validation.isValid) {
          Alert.alert('Invalid Postal Code', validation.message);
          setIsGeneratingEvents(false);
          return;
        }
        
        // Format postal code
        const formattedCode = PostalCodeValidator.formatPostalCode(postalCode, selectedCountry);
        const countryName = PostalCodeValidator.getSupportedCountries().find(c => c.code === selectedCountry)?.name || selectedCountry;
        
        // Search for dance classes using Google Custom Search
        await searchDanceClasses(`${formattedCode}, ${countryName}`);
        
      } catch (error) {
        console.error('🧪 ClassesScreen: Postal code search error:', error);
        setSearchError('Failed to search for dance classes. Please try again.');
        Alert.alert('Search Error', 'Unable to search for dance classes. Please try again.');
      } finally {
        setIsGeneratingEvents(false);
      }
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid postal code and select a country.');
    }
  };

  // Main search function using Google Custom Search for dance classes
  const searchDanceClasses = async (location: string) => {
    try {
      console.log('🧪 ClassesScreen: Searching for dance classes in:', location);
      
      // Build search query specifically for dance classes
      const searchQuery = `dance classes lessons instruction ${location}`;
      console.log('🧪 ClassesScreen: Search query:', searchQuery);
      
      // Use Google Custom Search to find dance class events
      const results = await googleCustomSearchClient.searchDanceEvents(searchQuery, location, 10);
      
      console.log('🧪 ClassesScreen: Google search results:', results);
      console.log('🧪 ClassesScreen: Number of results:', results?.length || 0);
      
      if (results && results.length > 0) {
        console.log('🧪 ClassesScreen: Processing results...');
        // Transform results to our event format
        const transformedEvents = results.map((result: any, index: number) => ({
          id: `google_${index}`,
          title: result.title || 'Dance Class',
          instructor: extractInstructor(result.snippet) || 'Professional Instructor',
          location: extractLocation(result.snippet) || location,
          date: extractDate(result.snippet) || 'Check website for schedule',
          time: extractTime(result.snippet) || 'Various times available',
          price: extractPrice(result.snippet) || 'Contact for pricing',
          danceStyle: extractDanceStyle(result.title, result.snippet) || 'Various Styles',
          description: result.snippet || 'Professional dance instruction available',
          imageUrl: result.imageUrl || null,
          source: 'Google Search',
          url: result.url
        }));
        
        console.log('🧪 ClassesScreen: Transformed events:', transformedEvents);
        setSearchResults(transformedEvents);
        setShowAiGeneratedEvents(true);
        setSearchError(null);
        
        console.log('🧪 ClassesScreen: Found', transformedEvents.length, 'dance class events');
      } else {
        console.log('🧪 ClassesScreen: No results found');
        setSearchError('No dance classes found in your area. Try expanding your search or checking nearby cities.');
        setShowAiGeneratedEvents(false);
      }
      
    } catch (error) {
      console.error('🧪 ClassesScreen: Search error:', error);
      setSearchError('Failed to search for dance classes. Please try again.');
      setShowAiGeneratedEvents(false);
    }
  };

  // Helper functions to extract information from search results
  const extractInstructor = (snippet: string): string | null => {
    const instructorPatterns = [
      /instructor[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
      /taught by[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
      /with[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i
    ];
    
    for (const pattern of instructorPatterns) {
      const match = snippet.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const extractLocation = (snippet: string): string | null => {
    const locationPatterns = [
      /at[:\s]+([A-Z][a-z\s]+(?:Studio|Academy|Center|Hall))/i,
      /located[:\s]+([A-Z][a-z\s]+)/i,
      /in[:\s]+([A-Z][a-z\s]+)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = snippet.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const extractDate = (snippet: string): string | null => {
    const datePatterns = [
      /(?:every|on)[:\s]+([A-Z][a-z]+day)/i,
      /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(?:weekly|daily)/i
    ];
    
    for (const pattern of datePatterns) {
      const match = snippet.match(pattern);
      if (match) return match[0];
    }
    return null;
  };

  const extractTime = (snippet: string): string | null => {
    const timePatterns = [
      /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
      /(\d{1,2}\s*(?:AM|PM|am|pm))/i,
      /(?:at|from)[:\s]+(\d{1,2}:\d{2})/i
    ];
    
    for (const pattern of timePatterns) {
      const match = snippet.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const extractPrice = (snippet: string): string | null => {
    const pricePatterns = [
      /\$(\d+(?:\.\d{2})?)\s*(?:per|\/)\s*(?:class|lesson|session)/i,
      /\$(\d+(?:\.\d{2})?)\s*(?:per|\/)\s*(?:hour|hr)/i,
      /(\d+(?:\.\d{2})?)\s*(?:dollars?|USD)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = snippet.match(pattern);
      if (match) return `$${match[1]}`;
    }
    return null;
  };

  const extractDanceStyle = (title: string, snippet: string): string | null => {
    const text = `${title} ${snippet}`.toLowerCase();
    const styles = ['salsa', 'bachata', 'tango', 'ballroom', 'swing', 'waltz', 'foxtrot', 'cha-cha', 'rumba', 'samba', 'hip hop', 'jazz', 'contemporary', 'ballet', 'latin', 'kizomba', 'west coast swing'];
    
    for (const style of styles) {
      if (text.includes(style)) {
        return style.charAt(0).toUpperCase() + style.slice(1);
      }
    }
    return null;
  };

  const handleRefreshEvents = () => {
    if (currentLocation) {
      searchDanceClasses(currentLocation.locationName || `${currentLocation.latitude},${currentLocation.longitude}`);
    } else if (selectedCountry && postalCode) {
      const formattedCode = PostalCodeValidator.formatPostalCode(postalCode, selectedCountry);
      const countryName = PostalCodeValidator.getSupportedCountries().find(c => c.code === selectedCountry)?.name || selectedCountry;
      searchDanceClasses(`${formattedCode}, ${countryName}`);
    } else {
      Alert.alert('No Search Criteria', 'Please use location or postal code search first.');
    }
  };

  const handleEventPress = (event: any) => {
    router.push(`/eventDetail/${event.title}/${event.instructor}/${event.location}`);
  };

  const handleUpgradeToPremium = () => {
    router.push('/premium' as any);
  };

  const handleBookNow = (event: any) => {
    setShowPremiumUpgrade(true);
  };

  const handleContact = (event: any) => {
    setShowPremiumUpgrade(true);
  };

  const handleCategoryPress = (category: any) => {
    setIsLoadingEvents(true);
    // Simulate searching for classes in that category
    setTimeout(() => {
      setIsLoadingEvents(false);
      Alert.alert('Search Complete', `Found ${category.name} classes in your area!`);
    }, 1500);
  };

  const handleVideoLibrary = () => {
    router.push('/video_library' as any);
  };

  const handleVideoUpload = () => {
    router.push('/video_upload' as any);
  };

  const handleVideoDebug = () => {
    router.push('/video_debug' as any);
  };

  // Handle "I'm Interested" button press for classes
  const handleInterestPress = async (event: any) => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to show interest in classes.');
        return;
      }

      console.log('🧪 ClassesScreen: User interested in class:', event.title);
      
      // IMMEDIATE STATE CHANGE - Update UI instantly for better UX
      setUserInterests(prev => {
        const newSet = new Set([...prev, event.id]);
        console.log('🧪 ClassesScreen: Immediately updated userInterests set:', Array.from(newSet));
        
        // Also save to localStorage immediately for persistence
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`userInterests_${user.id}`, JSON.stringify(Array.from(newSet)));
            console.log('🧪 ClassesScreen: Immediately saved to localStorage');
          } catch (storageError) {
            console.warn('🧪 ClassesScreen: Error saving to localStorage:', storageError);
          }
        }
        
        return newSet;
      });
      
      // Add to loading state
      setLoadingInterests(prev => new Set([...prev, event.id]));
      
      // Save user interest to Firestore (in background)
      await eventInterestService.saveEventInterest(user.id, {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        source: event.source || 'Google Search',
        url: event.url,
        startDate: new Date().toISOString(),
        instructor: event.instructor || 'Unknown',
        tags: ['dance', 'class']
      });
      
      // Check for matches after saving interest
      try {
        const matchResult = await matchDetectionService.checkForMatchesImmediately(user.id, {
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          source: event.source || 'Google Search',
          url: event.url,
          startDate: new Date().toISOString(),
          instructor: event.instructor || 'Unknown',
          tags: ['dance', 'class']
        });
        
        if (matchResult.newMatches.length > 0) {
          console.log('🧪 ClassesScreen: Found new matches!', matchResult.newMatches.length);
          
          // Show match alert
          Alert.alert(
            '🎉 You Have a Match!',
            `You matched with ${matchResult.newMatches[0].potentialPartner.name} for "${event.title}"! You both are interested in this class.`,
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
            `You've shown interest in "${event.title}". We'll notify you if someone else is interested too!`,
            [
              { text: 'OK', style: 'default' }
            ]
          );
        }
      } catch (matchError) {
        console.error('🧪 ClassesScreen: Error checking for matches:', matchError);
        // Still show success message even if match check fails
        Alert.alert(
          'Interest Recorded! 🎉',
          `You've shown interest in "${event.title}". We'll keep you updated about this class!`,
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }
      
    } catch (error) {
      console.error('🧪 ClassesScreen: Error recording interest:', error);
      Alert.alert('Error', 'Failed to record your interest. Please try again.');
    } finally {
      // Remove from loading state
      setLoadingInterests(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A4C93" />
          <Text style={styles.loadingText}>Loading Dance Classes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Dance Classes</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoLibrary}>
            <Ionicons name="play" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoUpload}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoDebug}>
            <Ionicons name="bug" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>💃 Find Dance Classes Near You</Text>
          <Text style={styles.subtitle}>Find the perfect dance class for your skill level</Text>
        </View>

        {/* Video Hero Section */}
        <View style={styles.videoHeroCard}>
          <Text style={styles.videoHeroTitle}>🎬 Learn Dance Moves</Text>
          <Text style={styles.videoHeroSubtitle}>
            Watch professional instructors teach you step-by-step
          </Text>
          
          <TouchableOpacity style={styles.videoHeroButton} onPress={handleVideoLibrary}>
            <Ionicons name="play" size={20} color="#000" />
            <Text style={styles.videoHeroButtonText}>Start Learning Now</Text>
          </TouchableOpacity>
        </View>

        {/* Location Input Section */}
        <View style={styles.locationSection}>
          <Text style={styles.locationSectionTitle}>📍 Find Dance Classes Near You</Text>
          
          {/* Country Selection */}
          <View style={styles.countryContainer}>
            <Text style={styles.inputLabel}>Select Country:</Text>
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
              placeholder={`Enter ${PostalCodeValidator.getSupportedCountries().find(c => c.code === selectedCountry)?.name || 'postal'} code`}
              placeholderTextColor="#999"
              value={postalCode}
              onChangeText={(text) => {
                setPostalCode(text);
                const validation = PostalCodeValidator.validatePostalCode(text, selectedCountry);
                setIsPostalCodeValid(validation.isValid);
              }}
            />
          </View>

          <View style={styles.locationButtons}>
            <TouchableOpacity 
              style={[styles.locationButton, isGettingLocation && styles.disabledButton]} 
              onPress={handleUseMyLocation}
              disabled={isGettingLocation}
            >
              <Ionicons name="location" size={18} color="#fff" />
              <Text style={styles.locationButtonText}>
                {isGettingLocation ? '📍 Getting Location...' : '📍 Use My Location'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.locationButton,
                styles.searchButton,
                (!selectedCountry || !postalCode || !isPostalCodeValid || isGeneratingEvents) && styles.disabledButton
              ]}
              onPress={handleSearchByCode}
              disabled={!selectedCountry || !postalCode || !isPostalCodeValid || isGeneratingEvents}
            >
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.locationButtonText}>
                {isGeneratingEvents ? '🔍 Searching...' : '🔍 Search by Code'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {searchError && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={16} color="#FF6B6B" />
              <Text style={styles.errorText}>{searchError}</Text>
            </View>
          )}
        </View>

        {/* AI-Powered Upgrade Card */}
        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>💃 Try AI-Powered Dance Classes Finder</Text>
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

        {/* Search Results Section */}
        {showAiGeneratedEvents && searchResults.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsTitle}>💃 Dance Classes Found Near You</Text>
            <Text style={styles.eventsSubtitle}>
              Found {searchResults.length} dance class{searchResults.length !== 1 ? 'es' : ''} using Google Search
            </Text>
            
            {searchResults.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventPrice}>{event.price}</Text>
                </View>
                
                <View style={styles.eventDetails}>
                  <Text style={styles.eventInstructor}>Instructor: {event.instructor}</Text>
                  <Text style={styles.eventLocation}>📍 {event.location}</Text>
                  <Text style={styles.eventDateTime}>
                    📅 {event.date} at {event.time}
                  </Text>
                </View>
                
                <View style={styles.eventStyles}>
                  <View style={styles.styleTag}>
                    <Text style={styles.styleTagText}>{event.danceStyle}</Text>
                  </View>
                  <View style={styles.sourceTag}>
                    <Text style={styles.sourceTagText}>{event.source}</Text>
                  </View>
                </View>
                
                <Text style={styles.eventDescription}>{event.description}</Text>
                
                <View style={styles.eventActions}>
                  {/* I'm Interested Button */}
                  <TouchableOpacity
                    style={[
                      styles.interestButton,
                      userInterests.has(event.id) && styles.interestButtonActive,
                      loadingInterests.has(event.id) && styles.interestButtonDisabled
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleInterestPress(event);
                    }}
                    disabled={loadingInterests.has(event.id)}
                  >
                    {loadingInterests.has(event.id) ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons 
                        name={userInterests.has(event.id) ? "heart" : "heart-outline"} 
                        size={16} 
                        color="#fff" 
                      />
                    )}
                    <Text style={styles.interestButtonText}>
                      {loadingInterests.has(event.id) ? 'Saving...' : (userInterests.has(event.id) ? 'Interested' : "I'm Interested")}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Visit Website Button */}
                  {event.url && (
                    <TouchableOpacity style={styles.visitWebsiteButton}>
                      <Ionicons name="open-outline" size={16} color="#6A11CB" />
                      <Text style={styles.visitWebsiteText}>Visit Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshEvents}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.refreshButtonText}>🔄 Refresh Search Results</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator */}
        {(isGeneratingEvents || isGettingLocation) && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.generatingText}>
              {isGettingLocation ? '📍 Getting your location...' : '🔍 Searching for dance classes...'}
            </Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        )}

        {/* Dance Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>💃 Dance Categories</Text>
          
          {danceCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryCard, { backgroundColor: category.color }]}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryContent}>
                <View style={styles.categoryText}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Local Dance Classes Section */}
        {localEvents.length > 0 && (
          <View style={styles.localClassesSection}>
            <Text style={styles.sectionTitle}>💃 Dance Classes Near You</Text>
            
            {localEvents.slice(0, 6).map((event) => (
              <View key={event.id} style={styles.localClassCard}>
                <View style={styles.localClassInfo}>
                  <Text style={styles.localClassName}>{event.title}</Text>
                  <Text style={styles.localClassDetails}>
                    by {event.instructor} • {event.location}
                  </Text>
                </View>
                
                <View style={styles.localClassActions}>
                  <TouchableOpacity
                    style={styles.bookNowButton}
                    onPress={() => handleBookNow(event)}
                  >
                    <Text style={styles.bookNowButtonText}>Book Now</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleContact(event)}
                  >
                    <Text style={styles.contactButtonText}>Contact</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {localEvents.length > 6 && (
              <TouchableOpacity style={styles.viewAllButton} onPress={handleVideoLibrary}>
                <Text style={styles.viewAllButtonText}>
                  View All {localEvents.length} Classes
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Video Lessons Section */}
        {videos.length > 0 && (
          <View style={styles.videoLessonsSection}>
            <Text style={styles.sectionTitle}>💃 Video Lessons Available</Text>
            
            {videos.slice(0, 6).map((video) => (
              <View key={video.id} style={styles.videoLessonCard}>
                <View style={styles.videoLessonInfo}>
                  <Text style={styles.videoLessonTitle}>{video.title}</Text>
                  <Text style={styles.videoLessonDetails}>
                    by {video.instructorName} • {video.danceStyle.name}
                  </Text>
                </View>
                <Ionicons name="play" size={20} color="#fff" />
              </View>
            ))}
            
            {videos.length > 6 && (
              <TouchableOpacity style={styles.viewAllButton} onPress={handleVideoLibrary}>
                <Text style={styles.viewAllButtonText}>
                  View All {videos.length} Video Lessons
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Loading Events Section */}
        {isLoadingEvents && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.generatingText}>Searching for dance classes near you...</Text>
          </View>
        )}

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <Text style={styles.trustText}>✨ Trusted by dancers worldwide ✨</Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleVideoLibrary}>
        <Ionicons name="play" size={24} color="#000" />
      </TouchableOpacity>

      {/* Premium Upgrade Modal */}
      {showPremiumUpgrade && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upgrade to Premium</Text>
            <Text style={styles.modalMessage}>
              Get unlimited access to all dance classes, video lessons, and premium features!
            </Text>
            
            <TouchableOpacity
              style={styles.modalUpgradeButton}
              onPress={() => {
                setShowPremiumUpgrade(false);
                handleUpgradeToPremium();
              }}
            >
              <Text style={styles.modalUpgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowPremiumUpgrade(false)}
            >
              <Text style={styles.modalCancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#6A11CB',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
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
  videoHeroCard: {
    margin: 20,
    backgroundColor: '#6A11CB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  videoHeroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  videoHeroSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
  },
  videoHeroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'center',
  },
  videoHeroButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  locationSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#6A11CB',
  },
  locationSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  countryContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  countryDropdown: {
    marginBottom: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
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
    marginBottom: 8,
  },
  eventsSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
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
  eventInstructor: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
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
  sourceTag: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  sourceTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  visitWebsiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(106, 17, 203, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#6A11CB',
  },
  visitWebsiteText: {
    color: '#6A11CB',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
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
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6A11CB',
    width: '60%',
  },
  categoriesSection: {
    margin: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  categoryCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  localClassesSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  localClassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  localClassInfo: {
    marginBottom: 8,
  },
  localClassName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  localClassDetails: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 12,
  },
  localClassActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bookNowButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
  },
  bookNowButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  contactButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  videoLessonsSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  videoLessonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoLessonInfo: {
    flex: 1,
  },
  videoLessonTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  videoLessonDetails: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 12,
  },
  viewAllButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
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