import { COLLECTIONS, db } from '@/config/firebase';
import { Match, MatchStatus } from '@/types/matching';
import {
    addDoc,
    collection,
    doc,
    documentId,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    where
} from 'firebase/firestore';

export interface LikeAction {
  fromUserId: string;
  toUserId: string;
  eventId?: string;
  timestamp: Date;
  message?: string;
}

export interface MatchResult {
  isMatch: boolean;
  matchId?: string;
  chatId?: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  danceStyles?: string[];
  experienceLevel?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  lastActive: Date;
  interestedEvents?: string[];
  matches?: string[]; // Array of match IDs
}

// Firestore Match interface based on your actual schema
export interface FirestoreMatch {
  id: string;
  userId1: string;
  userId2: string;
  eventId?: string;
  matchStrength?: number;
  status?: string;
  createdAt?: any;
  lastInteraction?: any;
  isMutual?: boolean;
}

class MatchingService {
  // Get user's matches using the actual Firestore structure
  async getUserMatches(userId: string): Promise<Match[]> {
    try {
      console.log('🧪 MatchingService: Getting matches for user:', userId);
      console.log('🧪 MatchingService: User ID type:', typeof userId);
      console.log('🧪 MatchingService: User ID length:', userId.length);
      
      // Query matches collection where userId matches the current user
      const matchesQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId', '==', userId)
      );
      
      console.log('🧪 MatchingService: Created query with userId:', userId);
      console.log('🧪 MatchingService: Query object:', matchesQuery);
      
      const matchesSnapshot = await getDocs(matchesQuery);
      console.log('🧪 MatchingService: Query executed successfully');
      console.log('🧪 MatchingService: Found', matchesSnapshot.size, 'matches for user:', userId);
      
      // Log all documents in the collection for debugging
      const allMatchesQuery = query(collection(db, COLLECTIONS.MATCHES));
      const allMatchesSnapshot = await getDocs(allMatchesQuery);
      console.log('🧪 MatchingService: Total documents in matches collection:', allMatchesSnapshot.size);
      
      allMatchesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('🧪 MatchingService: Document ID:', doc.id);
        console.log('🧪 MatchingService: Document userId:', data.userId);
        console.log('🧪 MatchingService: Document partnerId:', data.partnerId);
        console.log('🧪 MatchingService: Document partnerName:', data.partnerName);
        console.log('🧪 MatchingService: Comparing userId:', userId, 'with document userId:', data.userId);
        console.log('🧪 MatchingService: Match?', userId === data.userId);
      });
      
      const matches: Match[] = [];
      
      matchesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('🧪 MatchingService: Processing match:', doc.id, 'data:', data);
        
        // Convert Firestore timestamp to Date
        const createdAt = data.createdAt?.toDate?.() || data.matchedAt ? new Date(data.matchedAt) : new Date();
        const lastInteraction = data.updatedAt?.toDate?.() || data.matchedAt ? new Date(data.matchedAt) : new Date();
        
        const match: Match = {
          id: doc.id,
          userId1: userId, // Current user
          userId2: data.partnerId || `partner_${doc.id}`, // Partner's ID or fallback
          eventId: '', // Not available in this structure
          matchStrength: data.score || 75, // Use score field
          status: this.mapFirestoreStatus(data.status),
          createdAt: createdAt,
          lastInteraction: lastInteraction,
          isMutual: true,
          // Additional fields from your structure
          partnerName: data.partnerName,
          partnerLocation: data.partnerLocation,
          partnerBio: data.partnerBio,
          matchType: data.matchType,
          partnerInterests: data.partnerInterests
        };
        
        console.log('🧪 MatchingService: Created match object:', match);
        matches.push(match);
      });
      
      console.log('🧪 MatchingService: Final matches array:', matches);
      console.log('🧪 MatchingService: Converted to', matches.length, 'matches');
      return matches;

    } catch (error) {
      console.error('🧪 MatchingService: Error getting user matches:', error);
      console.error('🧪 MatchingService: Error details:', error instanceof Error ? error.message : String(error));
      console.error('🧪 MatchingService: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  // Map Firestore status to MatchStatus enum
  private mapFirestoreStatus(status?: string): MatchStatus {
    switch (status) {
      case 'matched':
      case 'active':
      case 'accepted':
        return MatchStatus.ACCEPTED;
      case 'blocked':
      case 'declined':
        return MatchStatus.DECLINED;
      case 'deleted':
      case 'expired':
        return MatchStatus.EXPIRED;
      case 'pending':
        return MatchStatus.PENDING;
      default:
        return MatchStatus.ACCEPTED; // Default to accepted for matched status
    }
  }

  // Get profiles for a list of user IDs
  async getProfiles(userIds: string[]): Promise<UserProfile[]> {
    try {
      console.log('🧪 MatchingService: Getting profiles for', userIds.length, 'users');
      
      const ids = [...new Set(userIds)];
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

      const results: UserProfile[] = [];
      for (const chunk of chunks) {
        const q = query(collection(db, COLLECTIONS.USERS), where(documentId(), 'in', chunk));
        const snap = await getDocs(q);
        snap.docs.forEach(d => results.push({ id: d.id, ...(d.data() as any) }));
      }
      
      console.log('🧪 MatchingService: Retrieved', results.length, 'profiles');
      return results;
    } catch (error) {
      console.error('🧪 MatchingService: Error getting profiles:', error);
      return [];
    }
  }

  // Real-time listener for new matches using the actual Firestore structure
  onUserMatches(userId: string, callback: (matches: Match[]) => void): () => void {
    console.log('🧪 MatchingService: Setting up real-time match listener for user:', userId);
    
    // Listen to matches collection where userId matches the current user
    const matchesQuery = query(
      collection(db, COLLECTIONS.MATCHES),
      where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(matchesQuery, (matchesSnapshot) => {
      console.log('🧪 MatchingService: Real-time update - found', matchesSnapshot.size, 'matches');
      
      const matches: Match[] = [];
      
      matchesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('🧪 MatchingService: Real-time processing match:', doc.id, 'data:', data);
        
        // Convert Firestore timestamp to Date
        const createdAt = data.createdAt?.toDate?.() || data.matchedAt ? new Date(data.matchedAt) : new Date();
        const lastInteraction = data.updatedAt?.toDate?.() || data.matchedAt ? new Date(data.matchedAt) : new Date();
        
        matches.push({
          id: doc.id,
          userId1: userId, // Current user
          userId2: data.partnerId, // Partner's ID
          eventId: '', // Not available in this structure
          matchStrength: data.score || 75, // Use score field
          status: this.mapFirestoreStatus(data.status),
          createdAt: createdAt,
          lastInteraction: lastInteraction,
          isMutual: true,
          // Additional fields from your structure
          partnerName: data.partnerName,
          partnerLocation: data.partnerLocation,
          partnerBio: data.partnerBio,
          matchType: data.matchType,
          partnerInterests: data.partnerInterests
        });
      });
      
      console.log('🧪 MatchingService: Real-time update - converted to', matches.length, 'matches');
      callback(matches);
    });

    return unsubscribe;
  }

  // Like another user (updated to work with actual schema)
  async likeUser(fromUserId: string, toUserId: string, eventId?: string, message?: string): Promise<MatchResult> {
    try {
      console.log('🧪 MatchingService: Starting like process', { fromUserId, toUserId, eventId });
      
      // Check if already liked
      const existingLike = await this.getLike(fromUserId, toUserId);
      if (existingLike) {
        console.log('🧪 MatchingService: Already liked this user');
        return { isMatch: false, message: 'Already liked this user' };
      }

      // Create like record
      const likeData: LikeAction = {
        fromUserId,
        toUserId,
        eventId,
        timestamp: new Date(),
        message
      };

      const likeRef = await addDoc(collection(db, COLLECTIONS.LIKES), likeData);
      console.log('🧪 MatchingService: Like created with ID:', likeRef.id);

      // Check if this creates a mutual match
      const mutualLike = await this.getLike(toUserId, fromUserId);
      
      if (mutualLike) {
        console.log('🧪 MatchingService: Mutual match found! Creating match...');
        
        // Create match using actual schema
        const matchId = await this.createMatch(fromUserId, toUserId, eventId, 75);
        
        console.log('🧪 MatchingService: Match created successfully with ID:', matchId);
        return { 
          isMatch: true, 
          matchId,
          message: 'It\'s a match!' 
        };
      }

      return { isMatch: false, message: 'Like sent!' };
      
    } catch (error) {
      console.error('🧪 MatchingService: Error in like process:', error);
      throw error;
    }
  }

  // Create a match using the same pattern as your Android app
  async createMatch(userId1: string, userId2: string, eventId?: string, matchStrength?: number): Promise<string> {
    try {
      console.log('🧪 MatchingService: Creating match between users:', userId1, userId2);
      
      // Create match document with the same structure as your Android app
      const matchId = `match_${userId1}_${userId2}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const matchData = {
        userId: userId1, // The user who owns this match document
        partnerId: userId2, // The matched user's ID
        partnerName: `Dance Partner ${userId2.slice(0, 8)}...`,
        partnerLocation: 'New York',
        partnerBio: 'Passionate dancer looking for partners!',
        matchType: 'dance_partner',
        partnerInterests: ['Salsa', 'Bachata', 'Kizomba'],
        score: matchStrength || 85,
        status: 'matched',
        matchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('🧪 MatchingService: Creating match document with ID:', matchId);
      console.log('🧪 MatchingService: Match data:', matchData);
      
      // Create the match document in Firestore
      await setDoc(doc(db, COLLECTIONS.MATCHES, matchId), matchData);
      console.log('🧪 MatchingService: Successfully created match document');
      
      return matchId;
    } catch (error) {
      console.error('🧪 MatchingService: Error creating match:', error);
      throw error;
    }
  }

  // Add match object to user's matches array
  private async addMatchToUser(userId: string, matchObject: any): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const matches = userData.matches || [];
        
        // Check if match already exists
        const existingMatch = matches.find((m: any) => 
          (typeof m === 'object' && m.uid === matchObject.uid) ||
          (typeof m === 'string' && m === matchObject.uid)
        );
        
        if (!existingMatch) {
          matches.push(matchObject);
          await setDoc(userRef, { matches }, { merge: true });
          console.log('🧪 MatchingService: Added match object to user', userId);
        } else {
          console.log('🧪 MatchingService: Match already exists for user', userId);
        }
      }
    } catch (error) {
      console.error('🧪 MatchingService: Error adding match to user:', error);
    }
  }

  // Get pending likes (users who liked current user)
  async getPendingLikes(userId: string): Promise<LikeAction[]> {
    try {
      console.log('🧪 MatchingService: Getting pending likes for user:', userId);
      
      const likesQuery = query(
        collection(db, COLLECTIONS.LIKES),
        where('toUserId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(likesQuery);
      const pendingLikes: LikeAction[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        pendingLikes.push({
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          eventId: data.eventId,
          timestamp: data.timestamp?.toDate() || new Date(),
          message: data.message
        });
      });

      console.log('🧪 MatchingService: Found', pendingLikes.length, 'pending likes');
      return pendingLikes;

    } catch (error) {
      console.error('🧪 MatchingService: Error getting pending likes:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getLike(fromUserId: string, toUserId: string): Promise<LikeAction | null> {
    const likesQuery = query(
      collection(db, COLLECTIONS.LIKES),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    );

    const snapshot = await getDocs(likesQuery);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return {
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        eventId: data.eventId,
        timestamp: data.timestamp?.toDate() || new Date(),
        message: data.message
      };
    }
    return null;
  }

  private async getLikedUsers(userId: string): Promise<string[]> {
    const likesQuery = query(
      collection(db, COLLECTIONS.LIKES),
      where('fromUserId', '==', userId)
    );

    const snapshot = await getDocs(likesQuery);
    return snapshot.docs.map(doc => doc.data().toUserId);
  }

  private async getDislikedUsers(userId: string): Promise<string[]> {
    const dislikesQuery = query(
      collection(db, COLLECTIONS.DISLIKES),
      where('fromUserId', '==', userId)
    );

    const snapshot = await getDocs(dislikesQuery);
    return snapshot.docs.map(doc => doc.data().toUserId);
  }

  private calculateMatchStrength(userId1: string, userId2: string): number {
    // Simple match strength calculation
    return Math.floor(Math.random() * 40) + 60; // 60-100 range
  }
}

export const matchingService = new MatchingService();


