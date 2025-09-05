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

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleUseMyLocation = () => {
    Alert.alert(
      'Use My Location',
      'This would use your GPS location to find dance classes nearby.',
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

  const handleRefreshEvents = () => {
    setIsGeneratingEvents(true);
    setTimeout(() => {
      setIsGeneratingEvents(false);
      Alert.alert('Refreshed', 'Dance class events have been refreshed!');
    }, 1000);
  };

  const handleEventPress = (event: any) => {
    router.push(`/eventDetail/${event.title}/${event.instructor}/${event.location}`);
  };

  const handleUpgradeToPremium = () => {
    router.push('/(tabs)/premium');
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
    router.push('/video_library');
  };

  const handleVideoUpload = () => {
    router.push('/video_upload');
  };

  const handleVideoDebug = () => {
    router.push('/video_debug');
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

        {/* AI-Generated Events Section */}
        {showAiGeneratedEvents && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsTitle}>💃 AI-Generated Dance Class Events</Text>
            
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
                  <View style={styles.styleTag}>
                    <Text style={styles.styleTagText}>{event.danceStyle}</Text>
                  </View>
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
            <Text style={styles.generatingText}>💃 Generating AI dance class events...</Text>
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

import { BackButton } from '../ui/BackButton';
      <BackButton />