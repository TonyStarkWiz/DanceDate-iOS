import { COLLECTIONS, auth, db } from '@/config/firebase';
import {
  Unsubscribe,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore';

export interface BilateralMatchResult {
  matched: boolean;
  partnerId?: string | null;
  partnerName?: string | null;
  eventId: string;
  eventTitle: string;
  chatId?: string | null;
  matchId?: string | null;
  error?: string;
}

export interface UserInterest {
  eventId: string;
  title: string;
  intent: string;
  timestamp: any;
  status: string;
  // we'll also return the doc id when reading
  _id?: string;
}

export interface EventInterest {
  userId: string;
  name: string;
  email: string;
  intent: string;
  timestamp: any;
  status: string;
  // we'll also return the doc id when reading
  _id?: string;
}

class BilateralMatchingService {
  private readonly TAG = 'BilateralMatchingService';

  // If true, create a pending match doc when bilateral is detected (before accept)
  private readonly WRITE_PENDING_MATCH = true;

  /**
   * 🎯 SANITIZE DOC ID FOR FIRESTORE PATHS
   * Prevents issues with URLs, special characters, etc.
   */
  private toDocId(raw: string): string {
    // Stable, URL-safe; avoids '/', '+', '=' collisions from base64
    return encodeURIComponent(raw);
  }

  /**
   * 🎯 SYMMETRIC "IS INTERESTED" CHECKER FOR UI
   * Reads from the same place we write to
   */
  async isInterested(uid: string, eventId: string): Promise<boolean> {
    try {
      const eventDocId = this.toDocId(String(eventId));
      const ref = doc(db, COLLECTIONS.USERS, uid, 'interested_events', eventDocId);
      const docSnapshot = await getDoc(ref);
      const exists = docSnapshot.exists();
      const status = docSnapshot.data()?.status ?? 'active';
      return exists && status === 'active';
    } catch (error) {
      console.error('🧪 Error checking interest:', error);
      return false;
    }
  }

  /**
   * 🎯 UNMARK INTEREST (SOFT DELETE)
   * Mirrors the same IDs we use for writing
   */
  async unmarkInterest(uid: string, eventId: string): Promise<void> {
    try {
      const eventDocId = this.toDocId(String(eventId));
      
      // Soft delete both sides
      await Promise.all([
        setDoc(
          doc(db, COLLECTIONS.USERS, uid, 'interested_events', eventDocId), 
          { status: 'inactive' }, 
          { merge: true }
        ),
        setDoc(
          doc(db, COLLECTIONS.EVENTS, eventDocId, 'interested_users', uid), 
          { status: 'inactive' }, 
          { merge: true }
        ),
      ]);

      // Also remove from flat collection for compatibility
      try {
        await deleteDoc(doc(db, COLLECTIONS.EVENT_INTERESTS, `${uid}_${eventId}`));
      } catch (compatError) {
        console.error('🧪 ⚠️ Error removing compatibility doc:', compatError);
      }

      console.log('🧪 ✅ Interest unmarked successfully');
    } catch (error) {
      console.error('🧪 Error unmarking interest:', error);
      throw error;
    }
  }

  /**
   * 🎯 REAL-TIME INTEREST LISTENER FOR UI
   * Subscribe to interest changes to keep UI in sync
   */
  watchInterest(uid: string, eventId: string, callback: (isInterested: boolean) => void): Unsubscribe {
    const eventDocId = this.toDocId(String(eventId));
    const ref = doc(db, COLLECTIONS.USERS, uid, 'interested_events', eventDocId);
    
    return onSnapshot(
      ref, 
      (snap) => {
        const isInterested = snap.exists() && (snap.data()?.status ?? 'active') === 'active';
        callback(isInterested);
      }, 
      (err) => {
        console.error('🧪 watchInterest error', err);
        callback(false);
      }
    );
  }

  /**
   * 🎯 MARK INTEREST AND DETECT BILATERAL MATCH
   */
  async markInterestAndDetectMatch(
    eventId: string | number,
    eventTitle: string,
    intentType: string
  ): Promise<BilateralMatchResult> {
    console.log(`🧪 ${this.TAG}: markInterestAndDetectMatch for event: ${eventId} (${eventTitle})`);

    const eventIdStr = String(eventId);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('🧪 ⚠️ No authenticated user');
        return { matched: false, eventId: eventIdStr, eventTitle };
      }

      const userId = currentUser.uid;
      const now = serverTimestamp(); // Use server timestamp for consistency
      const eventDocId = this.toDocId(eventIdStr); // Sanitize doc ID

      // 🎯 WRITE/UPSERT USER PROFILE
      // Write both displayName and name for UI compatibility
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await setDoc(
        userRef,
        {
          displayName: currentUser.displayName || 'Anonymous',
          name: currentUser.displayName || 'Anonymous',
          email: currentUser.email || '',
          updatedAt: now,
          createdAt: now
        },
        { merge: true }
      );

      // 🎯 WRITE INTEREST (BATCH)
      const batch = writeBatch(db);

      // user/{uid}/interested_events/{eventDocId} - using sanitized ID
      const userInterestRef = doc(db, COLLECTIONS.USERS, userId, 'interested_events', eventDocId);
      const userInterestData: UserInterest = {
        eventId: eventIdStr, // Store raw ID in document fields
        title: eventTitle,
        intent: intentType,
        timestamp: now,
        status: 'active'
      };

      // events/{eventDocId}/interested_users/{uid} - using sanitized ID
      const eventInterestRef = doc(db, COLLECTIONS.EVENTS, eventDocId, 'interested_users', userId);
      const eventInterestData: EventInterest = {
        userId,
        name: currentUser.displayName || 'Anonymous',
        email: currentUser.email || '',
        intent: intentType,
        timestamp: now,
        status: 'active'
      };

      batch.set(userInterestRef, userInterestData);
      batch.set(eventInterestRef, eventInterestData);

      await batch.commit();
      console.log('🧪 ✅ Interest written to Firestore');

      // 🎯 DUAL-WRITE COMPATIBILITY DOC (for UI that reads flat collection)
      try {
        await setDoc(
          doc(db, COLLECTIONS.EVENT_INTERESTS, `${userId}_${eventIdStr}`),
          {
            userId,
            eventId: eventIdStr,
            eventTitle: eventTitle,
            eventInstructor: 'Unknown', // Placeholder
            eventLocation: 'Unknown', // Placeholder  
            eventSource: 'bilateral_matching',
            interestedAt: serverTimestamp(),
            interested: true,
            status: 'active'
          },
          { merge: true }
        );
        console.log('🧪 ✅ Compatibility doc written to flat collection');
      } catch (compatError) {
        console.error('🧪 ⚠️ Error writing compatibility doc:', compatError);
        // Don't fail the whole operation for compatibility doc
      }

      // 🎯 CHECK FOR BILATERAL MATCH
      const matchResult = await this.checkForBilateralMatch(eventIdStr, eventTitle);

      if (matchResult.matched && matchResult.partnerId) {
        console.log('🧪 🎉 Bilateral match detected');

        // Optionally create/ensure a pending match record (helps the UI show it)
        let pendingMatchId: string | undefined;
        if (this.WRITE_PENDING_MATCH) {
          pendingMatchId = await this.createOrUpdateMatchDoc(
            userId,
            matchResult.partnerId,
            [eventIdStr],
            'pending'
          );
        }

        // Create chat room for the match
        const chatId = await this.createChatRoomForMatch(matchResult.partnerId, eventIdStr, eventTitle);

        // Update match doc to accepted when chat is created (or keep pending if you want user action)
        const finalMatchId =
          (await this.createOrUpdateMatchDoc(userId, matchResult.partnerId, [eventIdStr], 'accepted', chatId)) ||
          pendingMatchId ||
          null;

        return { ...matchResult, chatId: chatId ?? null, matchId: finalMatchId };
      } else {
        console.log('🧪 ℹ️ No bilateral match yet');
        return matchResult;
      }
    } catch (error) {
      console.error('🧪 ❌ Error in markInterestAndDetectMatch', error);
      return {
        matched: false,
        eventId: String(eventId),
        eventTitle,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 🎯 CHECK FOR BILATERAL MATCH
   */
  private async checkForBilateralMatch(eventId: string, eventTitle: string): Promise<BilateralMatchResult> {
    console.log(`🧪 ${this.TAG}: checkForBilateralMatch for event: ${eventId}`);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('🧪 ⚠️ No authenticated user');
        return { matched: false, eventId, eventTitle };
      }

      const userId = currentUser.uid;

      // All users who marked interest in this event (except me)
      const eventDocId = this.toDocId(eventId);
      const interestedUsersSnapshot = await getDocs(
        collection(db, COLLECTIONS.EVENTS, eventDocId, 'interested_users')
      );

      const potentialMatches = interestedUsersSnapshot.docs.filter((d) => d.id !== userId);

      if (potentialMatches.length === 0) {
        console.log('🧪 ℹ️ No potential matches found');
        return { matched: false, eventId, eventTitle };
      }

      // For each candidate, verify they still have active interest (bilateral)
      for (const candidate of potentialMatches) {
        const otherUserId = candidate.id;

        const mutualSnapshot = await getDocs(collection(db, COLLECTIONS.USERS, otherUserId, 'interested_events'));
        const hasBilateralInterest = mutualSnapshot.docs.some(
          (eventDoc) => eventDoc.id === eventId && (eventDoc.data()?.status ?? 'active') === 'active'
        );

        if (!hasBilateralInterest) continue;

        // Resolve a friendly partner name
        const partnerSnap = await getDoc(doc(db, COLLECTIONS.USERS, otherUserId));
        const partnerData = partnerSnap.exists() ? partnerSnap.data() : undefined;
        const partnerName =
          (partnerData as any)?.name ||
          (partnerData as any)?.displayName ||
          (partnerData as any)?.username ||
          (partnerData as any)?.email ||
          'Anonymous';

        console.log(`🧪 🎉 Bilateral match: ${partnerName} (${otherUserId})`);
        return { matched: true, partnerId: otherUserId, partnerName, eventId, eventTitle };
      }

      console.log('🧪 ℹ️ No bilateral matches found');
      return { matched: false, eventId, eventTitle };
    } catch (error) {
      console.error('🧪 ❌ Error checking for bilateral match', error);
      return {
        matched: false,
        eventId,
        eventTitle,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 🧱 Create/Update a match doc in the `matches` collection (so the UI can render it)
   */
  private async createOrUpdateMatchDoc(
    userId1: string,
    userId2: string,
    sharedEventIds: string[],
    status: 'pending' | 'accepted' | 'declined' | 'expired',
    chatId?: string | null
  ): Promise<string> {
    const [a, b] = [userId1, userId2].sort();
    const matchId = `${a}_${b}`;
    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);

    const nowSrv = serverTimestamp();
    const strength = this.calculateMatchStrength(sharedEventIds.length, Math.max(sharedEventIds.length, 1));

    await setDoc(
      matchRef,
      {
        userId1: a,
        userId2: b,
        participants: [a, b], // Add participants array for getUserMatches query compatibility
        sharedEvents: sharedEventIds,
        matchStrength: strength,
        status,
        chatId: chatId ?? null,
        matchedAt: nowSrv,
        lastActivity: nowSrv
      },
      { merge: true }
    );

    return matchId;
  }

  /**
   * 🎯 CREATE CHAT ROOM FOR MATCH
   */
  private async createChatRoomForMatch(partnerId: string, eventId: string, eventTitle: string): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const userId = currentUser.uid;

      // Deterministic chat room ID (sorted user IDs)
      const chatRoomId = [userId, partnerId].sort().join('_');

      // If chat already exists, return it
      const chatRef = doc(db, COLLECTIONS.CHATS, chatRoomId);
      const existingChatSnap = await getDoc(chatRef);
      if (existingChatSnap.exists()) {
        console.log(`🧪 💬 Chat already exists: ${chatRoomId}`);
        return chatRoomId;
      }

      // Create chat
      await setDoc(chatRef, {
        participants: [userId, partnerId],
        lastMessage: "You matched! Start chatting to plan your dance event.",
        lastMessageTime: serverTimestamp(),
        eventId,
        eventTitle,
        matchType: 'bilateral',
        createdAt: serverTimestamp()
      });

      // Initial system message (sender must be auth user for rules)
      await addDoc(collection(db, COLLECTIONS.CHATS, chatRoomId, 'messages'), {
        text: `🎉 You matched with each other for '${eventTitle}'! Start chatting to plan your dance event.`,
        senderId: userId,
        timestamp: serverTimestamp(),
        type: 'system',
        read: false
      });

      console.log(`🧪 ✅ Chat created for match: ${chatRoomId}`);
      return chatRoomId;
    } catch (error) {
      console.error('🧪 ❌ Error creating chat room for match', error);
      return null;
    }
  }

  // --- Utilities ------------------------------------------------------------

  private calculateMatchStrength(sharedCount: number, totalUserInterests: number): number {
    const base = (sharedCount / Math.max(totalUserInterests, 1)) * 100;
    const bonus = Math.min(sharedCount * 10, 30);
    return Math.min(Math.round(base + bonus), 100);
  }

  /**
   * 📥 GET USER'S INTERESTS (returns IDs too)
   */
  async getUserInterests(userId: string): Promise<UserInterest[]> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log(`🧪 ℹ️ No user doc for ${userId}, empty interests`);
        return [];
      }

      const interestsSnapshot = await getDocs(collection(db, COLLECTIONS.USERS, userId, 'interested_events'));

      return interestsSnapshot.docs.map((d) => {
        const data = d.data() as UserInterest;
        // ensure eventId is present and include doc id
        return { ...data, _id: d.id, eventId: data.eventId ?? d.id };
      });
    } catch (error) {
      console.error('🧪 ❌ Error getting user interests', error);
      return [];
    }
  }

  /**
   * 📥 GET EVENT'S INTERESTED USERS (returns IDs too)
   */
  async getEventInterestedUsers(eventId: string): Promise<EventInterest[]> {
    try {
      const usersSnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS, eventId, 'interested_users'));

      return usersSnapshot.docs.map((d) => {
        const data = d.data() as EventInterest;
        // ensure userId is present and include doc id
        return { ...data, _id: d.id, userId: data.userId ?? d.id };
      });
    } catch (error) {
      console.error('🧪 ❌ Error getting event interested users', error);
      return [];
    }
  }
}

export const bilateralMatchingService = new BilateralMatchingService();
