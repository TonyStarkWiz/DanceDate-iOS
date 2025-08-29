import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EventDetailRoute() {
  const { title, instructor, location } = useLocalSearchParams<{
    title: string;
    instructor: string;
    location: string;
  }>();

  const handleBookEvent = () => {
    Alert.alert(
      'Book Event',
      `Would you like to book "${title}" with ${instructor}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => {
            router.push('/bookingConfirmation/[eventTitle]');
          }
        },
      ]
    );
  };

  const handleMarkInterested = () => {
    Alert.alert('Interested', 'You\'ve marked this event as interested!');
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
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Image Placeholder */}
        <View style={styles.imagePlaceholder}>
          <Ionicons name="calendar" size={64} color="#8B5CF6" />
          <Text style={styles.imagePlaceholderText}>Event Image</Text>
        </View>

        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{title}</Text>
          <Text style={styles.eventInstructor}>with {instructor}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#666" />
            <Text style={styles.infoText}>{location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#666" />
            <Text style={styles.infoText}>January 15, 2024 at 8:00 PM</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="musical-notes" size={20} color="#666" />
            <Text style={styles.infoText}>Salsa</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#666" />
            <Text style={styles.infoText}>$25</Text>
          </View>
        </View>

        {/* Event Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.descriptionText}>
            Join us for an amazing salsa night with professional instruction and social dancing! 
            This event is perfect for dancers of all levels, from beginners to advanced. 
            You'll learn new moves, practice with partners, and enjoy the vibrant Latin music atmosphere.
          </Text>
        </View>

        {/* Instructor Bio */}
        <View style={styles.instructorSection}>
          <Text style={styles.sectionTitle}>About the Instructor</Text>
          <View style={styles.instructorCard}>
            <View style={styles.instructorAvatar}>
              <Ionicons name="person" size={32} color="#8B5CF6" />
            </View>
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>{instructor}</Text>
              <Text style={styles.instructorBio}>
                Professional salsa dancer with over 10 years of experience. 
                Specializes in Cuban and LA style salsa, known for clear instruction 
                and patient teaching approach.
              </Text>
            </View>
          </View>
        </View>

        {/* What to Bring */}
        <View style={styles.whatToBringSection}>
          <Text style={styles.sectionTitle}>What to Bring</Text>
          <View style={styles.bringItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.bringText}>Comfortable dance shoes</Text>
          </View>
          <View style={styles.bringItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.bringText}>Water bottle</Text>
          </View>
          <View style={styles.bringItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.bringText}>Positive attitude</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.interestedButton} onPress={handleMarkInterested}>
          <Ionicons name="heart-outline" size={24} color="#8B5CF6" />
          <Text style={styles.interestedButtonText}>Interested</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bookButton} onPress={handleBookEvent}>
          <Text style={styles.bookButtonText}>Book Event</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  content: {
    flex: 1,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  eventInfo: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventInstructor: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  descriptionSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  instructorSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructorBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  whatToBringSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 100, // Space for bottom bar
  },
  bringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bringText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  interestedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    marginRight: 16,
  },
  interestedButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 8,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});


