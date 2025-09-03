import { auth, COLLECTIONS, db } from '@/config/firebase';
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  LOCATION = 'location',
  EVENT_INVITE = 'event_invite',
  DANCE_INVITE = 'dance_invite',
  DANCE_INVITATION = 'dance_invitation',
  SYSTEM = 'system'
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  text: string;
  message: string; // For compatibility
  senderId: string;
  receiverId: string; // For compatibility
  senderName: string;
  senderImageUrl?: string;
  timestamp: any;
  type: MessageType;
  read: boolean;
  readBy: string[];
  readAt?: any;
}

export interface Chat {
  chatId: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
  lastMessageSenderId: string;
  typingUsers: string[];
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
  eventId?: string;
  eventTitle?: string;
  matchType?: string;
}

class ChatService {
  private readonly TAG = 'ChatService';

  /**
   * 🎯 CREATE OR GET CHAT
   * Creates a new chat or returns existing chat between two users
   */
  async createOrGetChat(participantIds: string[]): Promise<Result<string>> {
    try {
      console.log(`🧪 🎯 Creating or getting chat for participants: ${participantIds}`);

      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        console.error('🧪 ❌ No authenticated user');
        return { success: false, error: 'User not authenticated' };
      }

      // Ensure current user is in participants
      const allParticipants = participantIds.includes(currentUserId) 
        ? participantIds 
        : [...participantIds, currentUserId];

      // Check if chat already exists
      const existingChat = await this.findExistingChat(allParticipants);
      if (existingChat) {
        console.log(`🧪 ✅ Found existing chat: ${existingChat.chatId}`);
        return { success: true, data: existingChat.chatId };
      }

      // Create new chat
      const chatId = this.generateChatId(allParticipants);
      const chatData: Partial<Chat> = {
        participants: allParticipants,
        lastMessage: '',
        lastMessageTime: Timestamp.now(),
        createdAt: Timestamp.now(),
        isActive: true
      };

      await setDoc(doc(db, COLLECTIONS.CHATS, chatId), chatData);

      console.log(`🧪 ✅ Created new chat: ${chatId}`);
      return { success: true, data: chatId };

    } catch (error) {
      console.error('🧪 ❌ Error creating/getting chat', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * 🎯 SEND MESSAGE
   * Sends a message to a chat and updates last message
   */
  async sendMessage(
    chatId: string,
    text: string,
    type: MessageType = MessageType.TEXT
  ): Promise<Result<string>> {
    try {
      console.log(`🧪 💬 Sending message to chat: ${chatId}`);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('🧪 ❌ No authenticated user');
        return { success: false, error: 'User not authenticated' };
      }

      const messageId = doc(collection(db, COLLECTIONS.CHATS, chatId, 'messages')).id;

      // Create message data
      const messageData = {
        text,
        senderId: currentUser.uid,
        timestamp: Timestamp.now(),
        type: type,
        read: false
      };

      // Write message and update chat in batch
      const batch = writeBatch(db);

      // Add message
      const messageRef = doc(db, COLLECTIONS.CHATS, chatId, 'messages', messageId);
      batch.set(messageRef, messageData);

      // Update chat last message
      const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
      batch.update(chatRef, {
        lastMessage: text,
        lastMessageTime: Timestamp.now(),
        lastMessageSenderId: currentUser.uid,
        updatedAt: Timestamp.now()
      });

      await batch.commit();

      console.log(`🧪 ✅ Message sent successfully: ${messageId}`);
      return { success: true, data: messageId };

    } catch (error) {
      console.error('🧪 ❌ Error sending message', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * 🎯 LISTEN TO MESSAGES (REAL-TIME)
   * Returns a callback function to listen to messages with real-time updates
   */
  listenToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    console.log(`🧪 👂 Starting message listener for chat: ${chatId}`);

    const messagesQuery = query(
      collection(db, COLLECTIONS.CHATS, chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100) // Load last 100 messages
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      if (snapshot.empty) {
        console.log('🧪 📨 No messages found');
        callback([]);
        return;
      }

      const messages: ChatMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          messageId: doc.id,
          chatId,
          text: data.text || '',
          message: data.text || '', // For compatibility
          senderId: data.senderId || '',
          receiverId: '', // Will be populated if needed
          senderName: data.senderName || '',
          senderImageUrl: data.senderImageUrl,
          timestamp: data.timestamp,
          type: data.type || MessageType.TEXT,
          read: data.read || false,
          readBy: data.readBy || [],
          readAt: data.readAt
        };
      });

      console.log(`🧪 📨 Received ${messages.length} messages`);
      callback(messages);
    }, (error) => {
      console.error('🧪 ❌ Error listening to messages', error);
    });

    return unsubscribe;
  }

  /**
   * 🎯 GET CHAT HISTORY
   * Gets chat history without real-time updates
   */
  async getChatHistory(chatId: string): Promise<ChatMessage[]> {
    try {
      const messagesQuery = query(
        collection(db, COLLECTIONS.CHATS, chatId, 'messages'),
        orderBy('timestamp', 'asc'),
        limit(100)
      );

      const snapshot = await getDocs(messagesQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          messageId: doc.id,
          chatId,
          text: data.text || '',
          message: data.text || '',
          senderId: data.senderId || '',
          receiverId: '',
          senderName: data.senderName || '',
          senderImageUrl: data.senderImageUrl,
          timestamp: data.timestamp,
          type: data.type || MessageType.TEXT,
          read: data.read || false,
          readBy: data.readBy || [],
          readAt: data.readAt
        };
      });
    } catch (error) {
      console.error('🧪 ❌ Error getting chat history', error);
      return [];
    }
  }

  /**
   * 🎯 MARK MESSAGE AS READ
   * Marks a message as read by the current user
   */
  async markMessageAsRead(chatId: string, messageId: string): Promise<Result<void>> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const messageRef = doc(db, COLLECTIONS.CHATS, chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        read: true,
        readBy: [currentUser.uid]
      });

      console.log(`🧪 ✅ Message marked as read: ${messageId}`);
      return { success: true };

    } catch (error) {
      console.error('🧪 ❌ Error marking message as read', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * 🎯 GET USER'S CHATS
   * Gets all chats for the current user
   */
  async getUserChats(): Promise<Chat[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return [];
      }

      const chatsQuery = query(
        collection(db, COLLECTIONS.CHATS),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('lastMessageTime', 'desc')
      );

      const snapshot = await getDocs(chatsQuery);
      
      return snapshot.docs.map(doc => ({
        chatId: doc.id,
        ...doc.data()
      } as Chat));
    } catch (error) {
      console.error('🧪 ❌ Error getting user chats', error);
      return [];
    }
  }

  /**
   * 🎯 LISTEN TO USER'S CHATS (REAL-TIME)
   * Returns a callback function to listen to user's chats with real-time updates
   */
  listenToUserChats(callback: (chats: Chat[]) => void): () => void {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('🧪 ❌ No authenticated user');
      return () => {};
    }

    console.log(`🧪 👂 Starting user chats listener for: ${currentUser.uid}`);

    const chatsQuery = query(
      collection(db, COLLECTIONS.CHATS),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chats: Chat[] = snapshot.docs.map(doc => ({
        chatId: doc.id,
        ...doc.data()
      } as Chat));

      console.log(`🧪 💬 Received ${chats.length} chats`);
      callback(chats);
    }, (error) => {
      console.error('🧪 ❌ Error listening to user chats', error);
    });

    return unsubscribe;
  }

  // Private helper methods
  private async findExistingChat(participantIds: string[]): Promise<Chat | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const chatsQuery = query(
        collection(db, COLLECTIONS.CHATS),
        where('participants', 'array-contains', currentUser.uid)
      );

      const snapshot = await getDocs(chatsQuery);
      
      for (const doc of snapshot.docs) {
        const chat = doc.data() as Chat;
        const chatParticipants = chat.participants || [];
        
        // Check if all participants match (order doesn't matter)
        if (participantIds.length === chatParticipants.length &&
            participantIds.every(id => chatParticipants.includes(id))) {
          return { ...chat, chatId: doc.id };
        }
      }

      return null;
    } catch (error) {
      console.error('🧪 ❌ Error finding existing chat', error);
      return null;
    }
  }

  private generateChatId(participantIds: string[]): string {
    return participantIds.sort().join('_');
  }
}

export const chatService = new ChatService();

// Helper type for results
interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}


