// eventBasedMatchingService.ts
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
import { chatService } from './chatService';
import { EventInterest, eventInterestService } from './eventInterestService';

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
  private collectionName = COLLECTIONS.MATCHES; // 'matches' collection

  // -------- Normalizers / utils --------------------------------------------

  private toEventId(x: any): string | undefined {
    // allow various shapes from interest docs or raw strings
    return x?.eventId ?? x?.event?.id ?? x?.id ?? (typeof x === 'string' ? x : undefined);
  }

  private safeLower(s: any): string {
    return typeof s === 'string' ? s.toLowerCase() : '';
  }

  private nameFromProfile(p: any): string | undefined {
    return p?.name ?? p?.displayName ?? p?.fullName ?? p?.username ?? undefined;
  }

  // Calculate match strength based on shared interests
  private calculateMatchStrength(sharedCount: number, totalUserInterests: number): number {
    const baseStrength = (sharedCount / Math.max(totalUserInterests, 1)) * 100;
    const bonus = Math.min(sharedCount * 10, 30);
    return Math.min(Math.round(baseStrength + bonus), 100);
  }

  // Extract common interests from shared events (robust to missing fields)
  private extractCommonInterests(sharedEvents: EventInterest[]): string[] {
    const interests = new Set<string>();

    for (const ev of sharedEvents || []) {
      const tags = ev?.eventData?.tags;
      if (Array.isArray(tags)) {
        for (const t of tags) {
          if (typeof t === 'string' && t.trim()) interests.add(t.trim());
        }
      }
      const title =
        ev?.eventTitle ??
        ev?.eventName ??
        ev?.eventData?.title ??
        ev?.eventData?.name ??
        '';

      const tl = this.safeLower(title);
      if (tl.includes('salsa')) interests.add('Salsa');
      if (tl.includes('bachata')) interests.add('Bachata');
      if (tl.includes('ballroom')) interests.add('Ballroom');
      if (tl.includes('swing')) interests.add('Swing');
      if (tl.includes('kizomba')) interests.add('Kizomba');
      if (tl.includes('zouk')) interests.add('Zouk');
    }

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

  // -------- Public APIs -----------------------------------------------------

  // Find potential matches based on shared event interests
  async findEventBasedMatches(userId: string, limitCount: number = 10): Promise<EventMatchSuggestion[]> {
    try {
      console.log('🧪 EventBasedMatchingService: Finding matches for user:', userId);

      // 1) Load current user's interests once
      const userInterests = await eventInterestService.getUserInterestedEvents(userId);
      if (!userInterests || userInterests.length === 0) {
        console.log('🧪 EventBasedMatchingService: User has no event interests');
        return [];
      }

      // Normalize to event IDs and de-dupe
      const userEventIdSet = new Set(
        userInterests.map((i: any) => this.toEventId(i)).filter(Boolean) as string[]
      );
      const userEventIds = Array.from(userEventIdSet);
      console.log('🧪 EventBasedMatchingService: User interested in events:', userEventIds);

      if (userEventIds.length === 0) {
        console.log('🧪 EventBasedMatchingService: No normalized event IDs; check interest shapes.');
        return [];
      }

      // 2) Collect all interested users across the user's events
      const interestedUserSets = await Promise.all(
        userEventIds.map((eid) => eventInterestService.getUsersInterestedInEvent(eid))
      );

      // Flatten & de-dupe; exclude self
      const allOtherUsers = new Set<string>();
      for (const arr of interestedUserSets) {
        for (const uid of arr || []) {
          if (uid && uid !== userId) allOtherUsers.add(uid);
        }
      }

      if (allOtherUsers.size === 0) {
        console.log('🧪 EventBasedMatchingService: No other users share these events.');
        return [];
      }

      // 3) For each other user, fetch their interests in parallel and compute shared events
      const suggestions: EventMatchSuggestion[] = [];
      const otherUserIds = Array.from(allOtherUsers);

      await Promise.all(
        otherUserIds.map(async (otherId) => {
          const otherInterests = await eventInterestService.getUserInterestedEvents(otherId);
          if (!otherInterests || otherInterests.length === 0) return;

          const shared = otherInterests.filter((oi: any) => {
            const eid = this.toEventId(oi);
            return eid ? userEventIdSet.has(eid) : false;
          });

          if (shared.length === 0) return;

          const matchStrength = this.calculateMatchStrength(shared.length, userEventIdSet.size);
          const profile = await this.getUserProfile(otherId).catch(() => null);

          suggestions.push({
            userId: otherId,
            sharedEvents: shared,
            matchStrength,
            commonInterests: this.extractCommonInterests(shared),
            potentialPartner: {
              id: otherId,
              name: this.nameFromProfile(profile) || 'Unknown User',
              profile
            }
          });
        })
      );

      // 4) Sort & limit
      const sorted = suggestions.sort((a, b) => b.matchStrength - a.matchStrength);
      const limited = sorted.slice(0, limitCount);

      console.log('🧪 EventBasedMatchingService: Found', limited.length, 'potential matches');
      return limited;
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error finding matches:', error);
      return [];
    }
  }

  // Create a match between two users
  async createEventBasedMatch(userId1: string, userId2: string, sharedEvents: string[]): Promise<string> {
    try {
      console.log('🧪 EventBasedMatchingService: Creating match between users:', userId1, userId2);

      // Optional: normalize ordering to avoid duplicate pairs with reversed order
      const [a, b] = [userId1, userId2].sort();
      const matchId = `${a}_${b}`;
      const matchStrength = this.calculateMatchStrength(sharedEvents.length, sharedEvents.length);

      const matchData: Omit<EventBasedMatch, 'id'> = {
        userId1: a,
        userId2: b,
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

      const matchesQuery1 = query(collection(db, this.collectionName), where('userId1', '==', userId));
      const matchesQuery2 = query(collection(db, this.collectionName), where('userId2', '==', userId));

      const [snapshot1, snapshot2] = await Promise.all([getDocs(matchesQuery1), getDocs(matchesQuery2)]);

      const matches: EventBasedMatch[] = [];

      snapshot1.forEach((d) => {
        const data = d.data() as any;
        matches.push({
          id: d.id,
          userId1: data.userId1,
          userId2: data.userId2,
          sharedEvents: data.sharedEvents || [],
          matchStrength: data.matchStrength || 0,
          matchedAt: data.matchedAt?.toDate?.() || new Date(),
          status: data.status || 'pending',
          lastActivity: data.lastActivity?.toDate?.() || new Date(),
          chatId: data.chatId
        });
      });

      snapshot2.forEach((d) => {
        const data = d.data() as any;
        matches.push({
          id: d.id,
          userId1: data.userId1,
          userId2: data.userId2,
          sharedEvents: data.sharedEvents || [],
          matchStrength: data.matchStrength || 0,
          matchedAt: data.matchedAt?.toDate?.() || new Date(),
          status: data.status || 'pending',
          lastActivity: data.lastActivity?.toDate?.() || new Date(),
          chatId: data.chatId
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

      if (!matchDoc.exists()) throw new Error('Match not found');

      const matchData = matchDoc.data() as any;
      if (matchData.userId1 !== userId && matchData.userId2 !== userId) {
        throw new Error('User not authorized to respond to this match');
      }

      await setDoc(
        matchRef,
        {
          ...matchData,
          status: accept ? 'accepted' : 'declined',
          lastActivity: serverTimestamp()
        },
        { merge: true }
      );

      console.log('🧪 EventBasedMatchingService: Match response recorded');
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error responding to match:', error);
      throw error;
    }
  }

  // Get match suggestions for a user (polling)
  onEventMatchSuggestions(userId: string, callback: (suggestions: EventMatchSuggestion[]) => void) {
    console.log('🧪 EventBasedMatchingService: Setting up real-time match suggestions for:', userId);

    const interval = setInterval(async () => {
      try {
        const suggestions = await this.findEventBasedMatches(userId);
        callback(suggestions);
      } catch (error) {
        console.error('🧪 EventBasedMatchingService: Error in real-time suggestions:', error);
      }
    }, 30000);

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
      const acceptedMatches = matches.filter((m) => m.status === 'accepted');

      const averageStrength =
        matches.length > 0
          ? matches.reduce((sum, m) => sum + (m.matchStrength || 0), 0) / matches.length
          : 0;

      const eventCounts = new Map<string, number>();
      for (const m of matches) {
        for (const eid of m.sharedEvents || []) {
          if (!eid) continue;
          eventCounts.set(eid, (eventCounts.get(eid) || 0) + 1);
        }
      }

      const topSharedEvents = Array.from(eventCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([eid]) => eid);

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
  }

  // Create a match between two users and create a chat room
  async createMatchWithChat(userId1: string, userId2: string, sharedEvents: EventInterest[]): Promise<string> {
    try {
      console.log('🧪 EventBasedMatchingService: Creating match with chat for users:', userId1, userId2);

      const [a, b] = [userId1, userId2].sort();
      const matchStrength = this.calculateMatchStrength(sharedEvents.length, 10); // assume max 10 events

      const primaryEventId = this.toEventId(sharedEvents[0]);
      const primaryEventName =
        sharedEvents[0]?.eventName ||
        sharedEvents[0]?.eventTitle ||
        sharedEvents[0]?.eventData?.title ||
        'shared interests';

      const matchData: EventBasedMatch = {
        id: `${a}_${b}_${Date.now()}`,
        userId1: a,
        userId2: b,
        sharedEvents: sharedEvents.map((e) => this.toEventId(e)).filter(Boolean) as string[],
        matchStrength,
        matchedAt: new Date(),
        status: 'pending',
        lastActivity: new Date()
      };

      // Save match to Firestore
      await setDoc(doc(db, this.collectionName, matchData.id), {
        ...matchData,
        matchedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      // Create chat room for the match
      const chatId = await chatService.createChatForMatch(matchData.id, [a, b], primaryEventId, primaryEventName);

      // Update match with chat ID
      await setDoc(
        doc(db, this.collectionName, matchData.id),
        { chatId, lastActivity: serverTimestamp() },
        { merge: true }
      );

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

      const matchDoc = await getDoc(doc(db, this.collectionName, matchId));
      if (!matchDoc.exists()) throw new Error('Match not found');

      const matchData = matchDoc.data() as EventBasedMatch;
      if (matchData.userId1 !== userId && matchData.userId2 !== userId) {
        throw new Error('User not authorized to accept this match');
      }

      await setDoc(
        doc(db, this.collectionName, matchId),
        { status: 'accepted', lastActivity: serverTimestamp() },
        { merge: true }
      );

      return matchData.chatId || null;
    } catch (error) {
      console.error('🧪 EventBasedMatchingService: Error accepting match:', error);
      throw error;
    }
  }
}

export const eventBasedMatchingService = new EventBasedMatchingService();


