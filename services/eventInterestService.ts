import { COLLECTIONS, db, toDocId } from '@/config/firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  where
} from 'firebase/firestore';
import { DisplayableEvent } from './danceEventsApi';

export interface EventInterest {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventInstructor: string;
  eventLocation: string;
  eventSource: string;
  interestedAt: Date;
  eventData?: DisplayableEvent;
  interested?: boolean; // Optional flag for easier queries/rules
}

class EventInterestService {
  // Use subcollection approach: users/{uid}/interested_events/{eventId}
  // This matches the schema expected by our Firebase config helpers

  /**
   * 🎯 DETERMINISTIC EVENT KEY HELPER
   * Ensures save/check/remove all use the exact same key
   */
  private eventKey(e: DisplayableEvent | string): string {
    if (typeof e === 'string') return e;
    
    // Prefer a stable ID; fall back to another stable derivation
    if ((e as any).eventId) return (e as any).eventId;
    if (e.id) return e.id;
    if ((e as any).url) return `url:${(e as any).url}`;
    
    // Last resort: stringify minimal identity
    return `title:${e.title}`;
  }

  // Save user interest in an event
  async saveEventInterest(userId: string, event: DisplayableEvent): Promise<void> {
    try {
      const key = this.eventKey(event);
      console.log('🧪 EventInterestService: Saving interest', { userId, key, title: event.title });
      
      // Use subcollection approach: users/{uid}/interested_events/{eventId}
      const interestRef = doc(db, COLLECTIONS.USERS, userId, 'interested_events', toDocId(key));
      
      const interestData = {
        eventId: key,
        eventTitle: event.title,
        eventInstructor: event.instructor,
        eventLocation: event.location,
        eventSource: event.source,
        eventData: event,
        interested: true,
        interestedAt: serverTimestamp()
      };

      await setDoc(interestRef, interestData);

      console.log('🧪 EventInterestService: Interest saved successfully');
    } catch (error) {
      console.error('🧪 EventInterestService: Error saving interest:', error);
      throw error;
    }
  }

  // Remove user interest in an event
  async removeEventInterest(userId: string, eventIdOrEvent: string | DisplayableEvent): Promise<void> {
    try {
      const key = this.eventKey(eventIdOrEvent);
      console.log('🧪 EventInterestService: Removing interest', { userId, key });
      
      // Use subcollection approach: users/{uid}/interested_events/{eventId}
      const interestRef = doc(db, COLLECTIONS.USERS, userId, 'interested_events', toDocId(key));
      await deleteDoc(interestRef);
      
      console.log('🧪 EventInterestService: Interest removed successfully');
    } catch (error) {
      console.error('🧪 EventInterestService: Error removing interest:', error);
      throw error;
    }
  }

  // Check if user is interested in an event
  async isUserInterested(userId: string, eventIdOrEvent: string | DisplayableEvent): Promise<boolean> {
    try {
      const key = this.eventKey(eventIdOrEvent);
      console.log('🧪 EventInterestService: Checking interest status', { userId, key });
      
      // Use subcollection approach: users/{uid}/interested_events/{eventId}
      const interestRef = doc(db, COLLECTIONS.USERS, userId, 'interested_events', toDocId(key));
      const interestDoc = await getDoc(interestRef);
      
      const isInterested = interestDoc.exists();
      console.log('🧪 EventInterestService: Interest status', { userId, key, isInterested });
      
      return isInterested;
    } catch (error) {
      console.error('🧪 EventInterestService: Error checking interest:', error);
      return false;
    }
  }

  // Get all events user is interested in
  async getUserInterestedEvents(userId: string): Promise<EventInterest[]> {
    try {
      console.log('🧪 EventInterestService: Getting interested events for user:', userId);
      
      // Use subcollection approach: users/{uid}/interested_events
      const interestsQuery = query(
        collection(db, COLLECTIONS.USERS, userId, 'interested_events'),
        orderBy('interestedAt', 'desc')
      );
      
      const snapshot = await getDocs(interestsQuery);
      const interests: EventInterest[] = [];
      
      snapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        interests.push({
          id: docSnapshot.id,
          userId: data.userId,
          eventId: data.eventId,
          eventTitle: data.eventTitle,
          eventInstructor: data.eventInstructor,
          eventLocation: data.eventLocation,
          eventSource: data.eventSource,
          interestedAt: data.interestedAt?.toDate() || new Date(),
          eventData: data.eventData,
          interested: data.interested
        });
      });
      
      console.log('🧪 EventInterestService: Found', interests.length, 'interested events');
      return interests;
    } catch (error) {
      console.error('🧪 EventInterestService: Error getting interested events:', error);
      return [];
    }
  }

  // Get users interested in a specific event
  async getUsersInterestedInEvent(eventId: string): Promise<string[]> {
    try {
      console.log('🧪 EventInterestService: Getting users interested in event:', eventId);
      
      const interestsQuery = query(
        collection(db, COLLECTIONS.EVENT_INTERESTS),
        where('eventId', '==', eventId)
      );
      
      const snapshot = await getDocs(interestsQuery);
      const userIdSet = new Set<string>();
      
      snapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (data.userId) {
          userIdSet.add(data.userId);
        }
      });
      
      const userIds = Array.from(userIdSet);
      console.log('🧪 EventInterestService: Found', userIds.length, 'users interested');
      return userIds;
    } catch (error) {
      console.error('🧪 EventInterestService: Error getting users interested:', error);
      return [];
    }
  }

  // Get recent interests (for notifications, etc.)
  async getRecentInterests(limitCount: number = 10): Promise<EventInterest[]> {
    try {
      console.log('🧪 EventInterestService: Getting recent interests');
      
      const interestsQuery = query(
        collection(db, COLLECTIONS.EVENT_INTERESTS),
        orderBy('interestedAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(interestsQuery);
      const interests: EventInterest[] = [];
      
      snapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        interests.push({
          id: docSnapshot.id,
          userId: data.userId,
          eventId: data.eventId,
          eventTitle: data.eventTitle,
          eventInstructor: data.eventInstructor,
          eventLocation: data.eventLocation,
          eventSource: data.eventSource,
          interestedAt: data.interestedAt?.toDate() || new Date(),
          eventData: data.eventData,
          interested: data.interested
        });
      });
      
      console.log('🧪 EventInterestService: Found', interests.length, 'recent interests');
      return interests;
    } catch (error) {
      console.error('🧪 EventInterestService: Error getting recent interests:', error);
      return [];
    }
  }

  /**
   * 🎯 REAL-TIME SUBSCRIPTION FOR BULLETPROOF UI STATE
   * Subscribe to interest changes to keep UI in sync
   */
  watchUserInterest(
    userId: string,
    eventIdOrEvent: string | DisplayableEvent,
    callback: (isInterested: boolean) => void,
  ): Unsubscribe {
    const key = this.eventKey(eventIdOrEvent);
    const ref = doc(db, COLLECTIONS.USERS, userId, 'interested_events', toDocId(key));
    
    console.log('🧪 EventInterestService: Watching interest', { userId, key });
    
    return onSnapshot(
      ref, 
      (snap) => {
        const isInterested = snap.exists();
        console.log('🧪 EventInterestService: Interest changed', { userId, key, isInterested });
        callback(isInterested);
      }, 
      (err) => {
        console.error('🧪 EventInterestService: watchUserInterest error', err);
        callback(false);
      }
    );
  }
}

export const eventInterestService = new EventInterestService();


