import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ChatList } from '@/components/ui/ChatList';
import { ChatRoom } from '@/components/ui/ChatRoom';
import { chatService } from '@/services/chatService';
import { Toast } from '@/components/ui/Toast';

export const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'list' | 'room'>('list');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setCurrentView('room');
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentView === 'room') {
      setCurrentView('list');
      setSelectedChatId(null);
    }
  };

  // Check for new matches and create chats
  useEffect(() => {
    if (!user?.id) return;

    const checkForNewMatches = async () => {
      try {
        setIsLoading(true);
        
        // Get user's unread message count
        const unreadCount = await chatService.getUnreadCount(user.id);
        
        if (unreadCount > 0) {
          setToastMessage(`You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`);
          setToastType('info');
          setShowToast(true);
        }
        
      } catch (error) {
        console.error('Error checking for new matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkForNewMatches();
  }, [user?.id]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Ionicons name="chatbubble-ellipses" size={64} color="#ccc" />
          <Text style={styles.authTitle}>Sign In to Chat</Text>
          <Text style={styles.authSubtitle}>
            Connect with your dance partners and start conversations!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {currentView === 'list' ? (
        <ChatList
          onChatSelect={handleChatSelect}
          onBack={handleBack}
        />
      ) : selectedChatId ? (
        <ChatRoom
          chatId={selectedChatId}
          onBack={handleBack}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      )}

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});


