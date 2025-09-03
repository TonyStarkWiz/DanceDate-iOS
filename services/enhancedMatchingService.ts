// Enhanced Match Creation and Detection Service
import { COLLECTIONS, db } from '@/config/firebase';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  sharedEvents: string[];
  matchStrength: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  chatId?: string | null;
  matchedAt: any;
  lastActivity: any;
}

export interface UserInterest {
  userId: string;
  eventId: string;
  interestedAt: any;
  _id?: string;
}

export class EnhancedMatchingService {
  private TAG = 'EnhancedMatchingService';

  // Create a match between two users
  async createMatch(userId1: string, userId2: string, sharedEvents: string[]): Promise<string> {
    try {
      console.log(`🧪 ${this.TAG}: Creating match between ${userId1} and ${userId2}`);
      
      // Sort user IDs for consistent match ID
      const [user1, user2] = [userId1, userId2].sort();
      const matchId = `${user1}_${user2}`;
      
      const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
      
      const matchData: Match = {
        id: matchId,
        userId1: user1,
        userId2: user2,
        sharedEvents,
        matchStrength: this.calculateMatchStrength(sharedEvents.length),
        status: 'pending',
        chatId: null,
        matchedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      };

      await setDoc(matchRef, matchData, { merge: true });
      
      console.log(`🧪 ${this.TAG}: Match created successfully: ${matchId}`);
      return matchId;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error creating match:`, error);
      throw error;
    }
  }

  // Get all matches for a user
  async getUserMatches(userId: string): Promise<Match[]> {
    try {
      console.log(`🧪 ${this.TAG}: Getting matches for user: ${userId}`);
      
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      const matchesQuery = query(
        matchesRef,
        where('userId1', '==', userId)
      );
      
      const matchesSnapshot1 = await getDocs(matchesQuery);
      
      const matchesQuery2 = query(
        matchesRef,
        where('userId2', '==', userId)
      );
      
      const matchesSnapshot2 = await getDocs(matchesQuery2);
      
      const matches: Match[] = [];
      
      // Process matches where user is userId1
      matchesSnapshot1.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1,
          userId2: data.userId2,
          sharedEvents: data.sharedEvents || [],
          matchStrength: data.matchStrength || 0,
          status: data.status || 'pending',
          chatId: data.chatId || null,
          matchedAt: data.matchedAt,
          lastActivity: data.lastActivity
        });
      });
      
      // Process matches where user is userId2
      matchesSnapshot2.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1,
          userId2: data.userId2,
          sharedEvents: data.sharedEvents || [],
          matchStrength: data.matchStrength || 0,
          status: data.status || 'pending',
          chatId: data.chatId || null,
          matchedAt: data.matchedAt,
          lastActivity: data.lastActivity
        });
      });
      
      console.log(`🧪 ${this.TAG}: Found ${matches.length} matches for user ${userId}`);
      return matches;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting user matches:`, error);
      return [];
    }
  }

  // Get user's event interests
  async getUserEventInterests(userId: string): Promise<UserInterest[]> {
    try {
      console.log(`🧪 ${this.TAG}: Getting event interests for user: ${userId}`);
      
      // Try the interested_events subcollection first
      try {
        const userInterestsRef = collection(db, COLLECTIONS.USERS, userId, 'interested_events');
        const userInterestsSnapshot = await getDocs(userInterestsRef);
        
        const interests: UserInterest[] = [];
        userInterestsSnapshot.forEach(doc => {
          const data = doc.data();
          interests.push({
            userId,
            eventId: doc.id,
            interestedAt: data.interestedAt || data.timestamp || serverTimestamp(),
            _id: doc.id
          });
        });
        
        console.log(`🧪 ${this.TAG}: Found ${interests.length} interests in subcollection`);
        return interests;
      } catch (error) {
        console.log(`🧪 ${this.TAG}: Subcollection not found, trying main collection`);
      }
      
      // Fallback to main interested_events collection
      const interestsRef = collection(db, COLLECTIONS.INTERESTED_EVENTS);
      const interestsQuery = query(interestsRef, where('userId', '==', userId));
      const interestsSnapshot = await getDocs(interestsQuery);
      
      const interests: UserInterest[] = [];
      interestsSnapshot.forEach(doc => {
        const data = doc.data();
        interests.push({
          userId: data.userId,
          eventId: data.eventId,
          interestedAt: data.interestedAt || data.timestamp || serverTimestamp(),
          _id: doc.id
        });
      });
      
      console.log(`🧪 ${this.TAG}: Found ${interests.length} interests in main collection`);
      return interests;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting user event interests:`, error);
      return [];
    }
  }

  // Get users interested in an event
  async getUsersInterestedInEvent(eventId: string): Promise<string[]> {
    try {
      console.log(`🧪 ${this.TAG}: Getting users interested in event: ${eventId}`);
      
      // Try the interested_users subcollection first
      try {
        const eventInterestsRef = collection(db, COLLECTIONS.EVENTS, eventId, 'interested_users');
        const eventInterestsSnapshot = await getDocs(eventInterestsRef);
        
        const userIds: string[] = [];
        eventInterestsSnapshot.forEach(doc => {
          userIds.push(doc.id);
        });
        
        console.log(`🧪 ${this.TAG}: Found ${userIds.length} users in subcollection`);
        return userIds;
      } catch (error) {
        console.log(`🧪 ${this.TAG}: Subcollection not found, trying main collection`);
      }
      
      // Fallback to main interested_users collection
      const interestsRef = collection(db, COLLECTIONS.INTERESTED_USERS);
      const interestsQuery = query(interestsRef, where('eventId', '==', eventId));
      const interestsSnapshot = await getDocs(interestsQuery);
      
      const userIds: string[] = [];
      interestsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId) {
          userIds.push(data.userId);
        }
      });
      
      console.log(`🧪 ${this.TAG}: Found ${userIds.length} users in main collection`);
      return userIds;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting users interested in event:`, error);
      return [];
    }
  }

  // Find and create matches for a user
  async findAndCreateMatches(userId: string): Promise<string[]> {
    try {
      console.log(`🧪 ${this.TAG}: Finding matches for user: ${userId}`);
      
      // Get user's event interests
      const userInterests = await this.getUserEventInterests(userId);
      console.log(`🧪 ${this.TAG}: User has ${userInterests.length} event interests`);
      
      if (userInterests.length === 0) {
        console.log(`🧪 ${this.TAG}: No event interests found for user`);
        return [];
      }
      
      // Get all users interested in the same events
      const otherUsers = new Set<string>();
      
      for (const interest of userInterests) {
        const interestedUsers = await this.getUsersInterestedInEvent(interest.eventId);
        interestedUsers.forEach(uid => {
          if (uid !== userId) {
            otherUsers.add(uid);
          }
        });
      }
      
      console.log(`🧪 ${this.TAG}: Found ${otherUsers.size} other users with shared interests`);
      
      // Find shared events for each potential match
      const createdMatches: string[] = [];
      
      for (const otherUserId of otherUsers) {
        const otherUserInterests = await this.getUserEventInterests(otherUserId);
        
        // Find shared events
        const sharedEvents = userInterests
          .filter(ui => otherUserInterests.some(oi => oi.eventId === ui.eventId))
          .map(ui => ui.eventId);
        
        if (sharedEvents.length > 0) {
          console.log(`🧪 ${this.TAG}: Found ${sharedEvents.length} shared events with user ${otherUserId}`);
          
          // Check if match already exists
          const existingMatches = await this.getUserMatches(userId);
          const matchExists = existingMatches.some(match => 
            (match.userId1 === otherUserId || match.userId2 === otherUserId)
          );
          
          if (!matchExists) {
            // Create new match
            const matchId = await this.createMatch(userId, otherUserId, sharedEvents);
            createdMatches.push(matchId);
            console.log(`🧪 ${this.TAG}: Created new match: ${matchId}`);
          } else {
            console.log(`🧪 ${this.TAG}: Match already exists with user ${otherUserId}`);
          }
        }
      }
      
      console.log(`🧪 ${this.TAG}: Created ${createdMatches.length} new matches`);
      return createdMatches;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error finding and creating matches:`, error);
      return [];
    }
  }

  // Calculate match strength based on shared events
  private calculateMatchStrength(sharedEventCount: number): number {
    if (sharedEventCount === 0) return 0;
    if (sharedEventCount === 1) return 50;
    if (sharedEventCount === 2) return 75;
    return Math.min(100, 75 + (sharedEventCount - 2) * 10);
  }

  // Force create a test match
  async createTestMatch(userId1: string, userId2: string): Promise<string> {
    try {
      console.log(`🧪 ${this.TAG}: Creating test match between ${userId1} and ${userId2}`);
      
      const sharedEvents = ['test-event-1', 'test-event-2'];
      const matchId = await this.createMatch(userId1, userId2, sharedEvents);
      
      console.log(`🧪 ${this.TAG}: Test match created: ${matchId}`);
      return matchId;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error creating test match:`, error);
      throw error;
    }
  }

  // Get all matches (for debugging)
  async getAllMatches(): Promise<Match[]> {
    try {
      console.log(`🧪 ${this.TAG}: Getting all matches`);
      
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      const matchesSnapshot = await getDocs(matchesRef);
      
      const matches: Match[] = [];
      matchesSnapshot.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1,
          userId2: data.userId2,
          sharedEvents: data.sharedEvents || [],
          matchStrength: data.matchStrength || 0,
          status: data.status || 'pending',
          chatId: data.chatId || null,
          matchedAt: data.matchedAt,
          lastActivity: data.lastActivity
        });
      });
      
      console.log(`🧪 ${this.TAG}: Found ${matches.length} total matches`);
      return matches;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting all matches:`, error);
      return [];
    }
  }
}

export const enhancedMatchingService = new EnhancedMatchingService();
