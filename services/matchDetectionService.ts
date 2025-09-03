import { DisplayableEvent } from './danceEventsApi';
import { EventMatchSuggestion, eventBasedMatchingService } from './eventBasedMatchingService';
import { eventInterestService } from './eventInterestService';

export interface MatchDetectionResult {
  hasMatch: boolean;
  matches: EventMatchSuggestion[];
  newMatches: EventMatchSuggestion[]; // Matches that weren't there before
}

class MatchDetectionService {
  // In-memory cache of last known match IDs per user (consider persisting if you need durability across reloads)
  private lastKnownMatches = new Map<string, Set<string>>(); // userId -> Set of matched user IDs

  // ---- Normalizers / helpers ----------------------------------------------

  // Normalize a suggestion to a stable user ID
  private getMatchId(m: EventMatchSuggestion): string | undefined {
    return (m as any).userId || m?.potentialPartner?.id || (m as any).id;
  }

  // Normalize various "interest" shapes to an eventId string
  private toEventId(x: any): string | undefined {
    return x?.eventId ?? x?.event?.id ?? x?.id ?? x;
  }

  // ---- Public APIs ---------------------------------------------------------

  // Check for new matches when user shows interest in an event
  async checkForMatchesAfterInterest(
    userId: string,
    event: DisplayableEvent
  ): Promise<MatchDetectionResult> {
    try {
      console.log('🧪 MatchDetectionService: Checking for matches after interest:', {
        userId,
        eventTitle: event?.title,
        eventId: (event as any)?.id || (event as any)?.eventId
      });

      // If your finder supports filtering by event, prefer that for fresher context.
      // const currentMatches = await eventBasedMatchingService.findEventBasedMatchesForEvent(userId, (event as any)?.id, 20);

      const currentMatches = await eventBasedMatchingService.findEventBasedMatches(userId, 20);
      console.log('🧪 MatchDetectionService: Found total matches:', currentMatches.length);

      if (currentMatches.length > 0) {
        console.log(
          '🧪 MatchDetectionService: Sample match:',
          JSON.stringify(currentMatches[0], null, 2)
        );
      }

      const prev = this.lastKnownMatches.get(userId) || new Set<string>();
      const currentIds = new Set(
        currentMatches.map((m) => this.getMatchId(m)).filter(Boolean) as string[]
      );

      const newMatches = currentMatches.filter((m) => {
        const id = this.getMatchId(m);
        return id ? !prev.has(id) : false;
      });

      console.log('🧪 MatchDetectionService: Previously known count:', prev.size);
      console.log('🧪 MatchDetectionService: New matches found:', newMatches.length);
      console.log('🧪 MatchDetectionService: Current ID snapshot:', Array.from(currentIds));

      // Update cache
      this.lastKnownMatches.set(userId, currentIds);

      const result: MatchDetectionResult = {
        hasMatch: currentMatches.length > 0,
        matches: currentMatches,
        newMatches
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
      console.log('🧪 MatchDetectionService: Event:', event?.title);

      // Slightly longer delay to reduce eventual-consistency flakiness on write/reads
      await new Promise((resolve) => setTimeout(resolve, 1500));

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

      // Hoist and parallelize queries to avoid N+1 patterns
      const [interestedUsers, currentUserInterests] = await Promise.all([
        eventInterestService.getUsersInterestedInEvent(eventId),
        eventInterestService.getUserInterestedEvents(userId)
      ]);

      // Normalize current user's event IDs once
      const currentIdsSet = new Set(
        (currentUserInterests || [])
          .map((i: any) => this.toEventId(i))
          .filter(Boolean) as string[]
      );

      const otherUsers = (interestedUsers || []).filter((id: string) => id && id !== userId);

      if (otherUsers.length === 0) {
        console.log('🧪 MatchDetectionService: No other interested users.');
        return [];
      }

      const matches: EventMatchSuggestion[] = [];

      await Promise.all(
        otherUsers.map(async (otherUserId: string) => {
          const otherUserInterests = await eventInterestService.getUserInterestedEvents(otherUserId);

          const shared = (otherUserInterests || []).filter((i: any) => {
            const eid = this.toEventId(i);
            return eid ? currentIdsSet.has(eid) : false;
          });

          if (shared.length === 0) return;

          const matchStrength = Math.min(
            100,
            (shared.length / Math.max(currentIdsSet.size, 1)) * 100
          );

          // Profile fetch should not block the match creation if it fails
          const userProfile = await this.getUserProfile(otherUserId).catch((e) => {
            console.warn('🧪 MatchDetectionService: getUserProfile failed for', otherUserId, e);
            return null;
          });

          matches.push({
            userId: otherUserId,
            sharedEvents: shared,
            matchStrength: Math.round(matchStrength),
            commonInterests: this.extractCommonInterests(shared),
            potentialPartner: {
              id: otherUserId,
              name: userProfile?.name || 'Unknown User',
              profile: userProfile
            }
          });
        })
      );

      // Sort by match strength (highest first)
      matches.sort((a, b) => b.matchStrength - a.matchStrength);

      console.log('🧪 MatchDetectionService: Found matches for event:', matches.length);
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

  // ---- Private helpers -----------------------------------------------------

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

    sharedEvents.forEach((event) => {
      if (event?.eventData?.tags && Array.isArray(event.eventData.tags)) {
        event.eventData.tags.forEach((tag: string) => interests.add(tag));
      }
      if (event?.eventData?.danceStyle) {
        interests.add(event.eventData.danceStyle);
      }
    });

    // Limit to 5 interests
    return Array.from(interests).slice(0, 5);
  }
}

export const matchDetectionService = new MatchDetectionService();
