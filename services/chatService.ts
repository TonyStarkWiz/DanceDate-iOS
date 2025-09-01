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
    where
} from 'firebase/firestore';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'event';
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  eventId?: string;
  isActive: boolean;
  createdAt: Date;
}

class ChatService {
  // Send a message to a chat
  async sendMessage(chatId: string, senderId: string, text: string, type: 'text' | 'image' | 'event' = 'text'): Promise<string> {
    try {
      console.log('🧪 ChatService: Sending message to chat:', chatId);
      
      const messageData = {
        text,
        senderId,
        timestamp: serverTimestamp(),
        type,
        read: false
      };

      const messageRef = await addDoc(collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES), messageData);
      
      // Update chat's last message
      await updateDoc(doc(db, COLLECTIONS.CHATS, chatId), {
        lastMessage: text,
        lastMessageTime: serverTimestamp()
      });

      console.log('🧪 ChatService: Message sent with ID:', messageRef.id);
      return messageRef.id;
      
    } catch (error) {
      console.error('🧪 ChatService: Error sending message:', error);
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
          timestamp: data.timestamp?.toDate() || new Date(),
          type: data.type || 'text',
          read: data.read || false
        });
      });

      callback(messages);
    });

    return unsubscribe;
  }

  // Get user's chats
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
          participants: data.participants,
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          eventId: data.eventId,
          isActive: data.isActive || true,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });

      console.log('🧪 ChatService: Found', chats.length, 'chats');
      return chats;
      
    } catch (error) {
      console.error('🧪 ChatService: Error getting user chats:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      console.log('🧪 ChatService: Marking messages as read for user:', userId);
      
      const messagesQuery = query(
        collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(messagesQuery);
      
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(updatePromises);
      console.log('🧪 ChatService: Marked', snapshot.docs.length, 'messages as read');
      
    } catch (error) {
      console.error('🧪 ChatService: Error marking messages as read:', error);
      throw error;
    }
  }

  // Get chat by ID
  async getChat(chatId: string): Promise<Chat | null> {
    try {
      const chatDoc = await getDoc(doc(db, COLLECTIONS.CHATS, chatId));
      
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        return {
          id: chatDoc.id,
          participants: data.participants,
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          eventId: data.eventId,
          isActive: data.isActive || true,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error('🧪 ChatService: Error getting chat:', error);
      throw error;
    }
  }

  // Get other participant in chat
  async getOtherParticipant(chatId: string, currentUserId: string): Promise<string | null> {
    try {
      const chat = await this.getChat(chatId);
      if (!chat) return null;
      
      const otherParticipant = chat.participants.find(id => id !== currentUserId);
      return otherParticipant || null;
    } catch (error) {
      console.error('🧪 ChatService: Error getting other participant:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();


