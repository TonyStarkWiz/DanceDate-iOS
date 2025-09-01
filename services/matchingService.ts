import { COLLECTIONS, db } from '@/config/firebase';
import { Match, MatchStatus } from '@/types/matching';
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
}

class MatchingService {
  // Like another user
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
        console.log('🧪 MatchingService: Mutual match found! Creating match and chat...');
        
        // Create match record
        const matchData: Match = {
          id: `${fromUserId}_${toUserId}`,
          userId1: fromUserId < toUserId ? fromUserId : toUserId,
          userId2: fromUserId < toUserId ? toUserId : fromUserId,
          eventId: eventId || '',
          matchStrength: this.calculateMatchStrength(fromUserId, toUserId),
          status: MatchStatus.ACCEPTED,
          createdAt: new Date(),
          lastInteraction: new Date(),
          isMutual: true
        };

        await setDoc(doc(db, COLLECTIONS.MATCHES, matchData.id), {
          ...matchData,
          createdAt: serverTimestamp(),
          lastInteraction: serverTimestamp()
        });

        // Create chat
        const chatId = await this.createChat(fromUserId, toUserId, eventId);
        
        console.log('🧪 MatchingService: Match and chat created successfully');
        return {
          isMatch: true,
          matchId: matchData.id,
          chatId,
          message: "It's a match! 🎉"
        };
      }

      console.log('🧪 MatchingService: Like recorded, waiting for mutual interest');
      return { 
        isMatch: false, 
        message: 'Like sent! They\'ll be notified of your interest.' 
      };

    } catch (error) {
      console.error('🧪 MatchingService: Error liking user:', error);
      throw error;
    }
  }

  // Dislike/Pass on a user
  async dislikeUser(fromUserId: string, toUserId: string): Promise<void> {
    try {
      console.log('🧪 MatchingService: Disliking user', { fromUserId, toUserId });
      
      // Create dislike record to prevent future suggestions
      const dislikeData = {
        fromUserId,
        toUserId,
        timestamp: new Date(),
        action: 'dislike'
      };

      await addDoc(collection(db, COLLECTIONS.DISLIKES), dislikeData);
      console.log('🧪 MatchingService: Dislike recorded');
      
    } catch (error) {
      console.error('🧪 MatchingService: Error disliking user:', error);
      throw error;
    }
  }

  // Get potential matches for a user
  async getPotentialMatches(userId: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      console.log('🧪 MatchingService: Getting potential matches for user:', userId);
      
      // Get user's profile to understand preferences
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        console.log('🧪 MatchingService: User profile not found');
        return [];
      }

      // Get users who haven't been liked/disliked by current user
      const [likedUsers, dislikedUsers] = await Promise.all([
        this.getLikedUsers(userId),
        this.getDislikedUsers(userId)
      ]);

      const excludedUsers = new Set([userId, ...likedUsers, ...dislikedUsers]);
      
      // Query for potential matches
      const usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('id', '!=', userId),
        orderBy('lastActive', 'desc'),
        limit(limit * 2) // Get more to filter
      );

      const snapshot = await getDocs(usersQuery);
      const potentialMatches: UserProfile[] = [];

      snapshot.forEach(doc => {
        const userData = doc.data();
        const userProfile: UserProfile = {
          id: doc.id,
          name: userData.name || userData.displayName || 'Unknown',
          avatarUrl: userData.avatarUrl || userData.photoUrl,
          bio: userData.bio || '',
          danceStyles: userData.danceStyles || [],
          experienceLevel: userData.experienceLevel || 'beginner',
          location: userData.location,
          lastActive: userData.lastActive?.toDate() || new Date(),
          interestedEvents: userData.interestedEvents || []
        };

        // Filter out excluded users
        if (!excludedUsers.has(userProfile.id)) {
          potentialMatches.push(userProfile);
        }
      });

      // Sort by match strength and limit results
      const scoredMatches = potentialMatches
        .map(match => ({
          ...match,
          matchStrength: this.calculateMatchStrength(userId, match.id)
        }))
        .sort((a, b) => b.matchStrength - a.matchStrength)
        .slice(0, limit);

      console.log('🧪 MatchingService: Found', scoredMatches.length, 'potential matches');
      return scoredMatches;

    } catch (error) {
      console.error('🧪 MatchingService: Error getting potential matches:', error);
      throw error;
    }
  }

  // Get user's matches
  async getUserMatches(userId: string): Promise<Match[]> {
    try {
      console.log('🧪 MatchingService: Getting matches for user:', userId);
      
      const matchesQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId1', '==', userId),
        where('status', '==', MatchStatus.ACCEPTED)
      );

      const matchesQuery2 = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId2', '==', userId),
        where('status', '==', MatchStatus.ACCEPTED)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(matchesQuery),
        getDocs(matchesQuery2)
      ]);

      const matches: Match[] = [];

      snapshot1.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1,
          userId2: data.userId2,
          eventId: data.eventId,
          matchStrength: data.matchStrength,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastInteraction: data.lastInteraction?.toDate() || new Date(),
          isMutual: data.isMutual
        });
      });

      snapshot2.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          userId1: data.userId1,
          userId2: data.userId2,
          eventId: data.eventId,
          matchStrength: data.matchStrength,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastInteraction: data.lastInteraction?.toDate() || new Date(),
          isMutual: data.isMutual
        });
      });

      console.log('🧪 MatchingService: Found', matches.length, 'matches');
      return matches;

    } catch (error) {
      console.error('🧪 MatchingService: Error getting user matches:', error);
      throw error;
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

  // Real-time listener for new matches
  onNewMatch(userId: string, callback: (match: Match) => void): () => void {
    console.log('🧪 MatchingService: Setting up real-time match listener for user:', userId);
    
    const matchesQuery = query(
      collection(db, COLLECTIONS.MATCHES),
      where('userId1', '==', userId),
      where('status', '==', MatchStatus.ACCEPTED)
    );

    const matchesQuery2 = query(
      collection(db, COLLECTIONS.MATCHES),
      where('userId2', '==', userId),
      where('status', '==', MatchStatus.ACCEPTED)
    );

    const unsubscribe1 = onSnapshot(matchesQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const match: Match = {
            id: change.doc.id,
            userId1: data.userId1,
            userId2: data.userId2,
            eventId: data.eventId,
            matchStrength: data.matchStrength,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastInteraction: data.lastInteraction?.toDate() || new Date(),
            isMutual: data.isMutual
          };
          callback(match);
        }
      });
    });

    const unsubscribe2 = onSnapshot(matchesQuery2, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const match: Match = {
            id: change.doc.id,
            userId1: data.userId1,
            userId2: data.userId2,
            eventId: data.eventId,
            matchStrength: data.matchStrength,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastInteraction: data.lastInteraction?.toDate() || new Date(),
            isMutual: data.isMutual
          };
          callback(match);
        }
      });
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
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

  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        name: data.name || data.displayName || 'Unknown',
        avatarUrl: data.avatarUrl || data.photoUrl,
        bio: data.bio || '',
        danceStyles: data.danceStyles || [],
        experienceLevel: data.experienceLevel || 'beginner',
        location: data.location,
        lastActive: data.lastActive?.toDate() || new Date(),
        interestedEvents: data.interestedEvents || []
      };
    }
    return null;
  }

  private calculateMatchStrength(userId1: string, userId2: string): number {
    // Simple match strength calculation
    // In a real app, this would consider:
    // - Common dance styles
    // - Experience level compatibility
    // - Location proximity
    // - Availability overlap
    // - Event interests
    
    // For now, return a random score between 60-95
    return Math.floor(Math.random() * 35) + 60;
  }

  private async createChat(userId1: string, userId2: string, eventId?: string): Promise<string> {
    try {
      console.log('🧪 MatchingService: Creating chat between users:', userId1, userId2);
      
      const chatData = {
        participants: [userId1, userId2],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        eventId: eventId || null,
        isActive: true
      };

      const chatRef = await addDoc(collection(db, COLLECTIONS.CHATS), chatData);
      console.log('🧪 MatchingService: Chat created with ID:', chatRef.id);
      
      return chatRef.id;
    } catch (error) {
      console.error('🧪 MatchingService: Error creating chat:', error);
      throw error;
    }
  }
}

export const matchingService = new MatchingService();


