import { BottomNavBar } from '@/components/ui/BottomNavBar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock data for events - replace with real API calls later
const mockEvents = [
  {
    id: '1',
    title: 'Salsa Night at Latin Club',
    instructor: 'Maria Rodriguez',
    location: 'Latin Club, Downtown',
    date: '2024-01-15',
    time: '8:00 PM',
    price: '$25',
    danceStyle: 'Salsa',
    description: 'Join us for an amazing salsa night with professional instruction and social dancing!',
    image: null,
  },
  {
    id: '2',
    title: 'Bachata Workshop',
    instructor: 'Carlos Mendez',
    location: 'Dance Studio West',
    date: '2024-01-18',
    time: '7:00 PM',
    price: '$35',
    danceStyle: 'Bachata',
    description: 'Learn the sensual moves of bachata in this beginner-friendly workshop.',
    image: null,
  },
  {
    id: '3',
    title: 'Kizomba Social',
    instructor: 'Ana Silva',
    location: 'African Dance Center',
    date: '2024-01-20',
    time: '9:00 PM',
    price: '$20',
    danceStyle: 'Kizomba',
    description: 'Experience the smooth and romantic rhythm of Kizomba with live music.',
    image: null,
  },
  {
    id: '4',
    title: 'Ballroom Basics',
    instructor: 'James Wilson',
    location: 'Grand Ballroom',
    date: '2024-01-22',
    time: '6:30 PM',
    price: '$40',
    danceStyle: 'Ballroom',
    description: 'Master the fundamentals of waltz, foxtrot, and tango in this comprehensive class.',
    image: null,
  },
];

interface Event {
  id: string;
  title: string;
  instructor: string;
  location: string;
  date: string;
  time: string;
  price: string;
  danceStyle: string;
  description: string;
  image: string | null;
}

export const EventListScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDanceStyle, setSelectedDanceStyle] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [radius, setRadius] = useState(25);

  const danceStyles = ['All', 'Salsa', 'Bachata', 'Kizomba', 'Ballroom', 'Hip Hop', 'Contemporary'];

  useEffect(() => {
    // Load events from API here
    console.log('EventListScreen mounted');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: '/eventDetail/[title]/[instructor]/[location]',
      params: {
        title: event.title,
        instructor: event.instructor,
        location: event.location,
      },
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setEvents(mockEvents);
    } else {
      const filtered = mockEvents.filter(
        event =>
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.instructor.toLowerCase().includes(query.toLowerCase()) ||
          event.location.toLowerCase().includes(query.toLowerCase()) ||
          event.danceStyle.toLowerCase().includes(query.toLowerCase())
      );
      setEvents(filtered);
    }
  };

  const handleDanceStyleFilter = (style: string) => {
    if (style === 'All') {
      setSelectedDanceStyle(null);
      setEvents(mockEvents);
    } else {
      setSelectedDanceStyle(style);
      const filtered = mockEvents.filter(event => event.danceStyle === style);
      setEvents(filtered);
    }
  };

  const handleUseMyLocation = () => {
    Alert.alert(
      'Location Access',
      'This feature will use your current location to find nearby events.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Allow', onPress: () => console.log('Location access granted') },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
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
        <Text style={styles.headerTitle}>Events Near You</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, instructors, or locations..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
        </View>

        {/* Dance Style Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {danceStyles.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.filterChip,
                selectedDanceStyle === style && styles.filterChipActive,
              ]}
              onPress={() => handleDanceStyleFilter(style)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedDanceStyle === style && styles.filterChipTextActive,
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Location and Radius */}
        <View style={styles.locationContainer}>
          <TouchableOpacity style={styles.locationButton} onPress={handleUseMyLocation}>
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.locationButtonText}>Use My Location</Text>
          </TouchableOpacity>
          
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>Radius: {radius} miles</Text>
            <View style={styles.radiusSlider}>
              <TouchableOpacity
                style={styles.radiusButton}
                onPress={() => setRadius(Math.max(5, radius - 5))}
              >
                <Ionicons name="remove" size={16} color="#8B5CF6" />
              </TouchableOpacity>
              <View style={styles.radiusTrack}>
                <View style={[styles.radiusFill, { width: `${(radius / 50) * 100}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.radiusButton}
                onPress={() => setRadius(Math.min(50, radius + 5))}
              >
                <Ionicons name="add" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.eventsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Events Found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search criteria or expanding your radius
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
            >
              <View style={styles.eventHeader}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventInstructor}>with {event.instructor}</Text>
                </View>
                <View style={styles.eventPrice}>
                  <Text style={styles.priceText}>{event.price}</Text>
                </View>
              </View>

              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {formatDate(event.date)} at {event.time}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="musical-notes" size={16} color="#666" />
                  <Text style={styles.detailText}>{event.danceStyle}</Text>
                </View>
              </View>

              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>

              <View style={styles.eventActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="heart-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.actionButtonText}>Interested</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      
      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#8B5CF6',
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
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  radiusContainer: {
    alignItems: 'center',
  },
  radiusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  radiusSlider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radiusButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  radiusTrack: {
    width: 60,
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  radiusFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventInfo: {
    flex: 1,
    marginRight: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventInstructor: {
    fontSize: 14,
    color: '#666',
  },
  eventPrice: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
