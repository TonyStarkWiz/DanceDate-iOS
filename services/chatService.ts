import { COLLECTIONS, db } from '@/config/firebase';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    deleteDoc,
    writeBatch
} from 'firebase/firestore';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: Date;
  type: 'text' | 'image' | 'event' | 'system';
  read: boolean;
  eventId?: string; // For event-related messages
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames?: { [userId: string]: string };
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSender?: string;
  eventId?: string;
  eventName?: string;
  isActive: boolean;
  createdAt: Date;
  matchId?: string; // Link to the match that created this chat
  unreadCount?: { [userId: string]: number };
}

export interface ChatRoom {
  id: string;
  chat: Chat;
  messages: Message[];
  isTyping?: { [userId: string]: boolean };
}

class ChatService {
  private typingUsers = new Map<string, Set<string>>(); // chatId -> Set of typing user IDs

  // Create a new chat room for matched partners
  async createChatForMatch(matchId: string, participants: string[], eventId?: string, eventName?: string): Promise<string> {
    try {
      console.log('🧪 ChatService: Creating chat for match:', matchId, 'participants:', participants);
      
      // Get participant names
      const participantNames: { [userId: string]: string } = {};
      for (const userId of participants) {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        if (userDoc.exists()) {
          participantNames[userId] = userDoc.data().name || 'Unknown User';
        }
      }

      const chatData = {
        participants,
        participantNames,
        lastMessage: 'Chat started',
        lastMessageTime: serverTimestamp(),
        lastMessageSender: 'system',
        eventId,
        eventName,
        isActive: true,
        createdAt: serverTimestamp(),
        matchId,
        unreadCount: participants.reduce((acc, userId) => {
          acc[userId] = 0;
          return acc;
        }, {} as { [userId: string]: number })
      };

      const chatRef = await addDoc(collection(db, COLLECTIONS.CHATS), chatData);
      
      // Add system message
      await this.sendMessage(chatRef.id, 'system', `🎉 Chat started! You matched over ${eventName || 'shared interests'}`, 'system');
      
      console.log('🧪 ChatService: Chat created with ID:', chatRef.id);
      return chatRef.id;
      
    } catch (error) {
      console.error('🧪 ChatService: Error creating chat:', error);
      throw error;
    }
  }

  // Send a message to a chat
  async sendMessage(chatId: string, senderId: string, text: string, type: 'text' | 'image' | 'event' | 'system' = 'text'): Promise<string> {
    try {
      console.log('🧪 ChatService: Sending message to chat:', chatId);
      
      // Get sender name
      let senderName = 'System';
      if (senderId !== 'system') {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, senderId));
        if (userDoc.exists()) {
          senderName = userDoc.data().name || 'Unknown User';
        }
      }
      
      const messageData = {
        text,
        senderId,
        senderName,
        timestamp: serverTimestamp(),
        type,
        read: false
      };

      const messageRef = await addDoc(collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES), messageData);
      
      // Update chat's last message and unread counts
      const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data() as Chat;
        const unreadCount = { ...chatData.unreadCount };
        
        // Increment unread count for all participants except sender
        chatData.participants.forEach(participantId => {
          if (participantId !== senderId) {
            unreadCount[participantId] = (unreadCount[participantId] || 0) + 1;
          }
        });

        await updateDoc(chatRef, {
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
          lastMessageSender: senderName,
          unreadCount
        });
      }

      console.log('🧪 ChatService: Message sent with ID:', messageRef.id);
      return messageRef.id;
      
    } catch (error) {
      console.error('🧪 ChatService: Error sending message:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      console.log('🧪 ChatService: Marking messages as read for user:', userId, 'in chat:', chatId);
      
      const batch = writeBatch();
      
      // Mark all unread messages as read
      const unreadMessagesQuery = query(
        collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
        where('read', '==', false),
        where('senderId', '!=', userId)
      );
      
      const unreadMessages = await getDocs(unreadMessagesQuery);
      unreadMessages.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      
      // Reset unread count for this user
      const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
      batch.update(chatRef, {
        [`unreadCount.${userId}`]: 0
      });
      
      await batch.commit();
      console.log('🧪 ChatService: Messages marked as read');
      
    } catch (error) {
      console.error('🧪 ChatService: Error marking messages as read:', error);
      throw error;
    }
  }

  // Get messages for a chat with real-time updates
  onMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    console.log('🧪 ChatService: Setting up real-time message listener for chat:', chatId);
    
    const messagesQuery = query(
      collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages: Message[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: data.timestamp?.toDate() || new Date(),
          type: data.type || 'text',
          read: data.read || false,
          eventId: data.eventId
        });
      });

      callback(messages);
    });

    return unsubscribe;
  }

  // Get user's chats with real-time updates
  onUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    console.log('🧪 ChatService: Setting up real-time chat listener for user:', userId);
    
    const chatsQuery = query(
      collection(db, COLLECTIONS.CHATS),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chats: Chat[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          participants: data.participants || [],
          participantNames: data.participantNames || {},
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          lastMessageSender: data.lastMessageSender,
          eventId: data.eventId,
          eventName: data.eventName,
          isActive: data.isActive || true,
          createdAt: data.createdAt?.toDate() || new Date(),
          matchId: data.matchId,
          unreadCount: data.unreadCount || {}
        });
      });

      callback(chats);
    });

    return unsubscribe;
  }

  // Get user's chats (non-real-time)
  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      console.log('🧪 ChatService: Getting chats for user:', userId);
      
      const chatsQuery = query(
        collection(db, COLLECTIONS.CHATS),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );

      const snapshot = await getDocs(chatsQuery);
      const chats: Chat[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          participants: data.participants || [],
          participantNames: data.participantNames || {},
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          lastMessageSender: data.lastMessageSender,
          eventId: data.eventId,
          eventName: data.eventName,
          isActive: data.isActive || true,
          createdAt: data.createdAt?.toDate() || new Date(),
          matchId: data.matchId,
          unreadCount: data.unreadCount || {}
        });
      });

      console.log('🧪 ChatService: Found', chats.length, 'chats for user');
      return chats;
      
    } catch (error) {
      console.error('🧪 ChatService: Error getting user chats:', error);
      throw error;
    }
  }

  // Get a specific chat
  async getChat(chatId: string): Promise<Chat | null> {
    try {
      console.log('🧪 ChatService: Getting chat:', chatId);
      
      const chatDoc = await getDoc(doc(db, COLLECTIONS.CHATS, chatId));
      
      if (!chatDoc.exists()) {
        console.log('🧪 ChatService: Chat not found');
        return null;
      }

      const data = chatDoc.data();
      const chat: Chat = {
        id: chatDoc.id,
        participants: data.participants || [],
        participantNames: data.participantNames || {},
        lastMessage: data.lastMessage || '',
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        lastMessageSender: data.lastMessageSender,
        eventId: data.eventId,
        eventName: data.eventName,
        isActive: data.isActive || true,
        createdAt: data.createdAt?.toDate() || new Date(),
        matchId: data.matchId,
        unreadCount: data.unreadCount || {}
      };

      console.log('🧪 ChatService: Chat retrieved successfully');
      return chat;
      
    } catch (error) {
      console.error('🧪 ChatService: Error getting chat:', error);
      throw error;
    }
  }

  // Delete a chat (for both participants)
  async deleteChat(chatId: string, userId: string): Promise<void> {
    try {
      console.log('🧪 ChatService: Deleting chat:', chatId);
      
      const chatDoc = await getDoc(doc(db, COLLECTIONS.CHATS, chatId));
      if (!chatDoc.exists()) {
        throw new Error('Chat not found');
      }

      const chatData = chatDoc.data() as Chat;
      if (!chatData.participants.includes(userId)) {
        throw new Error('User not authorized to delete this chat');
      }

      const batch = writeBatch();
      
      // Delete all messages
      const messagesQuery = query(collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES));
      const messagesSnapshot = await getDocs(messagesQuery);
      messagesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete the chat
      batch.delete(doc(db, COLLECTIONS.CHATS, chatId));
      
      await batch.commit();
      console.log('🧪 ChatService: Chat deleted successfully');
      
    } catch (error) {
      console.error('🧪 ChatService: Error deleting chat:', error);
      throw error;
    }
  }

  // Set typing indicator
  async setTyping(chatId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.CHATS, chatId), {
        [`typing.${userId}`]: isTyping
      });
    } catch (error) {
      console.error('🧪 ChatService: Error setting typing indicator:', error);
    }
  }

  // Get typing indicators for a chat
  onTyping(chatId: string, callback: (typingUsers: { [userId: string]: boolean }) => void): () => void {
    const unsubscribe = onSnapshot(doc(db, COLLECTIONS.CHATS, chatId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.typing || {});
      } else {
        callback({});
      }
    });

    return unsubscribe;
  }

  // Send event-related message
  async sendEventMessage(chatId: string, senderId: string, eventId: string, eventName: string, message: string): Promise<string> {
    return this.sendMessage(chatId, senderId, `🎪 ${eventName}: ${message}`, 'event');
  }

  // Get unread message count for a user
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const chats = await this.getUserChats(userId);
      let totalUnread = 0;
      
      chats.forEach(chat => {
        totalUnread += chat.unreadCount?.[userId] || 0;
      });
      
      return totalUnread;
    } catch (error) {
      console.error('🧪 ChatService: Error getting unread count:', error);
      return 0;
    }
  }
}

export const chatService = new ChatService();


