import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// Enhanced mock event data with conversion elements
const mockEvents = [
  {
    id: '1',
    title: 'Salsa Night at Latin Club',
    instructor: 'Maria Rodriguez',
    location: 'New York, NY',
    date: '2024-01-15',
    time: '8:00 PM',
    price: '$25',
    originalPrice: '$35',
    description: 'Join us for an exciting night of salsa dancing! All levels welcome.',
    tags: ['Salsa', 'Latin', 'Social'],
    attendees: 47,
    spotsLeft: 8,
    rating: 4.8,
    reviews: 124,
    isHot: true,
    isNew: false,
    discount: '28% OFF',
    urgency: 'Only 8 spots left!',
    socialProof: '🔥 47 people attending • ⭐ 4.8/5 (124 reviews)',
    valueProp: 'Learn from NYC\'s top salsa instructor',
    sample: true
  },
  {
    id: '2',
    title: 'Bachata Workshop',
    instructor: 'Carlos Mendez',
    location: 'Los Angeles, CA',
    date: '2024-01-20',
    time: '2:00 PM',
    price: '$40',
    originalPrice: '$60',
    description: 'Learn the sensual art of bachata in this comprehensive workshop.',
    tags: ['Bachata', 'Workshop', 'Latin'],
    attendees: 23,
    spotsLeft: 12,
    rating: 4.9,
    reviews: 89,
    isHot: false,
    isNew: true,
    discount: '33% OFF',
    urgency: 'New workshop - limited spots!',
    socialProof: '🎯 23 people attending • ⭐ 4.9/5 (89 reviews)',
    valueProp: 'Master bachata fundamentals in one session',
    sample: true
  },
  {
    id: '3',
    title: 'Kizomba Party',
    instructor: 'Ana Silva',
    location: 'Miami, FL',
    date: '2024-01-25',
    time: '9:00 PM',
    price: '$30',
    originalPrice: '$45',
    description: 'Experience the rhythm of Kizomba in an authentic African dance setting.',
    tags: ['Kizomba', 'African', 'Party'],
    attendees: 34,
    spotsLeft: 6,
    rating: 4.7,
    reviews: 156,
    isHot: true,
    isNew: false,
    discount: '33% OFF',
    urgency: '🔥 HOT EVENT - Only 6 spots left!',
    socialProof: '💃 34 people attending • ⭐ 4.7/5 (156 reviews)',
    valueProp: 'Authentic African dance experience',
    sample: false
  },
];

export default function EventListScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchCount, setSearchCount] = useState(3);
  const [maxSearches] = useState(5);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleEventPress = (event: typeof mockEvents[0]) => {
    Alert.alert(
      '🎉 Join This Event!',
      `Ready to dance with ${event.attendees} other dancers?\n\n${event.valueProp}`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { 
          text: 'I\'m Interested! 💃', 
          style: 'default',
          onPress: () => {
            Alert.alert(
              '🎯 Perfect!',
              `You're now interested in "${event.title}"!\n\nWe'll notify you when matches are found and help you connect with other dancers.`,
              [{ text: 'Awesome!', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const handleUpgrade = () => {
    Alert.alert(
      '🚀 Upgrade to Premium!',
      'Get unlimited searches, priority matching, and exclusive events!\n\n• Unlimited event searches\n• Priority matching algorithm\n• Exclusive premium events\n• Advanced filtering options',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Upgrade Now! 💎', style: 'default' }
      ]
    );
  };

  const renderEvent = ({ item }: { item: typeof mockEvents[0] }) => (
    <View style={styles.eventCard}>
      {/* Event Header with Badges */}
      <View style={styles.eventHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={styles.badgeContainer}>
            {item.isHot && <View style={[styles.badge, styles.hotBadge]}>
              <Text style={styles.badgeText}>🔥 HOT</Text>
            </View>}
            {item.isNew && <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.badgeText}>✨ NEW</Text>
            </View>}
            {item.sample && <View style={[styles.badge, styles.sampleBadge]}>
              <Text style={styles.badgeText}>SAMPLE</Text>
            </View>}
          </View>
        </View>
        
        <View style={styles.priceSection}>
          <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          <Text style={styles.eventPrice}>${item.price}</Text>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      </View>

      {/* Instructor & Social Proof */}
      <View style={styles.instructorSection}>
        <Text style={styles.instructorText}>by {item.instructor}</Text>
        <Text style={styles.socialProofText}>{item.socialProof}</Text>
      </View>

      {/* Location & Description */}
      <View style={styles.locationSection}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Date & Time */}
      <View style={styles.dateSection}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.dateText}>Date TBD</Text>
        </View>
      </View>

      {/* Urgency Banner */}
      <View style={styles.urgencyBanner}>
        <Text style={styles.urgencyText}>⚡ {item.urgency}</Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity 
        style={styles.ctaButton}
        onPress={() => handleEventPress(item)}
      >
        <Ionicons name="heart" size={20} color="#fff" />
        <Text style={styles.ctaButtonText}>I'm Interested</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>💃 Dance Events 🕺</Text>
          <Text style={styles.heroSubtitle}>3 events found</Text>
          
          {/* Search Stats */}
          <View style={styles.searchStats}>
            <Text style={styles.searchStatsText}>
              Searches today: {searchCount}/{maxSearches}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="location" size={16} color="#4A148C" />
          <Text style={styles.actionButtonText}>Use GPS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="search" size={16} color="#4A148C" />
          <Text style={styles.actionButtonText}>Postal Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="refresh" size={16} color="#4A148C" />
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle" size={16} color="#4A148C" />
          <Text style={styles.actionButtonText}>Guide</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
          <Ionicons name="diamond" size={16} color="#FFD700" />
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <FlatList
        data={mockEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.eventList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* What's Next Section */}
      <View style={styles.whatsNextSection}>
        <Text style={styles.whatsNextTitle}>→ What's Next?</Text>
        
        <View style={styles.nextActions}>
          <TouchableOpacity style={styles.nextActionCard}>
            <View style={styles.nextActionIcon}>
              <Text style={styles.nextActionIconText}>👥</Text>
            </View>
            <View style={styles.nextActionContent}>
              <Text style={styles.nextActionTitle}>Find Partners</Text>
              <Text style={styles.nextActionSubtitle}>Connect with event attendees</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4A148C" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.nextActionCard}
            onPress={() => router.push('/(tabs)/matches')}
          >
            <View style={styles.nextActionIcon}>
              <Text style={styles.nextActionIconText}>💜</Text>
            </View>
            <View style={styles.nextActionContent}>
              <Text style={styles.nextActionTitle}>Your Matches</Text>
              <Text style={styles.nextActionSubtitle}>See who you've matched with</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4A148C" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextActionCard}>
            <View style={styles.nextActionIcon}>
              <Text style={styles.nextActionIconText}>👤</Text>
            </View>
            <View style={styles.nextActionContent}>
              <Text style={styles.nextActionTitle}>Your Profile</Text>
              <Text style={styles.nextActionSubtitle}>Update your preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4A148C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Hero Header
  heroHeader: {
    backgroundColor: '#4A148C',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
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
  },
  searchStats: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchStatsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4A148C',
    marginLeft: 4,
    fontWeight: '500',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFD700',
  },
  upgradeButtonText: {
    fontSize: 12,
    color: '#4A148C',
    marginLeft: 4,
    fontWeight: 'bold',
  },

  // Event List
  eventList: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hotBadge: {
    backgroundColor: '#FF5722',
  },
  newBadge: {
    backgroundColor: '#4CAF50',
  },
  sampleBadge: {
    backgroundColor: '#FF9800',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  eventPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  discountText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  // Instructor & Social Proof
  instructorSection: {
    marginBottom: 12,
  },
  instructorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  socialProofText: {
    fontSize: 12,
    color: '#4A148C',
    fontWeight: '500',
  },

  // Location & Description
  locationSection: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#4A148C',
    fontWeight: '500',
  },

  // Date Section
  dateSection: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },

  // Urgency Banner
  urgencyBanner: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  urgencyText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: 'bold',
  },

  // CTA Button
  ctaButton: {
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
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // What's Next Section
  whatsNextSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  whatsNextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  nextActions: {
    gap: 12,
  },
  nextActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nextActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nextActionIconText: {
    fontSize: 20,
  },
  nextActionContent: {
    flex: 1,
  },
  nextActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  nextActionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});




