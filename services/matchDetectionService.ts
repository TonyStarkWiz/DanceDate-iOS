import { DisplayableEvent } from './danceEventsApi';
import { EventMatchSuggestion, eventBasedMatchingService } from './eventBasedMatchingService';
import { eventInterestService } from './eventInterestService';

export interface MatchDetectionResult {
  hasMatch: boolean;
  matches: EventMatchSuggestion[];
  newMatches: EventMatchSuggestion[]; // Matches that weren't there before
}

class MatchDetectionService {
  private lastKnownMatches = new Map<string, Set<string>>(); // userId -> Set of matched user IDs

  // Check for new matches when user shows interest in an event
  async checkForMatchesAfterInterest(
    userId: string, 
    event: DisplayableEvent
  ): Promise<MatchDetectionResult> {
    try {
      console.log('🧪 MatchDetectionService: Checking for matches after interest in event:', event.title);
      console.log('🧪 MatchDetectionService: User ID:', userId);
      
      // Get current matches from Firestore
      const currentMatches = await eventBasedMatchingService.findEventBasedMatches(userId, 20);
      console.log('🧪 MatchDetectionService: Found', currentMatches.length, 'total matches in Firestore');
      
      // Get previously known matches for this user
      const previousMatchIds = this.lastKnownMatches.get(userId) || new Set();
      console.log('🧪 MatchDetectionService: Previously known matches:', previousMatchIds.size);
      
      // Find new matches (matches that weren't there before)
      const newMatches = currentMatches.filter(match => 
        !previousMatchIds.has(match.userId)
      );
      
      console.log('🧪 MatchDetectionService: New matches found:', newMatches.length);
      
      // Log details of new matches for debugging
      newMatches.forEach((match, index) => {
        console.log(`🧪 MatchDetectionService: New match ${index + 1}:`, {
          userId: match.userId,
          name: match.potentialPartner.name,
          matchStrength: match.matchStrength,
          sharedEvents: match.sharedEvents.length
        });
      });
      
      // Update the known matches
      const currentMatchIds = new Set(currentMatches.map(match => match.userId));
      this.lastKnownMatches.set(userId, currentMatchIds);
      
      const result: MatchDetectionResult = {
        hasMatch: currentMatches.length > 0,
        matches: currentMatches,
        newMatches: newMatches
      };
      
      console.log('🧪 MatchDetectionService: Final result:', {
        hasMatch: result.hasMatch,
        totalMatches: result.matches.length,
        newMatches: result.newMatches.length
      });
      
      return result;
    } catch (error) {
      console.error('🧪 MatchDetectionService: Error checking for matches:', error);
      return {
        hasMatch: false,
        matches: [],
        newMatches: []
      };
    }
  }

  // Check for matches immediately after saving interest
  async checkForMatchesImmediately(
    userId: string, 
    event: DisplayableEvent
  ): Promise<MatchDetectionResult> {
    try {
      console.log('🧪 MatchDetectionService: Checking for immediate matches for user:', userId);
      console.log('🧪 MatchDetectionService: Event:', event.title);
      
      // Small delay to ensure the interest is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await this.checkForMatchesAfterInterest(userId, event);
      
      console.log('🧪 MatchDetectionService: Immediate check result:', {
        hasMatch: result.hasMatch,
        totalMatches: result.matches.length,
        newMatches: result.newMatches.length
      });
      
      return result;
    } catch (error) {
      console.error('🧪 MatchDetectionService: Error in immediate check:', error);
      return {
        hasMatch: false,
        matches: [],
        newMatches: []
      };
    }
  }

  // Get matches for a specific event
  async getMatchesForEvent(userId: string, eventId: string): Promise<EventMatchSuggestion[]> {
    try {
      console.log('🧪 MatchDetectionService: Getting matches for event:', eventId);
      
      // Get all users interested in this event
      const interestedUsers = await eventInterestService.getUsersInterestedInEvent(eventId);
      
      // Filter out the current user
      const otherUsers = interestedUsers.filter(id => id !== userId);
      
      if (otherUsers.length === 0) {
        return [];
      }
      
      // Get matches for each user
      const matches: EventMatchSuggestion[] = [];
      
      for (const otherUserId of otherUsers) {
        // Check if this user is also interested in events that the current user is interested in
        const otherUserInterests = await eventInterestService.getUserInterestedEvents(otherUserId);
        const currentUserInterests = await eventInterestService.getUserInterestedEvents(userId);
        
        const currentUserEventIds = currentUserInterests.map(interest => interest.eventId);
        const sharedEvents = otherUserInterests.filter(interest => 
          currentUserEventIds.includes(interest.eventId)
        );
        
        if (sharedEvents.length > 0) {
          // Calculate match strength
          const matchStrength = Math.min(100, (sharedEvents.length / Math.max(currentUserEventIds.length, 1)) * 100);
          
          // Get user profile
          const userProfile = await this.getUserProfile(otherUserId);
          
          matches.push({
            userId: otherUserId,
            sharedEvents,
            matchStrength: Math.round(matchStrength),
            commonInterests: this.extractCommonInterests(sharedEvents),
            potentialPartner: {
              id: otherUserId,
              name: userProfile?.name || 'Unknown User',
              profile: userProfile
            }
          });
        }
      }
      
      // Sort by match strength (highest first)
      matches.sort((a, b) => b.matchStrength - a.matchStrength);
      
      console.log('🧪 MatchDetectionService: Found', matches.length, 'matches for event');
      return matches;
    } catch (error) {
      console.error('🧪 MatchDetectionService: Error getting matches for event:', error);
      return [];
    }
  }

  // Clear known matches for a user (useful for testing)
  clearKnownMatches(userId: string): void {
    this.lastKnownMatches.delete(userId);
    console.log('🧪 MatchDetectionService: Cleared known matches for user:', userId);
  }

  // Get user profile (helper method)
  private async getUserProfile(userId: string): Promise<any> {
    try {
      const { firestoreService } = await import('@/config/firebase');
      return await firestoreService.getUser(userId);
    } catch (error) {
      console.error('🧪 MatchDetectionService: Error getting user profile:', error);
      return null;
    }
  }

  // Extract common interests from shared events
  private extractCommonInterests(sharedEvents: any[]): string[] {
    const interests = new Set<string>();
    
    sharedEvents.forEach(event => {
      if (event.eventData?.tags) {
        event.eventData.tags.forEach((tag: string) => interests.add(tag));
      }
      if (event.eventData?.danceStyle) {
        interests.add(event.eventData.danceStyle);
      }
    });
    
    return Array.from(interests).slice(0, 5); // Limit to 5 interests
  }
}

export const matchDetectionService = new MatchDetectionService();
