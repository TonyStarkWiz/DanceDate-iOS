import { COLLECTIONS, db } from '@/config/firebase';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';

export interface MatchPreview {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerImageUrl?: string;
  eventId: string;
  eventTitle: string;
  matchStrength: number;
  status: string;
  matchTimestamp: Date;
  chatId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  chatId: string;
  participants: string[];
  lastMessage?: ChatMessage;
  lastMessageTime: Date;
  eventId?: string;
  eventTitle?: string;
}

/**
 * 🎯 ENHANCED MATCHING & CHAT SERVICE
 * Implements the two-approach strategy for finding matches and managing chats
 */
export class EnhancedMatchingAndChatService {
  private static readonly TAG = 'EnhancedMatchingAndChatService';

  /**
   * 🎯 LOAD ALL MATCHES - TWO-APPROACH STRATEGY
   * Uses a robust two-approach strategy to find all matches for a user
   */
  static async loadAllMatches(currentUserId: string): Promise<MatchPreview[]> {
    console.log(`🧪 ${this.TAG}: 🎯 Loading all matches for user: ${currentUserId}`);
    const matchPreviews: MatchPreview[] = [];

    try {
      // 🎯 APPROACH 1: Simplified query strategy first
      const approach1Success = await this.loadMatchesWithApproach1(currentUserId, matchPreviews);
      
      if (!approach1Success) {
        console.log(`🧪 ${this.TAG}: 🔄 Approach 1 failed, trying fallback`);
        await this.loadMatchesWithApproach2(currentUserId, matchPreviews);
      }

      // Sort by most recent matches first
      const sortedMatches = matchPreviews.sort((a, b) => 
        b.matchTimestamp.getTime() - a.matchTimestamp.getTime()
      );

      console.log(`🧪 ${this.TAG}: ✅ Loaded ${sortedMatches.length} matches`);
      return sortedMatches;

    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error loading matches`, error);
      throw error;
    }
  }

  /**
   * 🎯 APPROACH 1: Simplified Query Strategy
   * Uses users/{userId}/interested_events and events/{eventId}/interested_users
   */
  private static async loadMatchesWithApproach1(
    currentUserId: string, 
    matchPreviews: MatchPreview[]
  ): Promise<boolean> {
    try {
      console.log(`🧪 ${this.TAG}: 🔄 Approach 1: Using simplified query strategy`);

      // Get user's interested events
      const userInterestsRef = collection(db, COLLECTIONS.USERS, currentUserId, COLLECTIONS.INTERESTED_EVENTS);
      const userInterestsSnapshot = await getDocs(userInterestsRef);

      console.log(`🧪 ${this.TAG}: 📊 Approach 1: Found ${userInterestsSnapshot.docs.length} interested events for user`);

      // For each event, get all interested users
      for (const eventDoc of userInterestsSnapshot.docs) {
        const eventId = eventDoc.id;
        const eventData = eventDoc.data();
        const eventTitle = eventData.title || eventData.eventTitle || 'Unknown Event';

        console.log(`🧪 ${this.TAG}: 🔍 Approach 1: Checking event: ${eventId} (${eventTitle}) for mutual matches`);

        try {
          // Get event's interested users
          const eventInterestsRef = collection(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.INTERESTED_USERS);
          const eventInterestsSnapshot = await getDocs(eventInterestsRef);

          console.log(`🧪 ${this.TAG}: 📊 Approach 1: Event ${eventId} has ${eventInterestsSnapshot.docs.length} interested users`);

          // Check each interested user for mutual interest
          for (const userDoc of eventInterestsSnapshot.docs) {
            const potentialUserId = userDoc.id;
            if (potentialUserId !== currentUserId) {
              console.log(`🧪 ${this.TAG}: 🔍 Approach 1: Checking potential match: ${potentialUserId}`);

              try {
                // Check if this user is also interested in the same event
                const mutualCheckRef = doc(db, COLLECTIONS.USERS, potentialUserId, COLLECTIONS.INTERESTED_EVENTS, eventId);
                const mutualCheckSnapshot = await getDoc(mutualCheckRef);

                const hasMutualInterest = mutualCheckSnapshot.exists();

                console.log(`🧪 ${this.TAG}: 🔍 Approach 1: Potential match ${potentialUserId} has mutual interest: ${hasMutualInterest}`);

                if (hasMutualInterest) {
                  await this.addMatchToList(currentUserId, potentialUserId, eventId, eventTitle, matchPreviews, 'Approach 1');
                }
              } catch (userCheckError) {
                console.error(`🧪 ${this.TAG}: ❌ Approach 1: Error checking user ${potentialUserId}`, userCheckError);
                // Continue with next user
              }
            }
          }
        } catch (eventCheckError) {
          console.error(`🧪 ${this.TAG}: ❌ Approach 1: Error checking event ${eventId}`, eventCheckError);
          // Continue with next event
        }
      }

      return true;
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Approach 1 failed`, error);
      return false;
    }
  }

  /**
   * 🎯 APPROACH 2: Fallback Query Strategy
   * Uses the main matches collection as fallback
   */
  private static async loadMatchesWithApproach2(
    currentUserId: string, 
    matchPreviews: MatchPreview[]
  ): Promise<boolean> {
    try {
      console.log(`🧪 ${this.TAG}: 🔄 Approach 2: Using fallback query strategy`);

      // Query main matches collection
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      const matchesQuery = query(
        matchesRef,
        where('participants', 'array-contains', currentUserId),
        orderBy('matchedAt', 'desc')
      );

      const matchesSnapshot = await getDocs(matchesQuery);

      console.log(`🧪 ${this.TAG}: 📊 Approach 2: Found ${matchesSnapshot.docs.length} matches in main collection`);

      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        const otherUserId = matchData.participants.find((id: string) => id !== currentUserId);
        
        if (otherUserId) {
          const partnerProfile = await this.getUserProfile(otherUserId);
          const eventId = matchData.eventId || 'unknown';
          const eventTitle = matchData.eventTitle || 'Unknown Event';

          const matchPreview: MatchPreview = {
            id: matchDoc.id,
            partnerId: otherUserId,
            partnerName: partnerProfile?.displayName || partnerProfile?.name || 'Anonymous',
            partnerImageUrl: partnerProfile?.photoURL,
            eventId: eventId,
            eventTitle: eventTitle,
            matchStrength: matchData.matchStrength || 75,
            status: matchData.status || 'active',
            matchTimestamp: matchData.matchedAt?.toDate() || new Date(),
            chatId: matchData.chatId
          };

          matchPreviews.push(matchPreview);
        }
      }

      return true;
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Approach 2 failed`, error);
      return false;
    }
  }

  /**
   * 🎯 ADD MATCH TO LIST
   * Adds a match to the list with proper deduplication
   */
  private static async addMatchToList(
    currentUserId: string,
    partnerId: string,
    eventId: string,
    eventTitle: string,
    matchPreviews: MatchPreview[],
    approach: string
  ): Promise<void> {
    // Check if match already exists
    const existingMatch = matchPreviews.find(match => 
      match.partnerId === partnerId && match.eventId === eventId
    );

    if (existingMatch) {
      console.log(`🧪 ${this.TAG}: ℹ️ Match already exists for ${partnerId} and ${eventId}`);
      return;
    }

    try {
      const partnerProfile = await this.getUserProfile(partnerId);
      
      const matchPreview: MatchPreview = {
        id: `match_${currentUserId}_${partnerId}_${Date.now()}`,
        partnerId: partnerId,
        partnerName: partnerProfile?.displayName || partnerProfile?.name || 'Anonymous',
        partnerImageUrl: partnerProfile?.photoURL,
        eventId: eventId,
        eventTitle: eventTitle,
        matchStrength: 75, // Default match strength
        status: 'active',
        matchTimestamp: new Date(),
      };

      matchPreviews.push(matchPreview);
      console.log(`🧪 ${this.TAG}: ✅ Added match from ${approach}: ${partnerProfile?.displayName || partnerId}`);

    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error adding match to list`, error);
    }
  }

  /**
   * 🎯 GET USER PROFILE
   * Retrieves user profile from Firestore
   */
  private static async getUserProfile(userId: string): Promise<any> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        return { id: userSnapshot.id, ...userSnapshot.data() };
      }

      return null;
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error getting user profile for ${userId}`, error);
      return null;
    }
  }

  /**
   * 🎯 CREATE OR GET CHAT
   * Creates a new chat or retrieves existing chat between users
   */
  static async createOrGetChat(participants: string[], eventId?: string, eventTitle?: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      console.log(`🧪 ${this.TAG}: 🎯 Creating/getting chat for participants:`, participants);

      // Check if chat already exists
      const existingChat = await this.findExistingChat(participants);
      
      if (existingChat) {
        console.log(`🧪 ${this.TAG}: ✅ Found existing chat: ${existingChat}`);
        return { success: true, data: existingChat };
      }

      // Create new chat
      const chatData = {
        participants: participants.sort(), // Sort for consistency
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        eventId: eventId,
        eventTitle: eventTitle,
        status: 'active'
      };

      const chatRef = await addDoc(collection(db, COLLECTIONS.CHATS), chatData);
      console.log(`🧪 ${this.TAG}: ✅ Created new chat: ${chatRef.id}`);

      return { success: true, data: chatRef.id };

    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error creating/getting chat`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 FIND EXISTING CHAT
   * Finds existing chat between participants
   */
  private static async findExistingChat(participants: string[]): Promise<string | null> {
    try {
      const sortedParticipants = participants.sort();
      
      const chatsRef = collection(db, COLLECTIONS.CHATS);
      const chatsQuery = query(
        chatsRef,
        where('participants', '==', sortedParticipants)
      );

      const chatsSnapshot = await getDocs(chatsQuery);

      if (!chatsSnapshot.empty) {
        return chatsSnapshot.docs[0].id;
      }

      return null;
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error finding existing chat`, error);
      return null;
    }
  }

  /**
   * 🎯 SEND MESSAGE
   * Sends a message in a chat
   */
  static async sendMessage(chatId: string, senderId: string, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🧪 ${this.TAG}: 💬 Sending message in chat: ${chatId}`);

      const messageData = {
        senderId: senderId,
        text: text,
        timestamp: serverTimestamp(),
        read: false
      };

      // Add message to chat
      await addDoc(collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES), messageData);

      // Update chat's last message time
      const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
      await chatRef.update({
        lastMessageTime: serverTimestamp()
      });

      console.log(`🧪 ${this.TAG}: ✅ Message sent successfully`);
      return { success: true };

    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error sending message`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 GET CHAT MESSAGES
   * Retrieves messages for a chat
   */
  static async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      console.log(`🧪 ${this.TAG}: 📨 Getting messages for chat: ${chatId}`);

      const messagesRef = collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES);
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

      const messagesSnapshot = await getDocs(messagesQuery);

      const messages: ChatMessage[] = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as ChatMessage));

      console.log(`🧪 ${this.TAG}: ✅ Retrieved ${messages.length} messages`);
      return messages;

    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error getting chat messages`, error);
      return [];
    }
  }

  /**
   * 🎯 GET USER CHATS
   * Retrieves all chats for the current user
   */
  static async getUserChats(userId: string): Promise<Chat[]> {
    try {
      console.log(`🧪 ${this.TAG}: 💬 Getting chats for user: ${userId}`);

      const chatsRef = collection(db, COLLECTIONS.CHATS);
      const chatsQuery = query(
        chatsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );

      const chatsSnapshot = await getDocs(chatsQuery);

      const chats: Chat[] = [];

      for (const chatDoc of chatsSnapshot.docs) {
        const chatData = chatDoc.data();
        
        // Get last message
        const messagesRef = collection(db, COLLECTIONS.CHATS, chatDoc.id, COLLECTIONS.MESSAGES);
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
        const messagesSnapshot = await getDocs(messagesQuery);

        let lastMessage: ChatMessage | undefined;
        if (!messagesSnapshot.empty) {
          const lastMessageDoc = messagesSnapshot.docs[0];
          lastMessage = {
            id: lastMessageDoc.id,
            ...lastMessageDoc.data(),
            timestamp: lastMessageDoc.data().timestamp?.toDate() || new Date()
          } as ChatMessage;
        }

        const chat: Chat = {
          chatId: chatDoc.id,
          participants: chatData.participants,
          lastMessage: lastMessage,
          lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
          eventId: chatData.eventId,
          eventTitle: chatData.eventTitle
        };

        chats.push(chat);
      }

      console.log(`🧪 ${this.TAG}: ✅ Retrieved ${chats.length} chats`);
      return chats;

    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error getting user chats`, error);
      return [];
    }
  }
}
