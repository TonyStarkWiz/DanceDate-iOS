import { COLLECTIONS, db } from '@/config/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { eventBasedMatchingService } from './eventBasedMatchingService';
import { eventInterestService } from './eventInterestService';

class MatchingDebugService {
  
  // Debug: Check all event interests in Firestore
  async debugAllEventInterests(): Promise<any[]> {
    try {
      console.log('🧪 MatchingDebugService: Checking all event interests...');
      
      const interestsQuery = query(collection(db, COLLECTIONS.EVENT_INTERESTS));
      const snapshot = await getDocs(interestsQuery);
      
      const interests: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        interests.push({
          id: doc.id,
          userId: data.userId,
          eventId: data.eventId,
          eventTitle: data.eventTitle,
          interestedAt: data.interestedAt?.toDate() || 'No date'
        });
      });
      
      console.log('🧪 MatchingDebugService: Found', interests.length, 'total event interests');
      console.log('🧪 MatchingDebugService: Interests:', interests);
      
      return interests;
    } catch (error) {
      console.error('🧪 MatchingDebugService: Error checking event interests:', error);
      return [];
    }
  }
  
  // Debug: Check specific user's interests
  async debugUserInterests(userId: string): Promise<any[]> {
    try {
      console.log('🧪 MatchingDebugService: Checking interests for user:', userId);
      
      const interests = await eventInterestService.getUserInterestedEvents(userId);
      console.log('🧪 MatchingDebugService: User interests:', interests);
      
      return interests;
    } catch (error) {
      console.error('🧪 MatchingDebugService: Error checking user interests:', error);
      return [];
    }
  }
  
  // Debug: Check users interested in specific event
  async debugEventInterests(eventId: string): Promise<string[]> {
    try {
      console.log('🧪 MatchingDebugService: Checking users interested in event:', eventId);
      
      const userIds = await eventInterestService.getUsersInterestedInEvent(eventId);
      console.log('🧪 MatchingDebugService: Users interested in event:', userIds);
      
      return userIds;
    } catch (error) {
      console.error('🧪 MatchingDebugService: Error checking event interests:', error);
      return [];
    }
  }
  
  // Debug: Test matching for specific user
  async debugUserMatching(userId: string): Promise<any[]> {
    try {
      console.log('🧪 MatchingDebugService: Testing matching for user:', userId);
      
      const matches = await eventBasedMatchingService.findEventBasedMatches(userId, 10);
      console.log('🧪 MatchingDebugService: Found matches:', matches);
      
      return matches;
    } catch (error) {
      console.error('🧪 MatchingDebugService: Error testing matching:', error);
      return [];
    }
  }
  
  // Debug: Check if "I'm interested" button is working
  async debugInterestButton(userId: string, eventId: string): Promise<boolean> {
    try {
      console.log('🧪 MatchingDebugService: Checking interest button for user:', userId, 'event:', eventId);
      
      const isInterested = await eventInterestService.isUserInterested(userId, eventId);
      console.log('🧪 MatchingDebugService: User is interested:', isInterested);
      
      return isInterested;
    } catch (error) {
      console.error('🧪 MatchingDebugService: Error checking interest button:', error);
      return false;
    }
  }
  
  // Debug: Full system test
  async debugFullSystem(userId: string): Promise<any> {
    try {
      console.log('🧪 MatchingDebugService: Running full system debug for user:', userId);
      
      const results = {
        allInterests: await this.debugAllEventInterests(),
        userInterests: await this.debugUserInterests(userId),
        userMatches: await this.debugUserMatching(userId),
        timestamp: new Date().toISOString()
      };
      
      console.log('🧪 MatchingDebugService: Full system debug results:', results);
      return results;
    } catch (error) {
      console.error('🧪 MatchingDebugService: Error in full system debug:', error);
      return { error: error.message };
    }
  }
}

export const matchingDebugService = new MatchingDebugService();


