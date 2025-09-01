import { EventMatchSuggestion } from '@/services/eventBasedMatchingService';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface EventMatchModalProps {
  visible: boolean;
  match: EventMatchSuggestion | null;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
  onStartChat: (userId: string) => void;
  onDismiss: () => void;
}

const { width, height } = Dimensions.get('window');

export const EventMatchModal: React.FC<EventMatchModalProps> = ({
  visible,
  match,
  onClose,
  onViewProfile,
  onStartChat,
  onDismiss,
}) => {
  if (!match) return null;

  const handleViewProfile = () => {
    onClose();
    onViewProfile(match.userId);
  };

  const handleStartChat = () => {
    onClose();
    onStartChat(match.userId);
  };

  const handleDismiss = () => {
    onClose();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header with close button */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Match celebration content */}
          <View style={styles.content}>
            {/* Celebration icon */}
            <View style={styles.celebrationContainer}>
              <View style={styles.celebrationIcon}>
                <Ionicons name="heart" size={40} color="#ff4757" />
              </View>
              <Text style={styles.celebrationText}>🎉 It's a Match! 🎉</Text>
            </View>

            {/* Match info */}
            <View style={styles.matchInfo}>
              <Text style={styles.matchTitle}>
                You matched with {match.potentialPartner.name}!
              </Text>
              <Text style={styles.matchSubtitle}>
                You both are interested in the same events
              </Text>
            </View>

            {/* Match strength */}
            <View style={styles.matchStrengthContainer}>
              <Text style={styles.matchStrengthLabel}>Match Strength</Text>
              <View style={styles.matchStrengthBar}>
                <View 
                  style={[
                    styles.matchStrengthFill, 
                    { width: `${match.matchStrength}%` }
                  ]} 
                />
              </View>
              <Text style={styles.matchStrengthText}>{match.matchStrength}%</Text>
            </View>

            {/* Shared events */}
            <View style={styles.sharedEventsContainer}>
              <Text style={styles.sharedEventsTitle}>Shared Event Interests</Text>
              <ScrollView 
                style={styles.sharedEventsList}
                showsVerticalScrollIndicator={false}
              >
                {match.sharedEvents.map((event, index) => (
                  <View key={index} style={styles.sharedEventItem}>
                    <Ionicons name="calendar-outline" size={16} color="#6A11CB" />
                    <Text style={styles.sharedEventText} numberOfLines={2}>
                      {event.eventTitle}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Common interests */}
            {match.commonInterests.length > 0 && (
              <View style={styles.commonInterestsContainer}>
                <Text style={styles.commonInterestsTitle}>Common Interests</Text>
                <View style={styles.interestsList}>
                  {match.commonInterests.slice(0, 3).map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
              <Ionicons name="close-circle-outline" size={20} color="#666" />
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>

            <View style={styles.primaryActions}>
              <TouchableOpacity style={styles.profileButton} onPress={handleViewProfile}>
                <Ionicons name="person-outline" size={20} color="#fff" />
                <Text style={styles.profileButtonText}>View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
                <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                <Text style={styles.chatButtonText}>Start Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  matchSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  matchStrengthContainer: {
    marginBottom: 20,
  },
  matchStrengthLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  matchStrengthBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 5,
  },
  matchStrengthFill: {
    height: '100%',
    backgroundColor: '#6A11CB',
    borderRadius: 4,
  },
  matchStrengthText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  sharedEventsContainer: {
    marginBottom: 20,
  },
  sharedEventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  sharedEventsList: {
    maxHeight: 100,
  },
  sharedEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  sharedEventText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  commonInterestsContainer: {
    marginBottom: 20,
  },
  commonInterestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#6A11CB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  interestText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 15,
  },
  dismissButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A11CB',
    paddingVertical: 12,
    borderRadius: 10,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4757',
    paddingVertical: 12,
    borderRadius: 10,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});


