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

// Mock data for formal ball events - replace with real API calls later
const mockFormalBallEvents = [
  {
    id: '1',
    title: 'Annual Charity Gala Ball',
    instructor: 'Madame Victoria',
    location: 'Grand Ballroom, Downtown',
    date: 'December 15, 2024',
    time: '7:00 PM',
    price: '$150',
    danceStyles: ['Waltz', 'Foxtrot', 'Tango'],
    description: 'Elegant charity ball supporting local arts foundation',
    imageUrl: null,
  },
  {
    id: '2',
    title: 'Masquerade Mystery Ball',
    instructor: 'Count Sebastian',
    location: 'Historic Opera House',
    date: 'January 20, 2025',
    time: '8:00 PM',
    price: '$200',
    danceStyles: ['Waltz', 'Viennese Waltz', 'Polka'],
    description: 'Enchanting masquerade ball with live orchestra',
    imageUrl: null,
  },
  {
    id: '3',
    title: 'Viennese Waltz Ball',
    instructor: 'Professor Strauss',
    location: 'Imperial Ballroom',
    date: 'February 14, 2025',
    time: '6:30 PM',
    price: '$180',
    danceStyles: ['Viennese Waltz', 'Waltz', 'Quickstep'],
    description: 'Traditional Viennese waltz celebration',
    imageUrl: null,
  },
];

export const BallScreen: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [postalCode, setPostalCode] = useState('');
  const [isPostalCodeValid, setIsPostalCodeValid] = useState(false);
  const [showAiGeneratedEvents, setShowAiGeneratedEvents] = useState(false);
  const [aiGeneratedEvents, setAiGeneratedEvents] = useState(mockFormalBallEvents);
  const [isGeneratingEvents, setIsGeneratingEvents] = useState(false);
  const [specializedRemainingSearches, setSpecializedRemainingSearches] = useState(3);
  const [showSpecializedPaywall, setShowSpecializedPaywall] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleUseMyLocation = () => {
    Alert.alert(
      'Use My Location',
      'This would use your GPS location to find formal ball events nearby.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Location',
          onPress: () => {
            setIsGeneratingEvents(true);
            // Simulate AI event generation
            setTimeout(() => {
              setShowAiGeneratedEvents(true);
              setIsGeneratingEvents(false);
            }, 2000);
          },
        },
      ]
    );
  };

  const handleSearchByCode = () => {
    if (selectedCountry && postalCode && isPostalCodeValid) {
      setIsGeneratingEvents(true);
      // Simulate AI event generation
      setTimeout(() => {
        setShowAiGeneratedEvents(true);
        setIsGeneratingEvents(false);
      }, 2000);
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid postal code and select a country.');
    }
  };

  const handleSpecializedSearch = (searchType: string) => {
    if (specializedRemainingSearches > 0) {
      setSpecializedRemainingSearches(prev => prev - 1);
      setIsGeneratingEvents(true);
      
      // Simulate specialized search
      setTimeout(() => {
        setShowAiGeneratedEvents(true);
        setIsGeneratingEvents(false);
        Alert.alert('Search Complete', `Found ${searchType} events in your area!`);
      }, 1500);
    } else {
      setShowSpecializedPaywall(true);
    }
  };

  const handleRefreshEvents = () => {
    setIsGeneratingEvents(true);
    setTimeout(() => {
      setIsGeneratingEvents(false);
      Alert.alert('Refreshed', 'Formal ball events have been refreshed!');
    }, 1000);
  };

  const handleEventPress = (event: any) => {
    router.push(`/eventDetail/${event.title}/${event.instructor}/${event.location}`);
  };

  const handleUpgradeToPremium = () => {
    router.push('/(tabs)/premium');
  };

  const handleUpgradeSpecialized = (tier: string) => {
    setShowSpecializedPaywall(false);
    Alert.alert('Upgrade Complete', `You've been upgraded to ${tier}!`);
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
          <View style={styles.postalCodeContainer}>
            <Ionicons name="location" size={20} color="#6A4C93" />
            <TextInput
              style={styles.postalCodeInput}
              placeholder="Enter postal code"
              placeholderTextColor="#999"
              value={postalCode}
              onChangeText={setPostalCode}
              onEndEditing={() => setIsPostalCodeValid(postalCode.length >= 3)}
            />
          </View>

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

        {/* AI-Generated Events Section */}
        {showAiGeneratedEvents && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsTitle}>🎩 AI-Generated Formal Ball Events</Text>
            
            {aiGeneratedEvents.map((event) => (
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
                  {event.danceStyles.map((style, index) => (
                    <View key={index} style={styles.styleTag}>
                      <Text style={styles.styleTagText}>{style}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={styles.eventDescription}>{event.description}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshEvents}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.refreshButtonText}>🔄 Refresh AI Events</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator */}
        {isGeneratingEvents && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.generatingText}>🎩 Generating AI formal ball events...</Text>
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
              You've used all your free specialized searches. Upgrade to premium for unlimited access!
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
