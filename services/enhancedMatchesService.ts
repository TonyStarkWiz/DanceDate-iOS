import { auth, COLLECTIONS, db } from '@/config/firebase';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    Timestamp,
    where,
    writeBatch
} from 'firebase/firestore';

export interface MatchPreview {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerImageUrl?: string;
  eventId: string;
  eventTitle: string;
  matchTimestamp: Date;
  matchStrength: number;
  status: 'pending' | 'accepted' | 'declined';
}

export class EnhancedMatchesService {
  private static TAG = 'EnhancedMatchesService';

  /**
   * 🎯 LOAD ALL MATCHES - CLEAN TWO-APPROACH SOLUTION
   * Uses two different strategies to ensure matches are found even if one approach fails
   */
  static async loadAllMatches(currentUserId: string): Promise<MatchPreview[]> {
    console.log(`🧪 ${this.TAG}: 🎯 Loading all matches for user: ${currentUserId}`);
    
    const matchPreviews: MatchPreview[] = [];
    
    try {
      // 🎯 APPROACH 1: Try simplified query strategy first
      const approach1Success = await this.loadMatchesWithApproach1(currentUserId, matchPreviews);
      
      // 🎯 APPROACH 2: Fallback to alternative query strategy if approach 1 fails
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
   * Uses the data structure that BilateralMatchingService creates
   */
  private static async loadMatchesWithApproach1(
    currentUserId: string, 
    matchPreviews: MatchPreview[]
  ): Promise<boolean> {
    try {
      console.log(`🧪 ${this.TAG}: 🔄 Approach 1: Using simplified query strategy`);
      
      // 🎯 FIXED: Use correct data structure that BilateralMatchingService creates
      // users/{userId}/interested_events/{eventId}
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
          // 🎯 FIXED: Use correct data structure - events/{eventId}/interested_users/{userId}
          const eventInterestsRef = collection(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.INTERESTED_USERS);
          const eventInterestsSnapshot = await getDocs(eventInterestsRef);
          
          console.log(`🧪 ${this.TAG}: 📊 Approach 1: Event ${eventId} has ${eventInterestsSnapshot.docs.length} interested users`);
          
          // Check each interested user for mutual interest
          for (const userDoc of eventInterestsSnapshot.docs) {
            const potentialUserId = userDoc.id;
            if (potentialUserId !== currentUserId) {
              console.log(`🧪 ${this.TAG}: 🔍 Approach 1: Checking potential match: ${potentialUserId}`);
              
              try {
                // 🎯 FIXED: Check if this user is also interested in the same event
                const mutualCheckRef = doc(db, COLLECTIONS.USERS, potentialUserId, COLLECTIONS.INTERESTED_EVENTS, eventId);
                const mutualCheckSnapshot = await getDoc(mutualCheckRef);
                
                const hasMutualInterest = mutualCheckSnapshot.exists();
                
                console.log(`🧪 ${this.TAG}: 🔍 Approach 1: Potential match ${potentialUserId} has mutual interest: ${hasMutualInterest}`);
                
                                 if (hasMutualInterest) {
                   await this.addMatchToList(potentialUserId, eventId, eventTitle, matchPreviews, 'Approach 1', currentUserId);
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
   * 🎯 APPROACH 2: Alternative Query Strategy
   * Uses matches collection as fallback
   */
  private static async loadMatchesWithApproach2(
    currentUserId: string, 
    matchPreviews: MatchPreview[]
  ): Promise<boolean> {
    try {
      console.log(`🧪 ${this.TAG}: 🔄 Approach 2: Using fallback query strategy`);
      
      // Query matches collection for user's matches
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      const matchesQuery = query(
        matchesRef,
        where('userId1', '==', currentUserId)
      );
      const matchesSnapshot1 = await getDocs(matchesQuery);
      
      const matchesQuery2 = query(
        matchesRef,
        where('userId2', '==', currentUserId)
      );
      const matchesSnapshot2 = await getDocs(matchesQuery2);
      
      console.log(`🧪 ${this.TAG}: 📊 Approach 2: Found ${matchesSnapshot1.docs.length + matchesSnapshot2.docs.length} matches`);
      
      // Process matches where user is userId1
      for (const matchDoc of matchesSnapshot1.docs) {
        const matchData = matchDoc.data();
        await this.processMatchDocument(matchDoc.id, matchData, currentUserId, matchPreviews, 'Approach 2');
      }
      
      // Process matches where user is userId2
      for (const matchDoc of matchesSnapshot2.docs) {
        const matchData = matchDoc.data();
        await this.processMatchDocument(matchDoc.id, matchData, currentUserId, matchPreviews, 'Approach 2');
      }
      
      return true;
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Approach 2 failed`, error);
      return false;
    }
  }

  /**
   * 🎯 PROCESS MATCH DOCUMENT
   * Extracts match information from a match document
   */
  private static async processMatchDocument(
    matchId: string,
    matchData: any,
    currentUserId: string,
    matchPreviews: MatchPreview[],
    approach: string
  ) {
    try {
      const otherUserId = matchData.userId1 === currentUserId ? matchData.userId2 : matchData.userId1;
      
      // Get partner profile
      const partnerProfile = await this.getUserProfile(otherUserId);
      
      // Get event details
      const eventId = matchData.eventId || matchData.sharedEvents?.[0];
      const eventTitle = matchData.eventTitle || 'Unknown Event';
      
      const matchPreview: MatchPreview = {
        id: matchId,
        partnerId: otherUserId,
        partnerName: partnerProfile?.displayName || partnerProfile?.name || 'Anonymous',
        partnerImageUrl: partnerProfile?.photoURL,
        eventId: eventId,
        eventTitle: eventTitle,
        matchTimestamp: matchData.timestamp?.toDate() || new Date(),
        matchStrength: matchData.matchStrength || 85,
        status: matchData.status || 'pending'
      };
      
      // Avoid duplicates
      const existingMatch = matchPreviews.find(m => m.partnerId === otherUserId);
      if (!existingMatch) {
        matchPreviews.push(matchPreview);
        console.log(`🧪 ${this.TAG}: ✅ ${approach}: Added match with ${matchPreview.partnerName}`);
      }
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error processing match document`, error);
    }
  }

  /**
   * 🎯 ADD MATCH TO LIST
   * Adds a match to the list after getting partner profile
   */
  private static async addMatchToList(
    partnerId: string,
    eventId: string,
    eventTitle: string,
    matchPreviews: MatchPreview[],
    approach: string,
    currentUserId: string
  ) {
    try {
      // Get partner profile
      const partnerProfile = await this.getUserProfile(partnerId);
      
      // Create match preview
      const matchPreview: MatchPreview = {
        id: `${currentUserId}_${partnerId}_${eventId}`,
        partnerId: partnerId,
        partnerName: partnerProfile?.displayName || partnerProfile?.name || 'Anonymous',
        partnerImageUrl: partnerProfile?.photoURL,
        eventId: eventId,
        eventTitle: eventTitle,
        matchTimestamp: new Date(),
        matchStrength: 85, // Default match strength
        status: 'pending'
      };
      
      // Avoid duplicates
      const existingMatch = matchPreviews.find(m => m.partnerId === partnerId);
      if (!existingMatch) {
        matchPreviews.push(matchPreview);
        console.log(`🧪 ${this.TAG}: ✅ ${approach}: Added match with ${matchPreview.partnerName}`);
      }
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error adding match to list`, error);
    }
  }

  /**
   * 🎯 GET USER PROFILE
   * Retrieves user profile from Firestore
   */
  private static async getUserProfile(userId: string) {
    try {
      // Try users collection first
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: userSnap.id,
          name: data.name || data.displayName || data.fullName || data.username,
          displayName: data.displayName || data.name || data.fullName || data.username,
          email: data.email,
          photoURL: data.photoURL || data.photo_url || data.avatar,
          ...data
        };
      }
      
      // Try profiles collection as fallback
      const profileRef = doc(db, COLLECTIONS.PROFILES || 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        return {
          id: profileSnap.id,
          name: data.name || data.displayName || data.fullName || data.username,
          displayName: data.displayName || data.name || data.fullName || data.username,
          email: data.email,
          photoURL: data.photoURL || data.photo_url || data.avatar,
          ...data
        };
      }
      
      return null;
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error getting user profile for ${userId}`, error);
      return null;
    }
  }

  /**
   * 🎯 MARK INTEREST AND DETECT MATCH
   * Records user interest in an event and checks for bilateral matches
   */
  static async markInterestAndDetectMatch(
    eventId: string,
    eventTitle: string,
    intentType: string = 'either'
  ): Promise<{ matched: boolean; partnerId?: string; partnerName?: string; chatId?: string }> {
    console.log(`🧪 ${this.TAG}: 🎯 markInterestAndDetectMatch called for event: ${eventId} (${eventTitle})`);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn(`🧪 ${this.TAG}: ⚠️ No authenticated user`);
        return { matched: false };
      }
      
      const userId = currentUser.uid;
      const timestamp = Timestamp.now();
      
      // 🎯 WRITE INTEREST TO FIRESTORE
      const batch = writeBatch(db);
      
      // Collection 1: User's interested events
      const userInterestRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.INTERESTED_EVENTS, eventId);
      const userInterestData = {
        eventId: eventId,
        title: eventTitle,
        intent: intentType,
        timestamp: timestamp,
        status: 'active'
      };
      
      // Collection 2: Event's interested users
      const eventInterestRef = doc(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.INTERESTED_USERS, userId);
      const eventInterestData = {
        userId: userId,
        name: currentUser.displayName || 'Anonymous',
        email: currentUser.email || '',
        intent: intentType,
        timestamp: timestamp,
        status: 'active'
      };
      
      batch.set(userInterestRef, userInterestData);
      batch.set(eventInterestRef, eventInterestData);
      
      // Commit the batch operation
      await batch.commit();
      
      console.log(`🧪 ${this.TAG}: ✅ Interest written to Firestore successfully`);
      
      // 🎯 CHECK FOR BILATERAL MATCHES
      const matchResult = await this.checkForBilateralMatch(eventId, eventTitle);
      
      if (matchResult.matched) {
        console.log(`🧪 ${this.TAG}: 🎉 BILATERAL MATCH FOUND!`);
        
        // Create chat room for the match
        const chatId = await this.createChatRoomForMatch(
          matchResult.partnerId!,
          eventId,
          eventTitle
        );
        
        return { ...matchResult, chatId };
      } else {
        console.log(`🧪 ${this.TAG}: ℹ️ No bilateral match found yet`);
        return matchResult;
      }
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error in markInterestAndDetectMatch`, error);
      return { matched: false };
    }
  }

  /**
   * 🎯 CHECK FOR BILATERAL MATCH
   * Checks if there's mutual interest in the same event
   */
  private static async checkForBilateralMatch(
    eventId: string, 
    eventTitle: string
  ): Promise<{ matched: boolean; partnerId?: string; partnerName?: string }> {
    console.log(`🧪 ${this.TAG}: 🔍 checkForBilateralMatch called for event: ${eventId}`);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn(`🧪 ${this.TAG}: ⚠️ No authenticated user`);
        return { matched: false };
      }
      
      const userId = currentUser.uid;
      
      // 🎯 APPROACH 1: Check event's interested users collection
      const interestedUsersRef = collection(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.INTERESTED_USERS);
      const interestedUsersSnapshot = await getDocs(interestedUsersRef);
      
      // Find potential matches (other users interested in this event)
      const potentialMatches = interestedUsersSnapshot.docs.filter(doc => doc.id !== userId);
      
      if (potentialMatches.length === 0) {
        console.log(`🧪 ${this.TAG}: ℹ️ No potential matches found`);
        return { matched: false };
      }
      
      // 🎯 CHECK EACH POTENTIAL MATCH FOR BILATERAL INTEREST
      for (const potentialMatch of potentialMatches) {
        const potentialUserId = potentialMatch.id;
        
        // Check if potential user is also interested in current user's events
        const mutualInterestRef = collection(db, COLLECTIONS.USERS, potentialUserId, COLLECTIONS.INTERESTED_EVENTS);
        const mutualInterestSnapshot = await getDocs(mutualInterestRef);
        
        // 🎯 BILATERAL MATCH LOGIC: Check if there's mutual interest in the same event
        const hasBilateralInterest = mutualInterestSnapshot.docs.some(eventDoc => eventDoc.id === eventId);
        
        if (hasBilateralInterest) {
          // 🎯 SUCCESS: Get partner details
          const partnerProfile = await this.getUserProfile(potentialUserId);
          
          const partnerName = partnerProfile?.displayName || 
                            partnerProfile?.name || 
                            partnerProfile?.email || 
                            'Anonymous';
          
          console.log(`🧪 ${this.TAG}: 🎉 Bilateral match found: ${partnerName} (${potentialUserId})`);
          
          return {
            matched: true,
            partnerId: potentialUserId,
            partnerName: partnerName
          };
        }
      }
      
      console.log(`🧪 ${this.TAG}: ℹ️ No bilateral matches found`);
      return { matched: false };
      
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error checking for bilateral matches`, error);
      return { matched: false };
    }
  }

  /**
   * 🎯 CREATE CHAT ROOM FOR MATCH
   * Creates a chat room for matched users
   */
  private static async createChatRoomForMatch(
    partnerId: string,
    eventId: string,
    eventTitle: string
  ): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');
      
      const chatData = {
        userId1: currentUser.uid,
        userId2: partnerId,
        eventId: eventId,
        eventTitle: eventTitle,
        createdAt: Timestamp.now(),
        lastMessage: null,
        lastMessageTime: null
      };
      
      const chatRef = await addDoc(collection(db, COLLECTIONS.CHATS), chatData);
      console.log(`🧪 ${this.TAG}: ✅ Chat room created: ${chatRef.id}`);
      
      return chatRef.id;
    } catch (error) {
      console.error(`🧪 ${this.TAG}: ❌ Error creating chat room`, error);
      return '';
    }
  }
}

// Export singleton instance
export const enhancedMatchesService = new EnhancedMatchesService();
