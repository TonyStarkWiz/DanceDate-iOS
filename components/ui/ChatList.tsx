import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { Chat, chatService } from '@/services/chatService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  onBack?: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onChatSelect, onBack }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Load chats with real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = chatService.listenToUserChats((newChats) => {
      setChats(newChats);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user?.id]);

  // Refresh chats
  const handleRefresh = async () => {
    if (!user?.id) return;
    
    setRefreshing(true);
    try {
      const refreshedChats = await chatService.getUserChats();
      setChats(refreshedChats);
    } catch (error) {
      console.error('Error refreshing chats:', error);
      setToastMessage('Failed to refresh chats');
      setToastType('error');
      setShowToast(true);
    } finally {
      setRefreshing(false);
    }
  };

  // Get other participant name
  const getOtherParticipantName = (chat: Chat) => {
    if (!user?.id) return 'Unknown';
    
    const otherParticipantId = chat.participants.find(id => id !== user.id);
    return chat.participantNames?.[otherParticipantId || ''] || 'Unknown User';
  };

  // Get unread count for current user
  const getUnreadCount = (chat: Chat) => {
    if (!user?.id) return 0;
    return chat.unreadCount?.[user.id] || 0;
  };

  // Format last message time
  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render chat item
  const renderChatItem = ({ item: chat }: { item: Chat }) => {
    const otherParticipantName = getOtherParticipantName(chat);
    const unreadCount = getUnreadCount(chat);
    const isUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.chatItem, isUnread && styles.chatItemUnread]}
        onPress={() => onChatSelect(chat.id)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={[styles.avatar, isUnread && styles.avatarUnread]}>
          <Ionicons 
            name="person" 
            size={24} 
            color={isUnread ? '#fff' : '#666'} 
          />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, isUnread && styles.chatNameUnread]}>
              {otherParticipantName}
            </Text>
            <Text style={styles.chatTime}>
              {formatLastMessageTime(chat.lastMessageTime)}
            </Text>
          </View>
          
          <View style={styles.chatPreview}>
            <Text 
              style={[styles.lastMessage, isUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {chat.lastMessageSender && chat.lastMessageSender !== 'system' 
                ? `${chat.lastMessageSender}: ${chat.lastMessage}`
                : chat.lastMessage
              }
            </Text>
            
            {chat.eventName && (
              <View style={styles.eventBadge}>
                <Ionicons name="calendar" size={12} color="#6A11CB" />
                <Text style={styles.eventBadgeText}>{chat.eventName}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-ellipses" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Chats Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start matching with dance partners to begin chatting!
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        <Text style={styles.headerTitle}>Messages</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6A11CB']}
            tintColor="#6A11CB"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  chatItemUnread: {
    backgroundColor: '#f0f8ff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarUnread: {
    backgroundColor: '#6A11CB',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  chatNameUnread: {
    fontWeight: '600',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  lastMessageUnread: {
    color: '#333',
    fontWeight: '500',
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventBadgeText: {
    fontSize: 12,
    color: '#6A11CB',
    marginLeft: 4,
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});
