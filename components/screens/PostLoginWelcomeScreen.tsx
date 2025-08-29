import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const PostLoginWelcomeScreen: React.FC = () => {
  useEffect(() => {
    console.log('🧪 PostLoginWelcomeScreen mounted');
  }, []);
  const handleSeeEvents = () => {
    console.log('🧪 Navigating to event list screen');
    router.push('/eventList');
  };

  const handleMeetPartners = () => {
    console.log('🧪 Navigating to dance partners screen');
    router.push('/dancePartners');
  };

  const handleViewPosts = () => {
    console.log('🧪 Navigating to feed screen');
    router.push('/feed');
  };

  const handleEditProfile = () => {
    console.log('🧪 Navigating to profile edit');
    router.push('/edit_profile');
  };

  return (
    <View style={styles.container}>
      {/* Edit Profile Button */}
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Ionicons name="pencil" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Welcome Message */}
      <Text style={styles.welcomeTitle}>Welcome to DanceDate!</Text>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSeeEvents}>
          <Text style={styles.buttonText}>See Events Near You</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleMeetPartners}>
          <Text style={styles.buttonText}>Meet Dance Partners</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleViewPosts}>
          <Text style={styles.buttonText}>View Trending Posts</Text>
        </TouchableOpacity>
      </View>

      {/* Continue to App Button */}
      <TouchableOpacity style={styles.continueButton} onPress={() => router.push('/(tabs)')}>
        <Text style={styles.continueButtonText}>Continue to App</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6', // Purple background matching the screenshot
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A78BFA', // Lighter purple for the edit button
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 60,
    marginTop: 100,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  actionButton: {
    backgroundColor: '#A78BFA', // Lighter purple for buttons
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonText: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '600',
  },
});
