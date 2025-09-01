import { COLLECTIONS, db } from '@/config/firebase';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
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
}

class EventInterestService {
  private collectionName = COLLECTIONS.EVENT_INTERESTS || 'event_interests';

  // Save user interest in an event
  async saveEventInterest(userId: string, event: DisplayableEvent): Promise<void> {
    try {
      console.log('🧪 EventInterestService: Saving interest for event:', event.title);
      
      const interestId = `${userId}_${event.id}`;
      const interestData: Omit<EventInterest, 'id'> = {
        userId,
        eventId: event.id,
        eventTitle: event.title,
        eventInstructor: event.instructor,
        eventLocation: event.location,
        eventSource: event.source,
        interestedAt: new Date(),
        eventData: event
      };

      await setDoc(doc(db, this.collectionName, interestId), {
        ...interestData,
        interestedAt: serverTimestamp()
      });

      console.log('🧪 EventInterestService: Interest saved successfully');
    } catch (error) {
      console.error('🧪 EventInterestService: Error saving interest:', error);
      throw error;
    }
  }

  // Remove user interest in an event
  async removeEventInterest(userId: string, eventId: string): Promise<void> {
    try {
      console.log('🧪 EventInterestService: Removing interest for event:', eventId);
      
      const interestId = `${userId}_${eventId}`;
      await deleteDoc(doc(db, this.collectionName, interestId));
      
      console.log('🧪 EventInterestService: Interest removed successfully');
    } catch (error) {
      console.error('🧪 EventInterestService: Error removing interest:', error);
      throw error;
    }
  }

  // Check if user is interested in an event
  async isUserInterested(userId: string, eventId: string): Promise<boolean> {
    try {
      console.log('🧪 EventInterestService: Checking if user is interested in event:', eventId);
      
      const interestId = `${userId}_${eventId}`;
      const interestDoc = await getDoc(doc(db, this.collectionName, interestId));
      
      const isInterested = interestDoc.exists();
      console.log('🧪 EventInterestService: User interest status:', isInterested);
      
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
      
      const interestsQuery = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('interestedAt', 'desc')
      );
      
      const snapshot = await getDocs(interestsQuery);
      const interests: EventInterest[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        interests.push({
          id: doc.id,
          userId: data.userId,
          eventId: data.eventId,
          eventTitle: data.eventTitle,
          eventInstructor: data.eventInstructor,
          eventLocation: data.eventLocation,
          eventSource: data.eventSource,
          interestedAt: data.interestedAt?.toDate() || new Date(),
          eventData: data.eventData
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
        collection(db, this.collectionName),
        where('eventId', '==', eventId)
      );
      
      const snapshot = await getDocs(interestsQuery);
      const userIds: string[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId && data.userId !== userIds[userIds.length - 1]) {
          userIds.push(data.userId);
        }
      });
      
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
        collection(db, this.collectionName),
        orderBy('interestedAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(interestsQuery);
      const interests: EventInterest[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        interests.push({
          id: doc.id,
          userId: data.userId,
          eventId: data.eventId,
          eventTitle: data.eventTitle,
          eventInstructor: data.eventInstructor,
          eventLocation: data.eventLocation,
          eventSource: data.eventSource,
          interestedAt: data.interestedAt?.toDate() || new Date(),
          eventData: data.eventData
        });
      });
      
      console.log('🧪 EventInterestService: Found', interests.length, 'recent interests');
      return interests;
    } catch (error) {
      console.error('🧪 EventInterestService: Error getting recent interests:', error);
      return [];
    }
  }
}

export const eventInterestService = new EventInterestService();


