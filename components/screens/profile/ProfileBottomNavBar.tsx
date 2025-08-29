import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export const ProfileBottomNavBar: React.FC = () => {
  const handleHomePress = () => {
    router.push('/postLoginWelcome');
  };

  const handleEventsPress = () => {
    router.push('/eventList');
  };

  const handlePartnersPress = () => {
    router.push('/dancePartners');
  };

  const handleFeedPress = () => {
    router.push('/feed');
  };

  const handleProfilePress = () => {
    // Already on profile screen
    console.log('Already on profile screen');
  };

  return (
    <View style={styles.container}>
      {/* Navigation Items */}
      <View style={styles.navItems}>
        <TouchableOpacity style={styles.navItem} onPress={handleHomePress}>
          <Ionicons name="home-outline" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleEventsPress}>
          <Ionicons name="calendar-outline" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handlePartnersPress}>
          <Ionicons name="people-outline" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Partners</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleFeedPress}>
          <Ionicons name="grid-outline" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={handleProfilePress}>
          <Ionicons name="person" size={24} color="#6A4C93" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingBottom: 20, // Extra padding for safe area
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    minWidth: 60,
  },
  activeNavItem: {
    // Active state styling
  },
  navLabel: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 4,
    textAlign: 'center',
  },
  activeNavLabel: {
    color: '#6A4C93',
    fontWeight: '600',
  },
});

