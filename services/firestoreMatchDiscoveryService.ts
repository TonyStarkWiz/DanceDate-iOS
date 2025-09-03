// Firestore Match Discovery Service
import { COLLECTIONS, db } from '@/config/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface FirestoreMatch {
  id: string;
  userId1: string;
  userId2: string;
  sharedEvents: string[];
  matchStrength: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  chatId?: string | null;
  matchedAt: any;
  lastActivity: any;
  [key: string]: any; // For any additional fields
}

export interface UserProfile {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  [key: string]: any;
}

export class FirestoreMatchDiscoveryService {
  private TAG = 'FirestoreMatchDiscovery';

  // Get all matches from Firestore (for debugging)
  async getAllMatches(): Promise<FirestoreMatch[]> {
    try {
      console.log(`🧪 ${this.TAG}: Getting all matches from Firestore...`);
      
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      const matchesSnapshot = await getDocs(matchesRef);
      
      const matches: FirestoreMatch[] = [];
      matchesSnapshot.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1 || data.user1 || data.user_id_1,
          userId2: data.userId2 || data.user2 || data.user_id_2,
          sharedEvents: data.sharedEvents || data.shared_events || data.events || [],
          matchStrength: data.matchStrength || data.match_strength || data.strength || 0,
          status: data.status || 'pending',
          chatId: data.chatId || data.chat_id || null,
          matchedAt: data.matchedAt || data.matched_at || data.createdAt || data.created_at,
          lastActivity: data.lastActivity || data.last_activity || data.updatedAt || data.updated_at,
          ...data // Include any other fields
        });
      });
      
      console.log(`🧪 ${this.TAG}: Found ${matches.length} total matches in Firestore`);
      return matches;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting all matches:`, error);
      return [];
    }
  }

  // Get matches for a specific user
  async getUserMatches(userId: string): Promise<FirestoreMatch[]> {
    try {
      console.log(`🧪 ${this.TAG}: Getting matches for user: ${userId}`);
      
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      
      // Query for matches where user is userId1
      const query1 = query(
        matchesRef,
        where('userId1', '==', userId)
      );
      const snapshot1 = await getDocs(query1);
      
      // Query for matches where user is userId2
      const query2 = query(
        matchesRef,
        where('userId2', '==', userId)
      );
      const snapshot2 = await getDocs(query2);
      
      const matches: FirestoreMatch[] = [];
      
      // Process matches where user is userId1
      snapshot1.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1 || data.user1 || data.user_id_1,
          userId2: data.userId2 || data.user2 || data.user_id_2,
          sharedEvents: data.sharedEvents || data.shared_events || data.events || [],
          matchStrength: data.matchStrength || data.match_strength || data.strength || 0,
          status: data.status || 'pending',
          chatId: data.chatId || data.chat_id || null,
          matchedAt: data.matchedAt || data.matched_at || data.createdAt || data.created_at,
          lastActivity: data.lastActivity || data.last_activity || data.updatedAt || data.updated_at,
          ...data
        });
      });
      
      // Process matches where user is userId2
      snapshot2.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1 || data.user1 || data.user_id_1,
          userId2: data.userId2 || data.user2 || data.user_id_2,
          sharedEvents: data.sharedEvents || data.shared_events || data.events || [],
          matchStrength: data.matchStrength || data.match_strength || data.strength || 0,
          status: data.status || 'pending',
          chatId: data.chatId || data.chat_id || null,
          matchedAt: data.matchedAt || data.matched_at || data.createdAt || data.created_at,
          lastActivity: data.lastActivity || data.last_activity || data.updatedAt || data.updated_at,
          ...data
        });
      });
      
      console.log(`🧪 ${this.TAG}: Found ${matches.length} matches for user ${userId}`);
      return matches;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting user matches:`, error);
      return [];
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log(`🧪 ${this.TAG}: Getting profile for user: ${userId}`);
      
      // Try users collection first
      try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log(`🧪 ${this.TAG}: Found user profile in users collection`);
          return {
            id: userSnap.id,
            name: data.name || data.displayName || data.fullName || data.username,
            displayName: data.displayName || data.name || data.fullName || data.username,
            email: data.email,
            photoURL: data.photoURL || data.photo_url || data.avatar,
            ...data
          };
        }
      } catch (error) {
        console.log(`🧪 ${this.TAG}: User not found in users collection, trying profiles...`);
      }
      
      // Try profiles collection
      try {
        const profileRef = doc(db, COLLECTIONS.PROFILES || 'profiles', userId);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          console.log(`🧪 ${this.TAG}: Found user profile in profiles collection`);
          return {
            id: profileSnap.id,
            name: data.name || data.displayName || data.fullName || data.username,
            displayName: data.displayName || data.name || data.fullName || data.username,
            email: data.email,
            photoURL: data.photoURL || data.photo_url || data.avatar,
            ...data
          };
        }
      } catch (error) {
        console.log(`🧪 ${this.TAG}: User not found in profiles collection`);
      }
      
      console.log(`🧪 ${this.TAG}: No profile found for user ${userId}`);
      return null;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting user profile:`, error);
      return null;
    }
  }

  // Get matches with user profiles
  async getMatchesWithProfiles(userId: string): Promise<(FirestoreMatch & { otherUser: UserProfile | null })[]> {
    try {
      console.log(`🧪 ${this.TAG}: Getting matches with profiles for user: ${userId}`);
      
      const matches = await this.getUserMatches(userId);
      const matchesWithProfiles = await Promise.all(
        matches.map(async (match) => {
          // Determine which user is the "other" user
          const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
          const otherUser = await this.getUserProfile(otherUserId);
          
          return {
            ...match,
            otherUser
          };
        })
      );
      
      console.log(`🧪 ${this.TAG}: Found ${matchesWithProfiles.length} matches with profiles`);
      return matchesWithProfiles;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting matches with profiles:`, error);
      return [];
    }
  }

  // Search for matches by various criteria
  async searchMatches(criteria: {
    status?: string;
    minStrength?: number;
    maxStrength?: number;
    hasChat?: boolean;
    limit?: number;
  }): Promise<FirestoreMatch[]> {
    try {
      console.log(`🧪 ${this.TAG}: Searching matches with criteria:`, criteria);
      
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      let q = query(matchesRef);
      
      // Add filters based on criteria
      if (criteria.status) {
        q = query(q, where('status', '==', criteria.status));
      }
      
      if (criteria.hasChat !== undefined) {
        if (criteria.hasChat) {
          q = query(q, where('chatId', '!=', null));
        } else {
          q = query(q, where('chatId', '==', null));
        }
      }
      
      // Add ordering and limit
      q = query(q, orderBy('matchedAt', 'desc'));
      if (criteria.limit) {
        q = query(q, limit(criteria.limit));
      }
      
      const matchesSnapshot = await getDocs(q);
      
      const matches: FirestoreMatch[] = [];
      matchesSnapshot.forEach(doc => {
        const data = doc.data();
        const match: FirestoreMatch = {
          id: doc.id,
          userId1: data.userId1 || data.user1 || data.user_id_1,
          userId2: data.userId2 || data.user2 || data.user_id_2,
          sharedEvents: data.sharedEvents || data.shared_events || data.events || [],
          matchStrength: data.matchStrength || data.match_strength || data.strength || 0,
          status: data.status || 'pending',
          chatId: data.chatId || data.chat_id || null,
          matchedAt: data.matchedAt || data.matched_at || data.createdAt || data.created_at,
          lastActivity: data.lastActivity || data.last_activity || data.updatedAt || data.updated_at,
          ...data
        };
        
        // Apply additional filters
        if (criteria.minStrength && match.matchStrength < criteria.minStrength) {
          return;
        }
        if (criteria.maxStrength && match.matchStrength > criteria.maxStrength) {
          return;
        }
        
        matches.push(match);
      });
      
      console.log(`🧪 ${this.TAG}: Found ${matches.length} matches matching criteria`);
      return matches;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error searching matches:`, error);
      return [];
    }
  }

  // Get recent matches
  async getRecentMatches(limit: number = 10): Promise<FirestoreMatch[]> {
    try {
      console.log(`🧪 ${this.TAG}: Getting ${limit} recent matches`);
      
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      const q = query(
        matchesRef,
        orderBy('matchedAt', 'desc'),
        limit(limit)
      );
      
      const matchesSnapshot = await getDocs(q);
      
      const matches: FirestoreMatch[] = [];
      matchesSnapshot.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1 || data.user1 || data.user_id_1,
          userId2: data.userId2 || data.user2 || data.user_id_2,
          sharedEvents: data.sharedEvents || data.shared_events || data.events || [],
          matchStrength: data.matchStrength || data.match_strength || data.strength || 0,
          status: data.status || 'pending',
          chatId: data.chatId || data.chat_id || null,
          matchedAt: data.matchedAt || data.matched_at || data.createdAt || data.created_at,
          lastActivity: data.lastActivity || data.last_activity || data.updatedAt || data.updated_at,
          ...data
        });
      });
      
      console.log(`🧪 ${this.TAG}: Found ${matches.length} recent matches`);
      return matches;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting recent matches:`, error);
      return [];
    }
  }

  // Get match statistics
  async getMatchStatistics(): Promise<{
    totalMatches: number;
    pendingMatches: number;
    acceptedMatches: number;
    declinedMatches: number;
    averageStrength: number;
  }> {
    try {
      console.log(`🧪 ${this.TAG}: Getting match statistics`);
      
      const allMatches = await this.getAllMatches();
      
      const stats = {
        totalMatches: allMatches.length,
        pendingMatches: allMatches.filter(m => m.status === 'pending').length,
        acceptedMatches: allMatches.filter(m => m.status === 'accepted').length,
        declinedMatches: allMatches.filter(m => m.status === 'declined').length,
        averageStrength: allMatches.length > 0 
          ? allMatches.reduce((sum, m) => sum + m.matchStrength, 0) / allMatches.length 
          : 0
      };
      
      console.log(`🧪 ${this.TAG}: Match statistics:`, stats);
      return stats;
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: Error getting match statistics:`, error);
      return {
        totalMatches: 0,
        pendingMatches: 0,
        acceptedMatches: 0,
        declinedMatches: 0,
        averageStrength: 0
      };
    }
  }
}

export const firestoreMatchDiscoveryService = new FirestoreMatchDiscoveryService();
