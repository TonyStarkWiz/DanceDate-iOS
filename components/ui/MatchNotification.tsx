import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface MatchNotificationProps {
  visible: boolean;
  match: {
    partnerName: string;
    eventTitle: string;
    chatId?: string;
    partnerId: string;
  };
  onClose: () => void;
  onStartChat: () => void;
}

export const MatchNotification: React.FC<MatchNotificationProps> = ({
  visible,
  match,
  onClose,
  onStartChat
}) => {
  const [animation] = useState(new Animated.Value(0));
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (visible) {
      // Start entrance animation
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();

      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      animation.setValue(0);
    }
  }, [visible]);

  const handleStartChat = () => {
    onStartChat();
    onClose();
  };

  const handleViewProfile = () => {
    setShowDetails(true);
  };

  const handleDismiss = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.notification,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-300, 0]
                  })
                }
              ],
              opacity: animation
            }
          ]}
        >
          {/* Header with close button */}
          <View style={styles.header}>
            <View style={styles.closeButton} onTouchEnd={handleDismiss}>
              <Ionicons name="close" size={20} color="#fff" />
            </View>
          </View>

          {/* Main content */}
          <View style={styles.content}>
            {/* Success icon */}
            <View style={styles.successIcon}>
              <Ionicons name="heart" size={40} color="#fff" />
            </View>

            {/* Title */}
            <Text style={styles.title}>🎉 You Matched!</Text>

            {/* Partner info */}
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{match.partnerName}</Text>
              <Text style={styles.eventTitle}>"{match.eventTitle}"</Text>
            </View>

            {/* Social proof */}
            <View style={styles.socialProof}>
              <Text style={styles.socialProofText}>
                💫 95% match compatibility
              </Text>
              <Text style={styles.socialProofSubtext}>
                You both love the same dance style!
              </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleStartChat}
              >
                <Ionicons name="chatbubble" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Start Chat Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleViewProfile}
              >
                <Text style={styles.secondaryButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Urgency message */}
            <View style={styles.urgency}>
              <Text style={styles.urgencyText}>
                ⏰ Don't wait too long - great matches are rare!
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Profile details modal */}
        <Modal
          visible={showDetails}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDetails(false)}
        >
          <View style={styles.profileOverlay}>
            <View style={styles.profileModal}>
              <View style={styles.profileHeader}>
                <Text style={styles.profileTitle}>Partner Profile</Text>
                <TouchableOpacity onPress={() => setShowDetails(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileContent}>
                <Text style={styles.profileName}>{match.partnerName}</Text>
                <Text style={styles.profileEvent}>Interested in: {match.eventTitle}</Text>
                <Text style={styles.profileBio}>
                  This person shares your passion for dance and is looking for a partner for the same event!
                </Text>
              </View>

              <TouchableOpacity
                style={styles.profileChatButton}
                onPress={handleStartChat}
              >
                <Text style={styles.profileChatButtonText}>Start Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  notification: {
    backgroundColor: '#6A11CB',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2ed573',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  partnerInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 16,
    color: '#E1BEE7',
    fontStyle: 'italic',
  },
  socialProof: {
    alignItems: 'center',
    marginBottom: 20,
  },
  socialProofText: {
    fontSize: 16,
    color: '#2ed573',
    fontWeight: '600',
    marginBottom: 5,
  },
  socialProofSubtext: {
    fontSize: 14,
    color: '#E1BEE7',
  },
  actions: {
    width: '100%',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#2ed573',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  urgency: {
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 12,
    color: '#FFA502',
    fontStyle: 'italic',
  },
  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    maxWidth: 350,
    width: '100%',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileContent: {
    marginBottom: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  profileEvent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  profileChatButton: {
    backgroundColor: '#6A11CB',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  profileChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

