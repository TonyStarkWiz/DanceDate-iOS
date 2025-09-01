import { COLLECTIONS, db } from '@/config/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where
} from 'firebase/firestore';
import { EventInterest, eventInterestService } from './eventInterestService';
import { chatService } from './chatService';

export interface EventBasedMatch {
  id: string;
  userId1: string;
  userId2: string;
  sharedEvents: string[]; // Event IDs they're both interested in
  matchStrength: number; // 0-100 based on shared interests
  matchedAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  lastActivity: Date;
  chatId?: string; // Link to the chat room
}

export interface EventMatchSuggestion {
  userId: string;
  sharedEvents: EventInterest[];
  matchStrength: number;
  commonInterests: string[];
  potentialPartner: {
    id: string;
    name: string;
    profile?: any;
  };
  matchId?: string; // ID of the match record
  chatId?: string; // ID of the chat room
}

class EventBasedMatchingService {
  private collectionName = COLLECTIONS.EVENT_MATCHES || 'event_matches';

  // Find potential matches based on shared event interests
  async findEventBasedMatches(userId: string, limitCount: number = 10): Promise<EventMatchSuggestion[]> {
    try {
      console.log('🧪 EventBasedMatchingService: Finding matches for user:', userId);
      
      // Get user's interested events
      const userInterests = await eventInterestService.getUserInterestedEvents(userId);
      if (userInterests.length === 0) {
        console.log('🧪 EventBasedMatchingService: User has no event interests');
        return [];
      }

      const userEventIds = userInterests.map(interest => interest.eventId);
      console.log('🧪 EventBasedMatchingService: User interested in events:', userEventIds);

      // Find other users interested in the same events
      const potentialMatches = new Map<string, EventMatchSuggestion>();

      for (const eventId of userEventIds) {
        const interestedUsers = await eventInterestService.getUsersInterestedInEvent(eventId);
        
        for (const otherUserId of interestedUsers) {
          if (otherUserId === userId) continue; // Skip self
          
          // Get the other user's interests for this event
          const otherUserInterests = await eventInterestService.getUserInterestedEvents(otherUserId);
          const sharedEvents = otherUserInterests.filter(interest => 
            userEventIds.includes(interest.eventId)
          );

          if (sharedEvents.length > 0) {
            // Calculate match strength based on shared events
            const matchStrength = this.calculateMatchStrength(sharedEvents.length, userEventIds.length);
            
            // Get or create match suggestion
            const existing = potentialMatches.get(otherUserId);
            if (existing) {
              // Update with more shared events if found
              if (sharedEvents.length > existing.sharedEvents.length) {
                existing.sharedEvents = sharedEvents;
                existing.matchStrength = matchStrength;
              }
            } else {
              // Create new match suggestion
              const otherUserProfile = await this.getUserProfile(otherUserId);
              potentialMatches.set(otherUserId, {
                userId: otherUserId,
                sharedEvents,
                matchStrength,
                commonInterests: this.extractCommonInterests(sharedEvents),
                potentialPartner: {
                  id: otherUserId,
                  name: otherUserProfile?.name || 'Unknown User',
                  profile: otherUserProfile
                }
              });
            }
          }
        }
      }

      // Convert to array and sort by match strength
      const suggestions = Array.from(potentialMatches.values())
        .sort((a, b) => b.matchStrength - a.matchStrength)
        .slice(0, limitCount);

      console.log('🧪 EventBasedMatchingService: Found', suggestions.length, 'potential matches');
      return suggestions;
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error finding matches:', error);
      return [];
    }
  }

  // Calculate match strength based on shared interests
  private calculateMatchStrength(sharedCount: number, totalUserInterests: number): number {
    // Base strength on percentage of shared interests
    const baseStrength = (sharedCount / totalUserInterests) * 100;
    
    // Bonus for multiple shared interests
    const bonus = Math.min(sharedCount * 10, 30);
    
    return Math.min(baseStrength + bonus, 100);
  }

  // Extract common interests from shared events
  private extractCommonInterests(sharedEvents: EventInterest[]): string[] {
    const interests = new Set<string>();
    
    sharedEvents.forEach(event => {
      if (event.eventData?.tags) {
        event.eventData.tags.forEach(tag => interests.add(tag));
      }
      // Add event type based on title/instructor
      if (event.eventTitle.toLowerCase().includes('salsa')) interests.add('Salsa');
      if (event.eventTitle.toLowerCase().includes('bachata')) interests.add('Bachata');
      if (event.eventTitle.toLowerCase().includes('ballroom')) interests.add('Ballroom');
      if (event.eventTitle.toLowerCase().includes('swing')) interests.add('Swing');
    });
    
    return Array.from(interests);
  }

  // Get user profile for matching
  private async getUserProfile(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error getting user profile:', error);
      return null;
    }
  }

  // Create a match between two users
  async createEventBasedMatch(userId1: string, userId2: string, sharedEvents: string[]): Promise<string> {
    try {
      console.log('🧪 EventBasedMatchingService: Creating match between users:', userId1, userId2);
      
      const matchId = `${userId1}_${userId2}`;
      const matchStrength = this.calculateMatchStrength(sharedEvents.length, sharedEvents.length);
      
      const matchData: Omit<EventBasedMatch, 'id'> = {
        userId1,
        userId2,
        sharedEvents,
        matchStrength,
        matchedAt: new Date(),
        status: 'pending',
        lastActivity: new Date()
      };

      await setDoc(doc(db, this.collectionName, matchId), {
        ...matchData,
        matchedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      console.log('🧪 EventBasedMatchingService: Match created successfully');
      return matchId;
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error creating match:', error);
      throw error;
    }
  }

  // Get user's event-based matches
  async getUserEventMatches(userId: string): Promise<EventBasedMatch[]> {
    try {
      console.log('🧪 EventBasedMatchingService: Getting matches for user:', userId);
      
      const matchesQuery = query(
        collection(db, this.collectionName),
        where('userId1', '==', userId)
      );
      
      const snapshot = await getDocs(matchesQuery);
      const matches: EventBasedMatch[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1,
          userId2: data.userId2,
          sharedEvents: data.sharedEvents || [],
          matchStrength: data.matchStrength || 0,
          matchedAt: data.matchedAt?.toDate() || new Date(),
          status: data.status || 'pending',
          lastActivity: data.lastActivity?.toDate() || new Date()
        });
      });
      
      console.log('🧪 EventBasedMatchingService: Found', matches.length, 'matches');
      return matches;
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error getting matches:', error);
      return [];
    }
  }

  // Accept or decline a match
  async respondToMatch(matchId: string, userId: string, accept: boolean): Promise<void> {
    try {
      console.log('🧪 EventBasedMatchingService: User responding to match:', matchId, accept);
      
      const matchRef = doc(db, this.collectionName, matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }
      
      const matchData = matchDoc.data();
      if (matchData.userId2 !== userId) {
        throw new Error('User not authorized to respond to this match');
      }
      
      await setDoc(matchRef, {
        ...matchData,
        status: accept ? 'accepted' : 'declined',
        lastActivity: serverTimestamp()
      });
      
      console.log('🧪 EventBasedMatchingService: Match response recorded');
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error responding to match:', error);
      throw error;
    }
  }

  // Get match suggestions for a user (real-time)
  onEventMatchSuggestions(userId: string, callback: (suggestions: EventMatchSuggestion[]) => void) {
    console.log('🧪 EventBasedMatchingService: Setting up real-time match suggestions for:', userId);
    
    // This would ideally use real-time listeners, but for now we'll use polling
    // In a real implementation, you'd set up Firestore listeners
    const interval = setInterval(async () => {
      try {
        const suggestions = await this.findEventBasedMatches(userId);
        callback(suggestions);
      } catch (error) {
        console.error('🧪 EventBasedMatchingService: Error in real-time suggestions:', error);
      }
    }, 30000); // Check every 30 seconds
    
    // Return cleanup function
    return () => clearInterval(interval);
  }

  // Get match analytics
  async getMatchAnalytics(userId: string): Promise<{
    totalMatches: number;
    acceptedMatches: number;
    averageMatchStrength: number;
    topSharedEvents: string[];
  }> {
    try {
      console.log('🧪 EventBasedMatchingService: Getting analytics for user:', userId);
      
      const matches = await this.getUserEventMatches(userId);
      const acceptedMatches = matches.filter(match => match.status === 'accepted');
      
      const averageStrength = matches.length > 0 
        ? matches.reduce((sum, match) => sum + match.matchStrength, 0) / matches.length 
        : 0;
      
      // Get top shared events
      const eventCounts = new Map<string, number>();
      matches.forEach(match => {
        match.sharedEvents.forEach(eventId => {
          eventCounts.set(eventId, (eventCounts.get(eventId) || 0) + 1);
        });
      });
      
      const topSharedEvents = Array.from(eventCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([eventId]) => eventId);
      
      return {
        totalMatches: matches.length,
        acceptedMatches: acceptedMatches.length,
        averageMatchStrength: Math.round(averageStrength),
        topSharedEvents
      };
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error getting analytics:', error);
      return {
        totalMatches: 0,
        acceptedMatches: 0,
        averageMatchStrength: 0,
        topSharedEvents: []
      };
    }
  // Create a match between two users and create a chat room
  async createMatchWithChat(userId1: string, userId2: string, sharedEvents: EventInterest[]): Promise<string> {
    try {
      console.log('🧪 EventBasedMatchingService: Creating match with chat for users:', userId1, userId2);
      
      // Calculate match strength
      const matchStrength = this.calculateMatchStrength(sharedEvents.length, 10); // Assuming max 10 events
      
      // Get event names for chat
      const eventNames = sharedEvents.map(event => event.eventName || 'Unknown Event');
      const primaryEventName = eventNames[0] || 'shared interests';
      const primaryEventId = sharedEvents[0]?.eventId;
      
      // Create match record
      const matchData: EventBasedMatch = {
        id: `${userId1}_${userId2}_${Date.now()}`,
        userId1,
        userId2,
        sharedEvents: sharedEvents.map(event => event.eventId),
        matchStrength,
        matchedAt: new Date(),
        status: 'pending',
        lastActivity: new Date()
      };
      
      // Save match to Firestore
      await setDoc(doc(db, COLLECTIONS.EVENT_MATCHES, matchData.id), {
        ...matchData,
        matchedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
      
      // Create chat room for the match
      const chatId = await chatService.createChatForMatch(
        matchData.id,
        [userId1, userId2],
        primaryEventId,
        primaryEventName
      );
      
      // Update match with chat ID
      await setDoc(doc(db, COLLECTIONS.EVENT_MATCHES, matchData.id), {
        chatId,
        lastActivity: serverTimestamp()
      }, { merge: true });
      
      console.log('🧪 EventBasedMatchingService: Match created with chat ID:', chatId);
      return chatId;
      
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error creating match with chat:', error);
      throw error;
    }
  }

  // Accept a match and open chat
  async acceptMatch(matchId: string, userId: string): Promise<string | null> {
    try {
      console.log('🧪 EventBasedMatchingService: Accepting match:', matchId);
      
      const matchDoc = await getDoc(doc(db, COLLECTIONS.EVENT_MATCHES, matchId));
      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }
      
      const matchData = matchDoc.data() as EventBasedMatch;
      if (!matchData.participants?.includes(userId)) {
        throw new Error('User not authorized to accept this match');
      }
      
      // Update match status
      await setDoc(doc(db, COLLECTIONS.EVENT_MATCHES, matchId), {
        status: 'accepted',
        lastActivity: serverTimestamp()
      }, { merge: true });
      
      // Return chat ID if exists
      return matchData.chatId || null;
      
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error accepting match:', error);
      throw error;
    }
  }
}

export const eventBasedMatchingService = new EventBasedMatchingService();


