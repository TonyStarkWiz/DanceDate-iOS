import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PartnerProfileRoute() {
  const { partnerId } = useLocalSearchParams<{
    partnerId: string;
  }>();

  // Mock partner data - replace with real API call
  const partner = {
    id: partnerId,
    name: 'Maria Rodriguez',
    imageUrl: null,
    bio: 'Professional salsa dancer with 8 years of experience. Love teaching beginners and sharing the joy of Latin dance!',
    danceStyles: ['Salsa', 'Bachata', 'Kizomba'],
    experience: '8 years',
    location: 'Downtown',
    interests: ['Teaching', 'Social Dancing', 'Latin Music', 'Cultural Exchange'],
    upcomingEvents: [
      'Salsa Night at Latin Club - Jan 15',
      'Bachata Workshop - Jan 18',
      'Kizomba Social - Jan 20',
    ],
  };

  const handleStartChat = () => {
    router.push({
      pathname: '/chat/[partnerId]',
      params: {
        partnerId: partner.id,
      },
    });
  };

  const handleViewEvents = () => {
    router.push('/(tabs)/eventList');
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
        <Text style={styles.headerTitle}>Partner Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {partner.imageUrl ? (
              <Image
                source={{ uri: partner.imageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={64} color="#fff" />
              </View>
            )}
          </View>
          
          <Text style={styles.partnerName}>{partner.name}</Text>
          <Text style={styles.partnerLocation}>{partner.location}</Text>
          <Text style={styles.partnerExperience}>{partner.experience} experience</Text>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{partner.bio}</Text>
        </View>

        {/* Dance Styles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dance Styles</Text>
          <View style={styles.danceStylesList}>
            {partner.danceStyles.map((style, index) => (
              <View key={index} style={styles.danceStyleTag}>
                <Text style={styles.danceStyleText}>{style}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsList}>
            {partner.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {partner.upcomingEvents.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Ionicons name="calendar" size={16} color="#6A4C93" />
              <Text style={styles.eventText}>{event}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
            <Ionicons name="chatbubble" size={20} color="#fff" />
            <Text style={styles.chatButtonText}>Start Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.eventsButton} onPress={handleViewEvents}>
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.eventsButtonText}>View Events</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#6A4C93',
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#2A2A2A',
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6A4C93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  partnerLocation: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  partnerExperience: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  section: {
    padding: 20,
    backgroundColor: '#2A2A2A',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  bioText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  danceStylesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  danceStyleTag: {
    backgroundColor: '#6A4C93',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  danceStyleText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#3A3A3A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    color: '#ccc',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  eventsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A4C93',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  eventsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

