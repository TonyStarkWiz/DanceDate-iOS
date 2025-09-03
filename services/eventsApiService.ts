import { auth } from '@/config/firebase';
import { bilateralMatchingService } from './bilateralMatchingService';

export interface DanceEvent {
  id: number; // API returns id as number
  name: string; // API uses 'name' not 'title'
  description: string;
  location: {
    name: string | null; // API can return null
    city: string;
    country: string;
    address: string | null; // API can return null
    lat?: number;
    lng?: number;
    countryCode?: string;
  };
  venue?: string;
  startDate: string; // API uses 'startDate' not 'start_date'
  endDate: string | null; // API can return null
  dances: Record<string, string>; // API uses 'dances' object, not 'dance_styles' array
  image?: string | null;
  thumbnail?: string | null;
  url?: string | null;
  website_url?: string | null;
  organizer?: string | null;
  price?: string;
  type?: string;
  eventStatus?: string;
  eventAttendanceMode?: string;
  dateOnly?: boolean;
}

export interface EventsApiResponse {
  events: DanceEvent[];
  total: number;
  page: number;
  per_page: number;
}

class EventsApiService {
  private readonly API_BASE_URL = 'https://www.dance-events.info/api/v1';
  private readonly API_TOKEN = '55493fc73a27d20a9ac3402e8b5eff61';

  /**
   * 🎯 FETCH EVENTS FROM DANCE EVENTS API
   */
  async fetchEvents(page: number = 1, perPage: number = 20): Promise<DanceEvent[]> {
    try {
      console.log('🧪 EventsApiService: Fetching events from API');
      
      // Use a reliable CORS proxy
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const apiUrl = `${this.API_BASE_URL}/events.json?token=${this.API_TOKEN}&page=${page}&per_page=${perPage}`;
      const fullUrl = corsProxy + encodeURIComponent(apiUrl);
      
      console.log('🧪 EventsApiService: URL:', fullUrl);
      
      const response = await fetch(fullUrl);

      console.log('🧪 EventsApiService: Response status:', response.status);
      console.log('🧪 EventsApiService: Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: EventsApiResponse = await response.json();
      console.log('🧪 EventsApiService: Raw API data:', JSON.stringify(data, null, 2));
      console.log('🧪 EventsApiService: Fetched', data.events.length, 'events');
      
      return data.events;
    } catch (error) {
      console.error('🧪 ❌ Error fetching events:', error);
      return [];
    }
  }

  /**
   * 🎯 MARK INTEREST IN EVENT
   * Records user interest and checks for bilateral matches
   */
  async markInterestInEvent(event: DanceEvent): Promise<{ success: boolean; matched?: boolean; partnerName?: string }> {
    try {
      console.log('🧪 EventsApiService: Marking interest in event:', event.name);
      
      const matchResult = await bilateralMatchingService.markInterestAndDetectMatch(
        event.id,
        event.name,
        'dance_partner'
      );

      if (matchResult.matched && matchResult.partnerName) {
        console.log('🧪 🎉 Bilateral match found with:', matchResult.partnerName);
        return {
          success: true,
          matched: true,
          partnerName: matchResult.partnerName
        };
      }

      console.log('🧪 ℹ️ No bilateral match found yet');
      return {
        success: true,
        matched: false
      };
    } catch (error) {
      console.error('🧪 ❌ Error marking interest:', error);
      return {
        success: false
      };
    }
  }

  /**
   * 🎯 GET USER'S INTERESTED EVENTS
   * Gets all events the current user has marked interest in
   */
  async getUserInterestedEvents(): Promise<DanceEvent[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('🧪 EventsApiService: No authenticated user');
        return [];
      }

      const userInterests = await bilateralMatchingService.getUserInterests(currentUser.uid);
      
      // For now, return empty array since we need to map interest IDs to full event data
      // This could be enhanced to fetch full event details from the API
      console.log('🧪 EventsApiService: User has', userInterests.length, 'interests');
      return [];
    } catch (error) {
      console.error('🧪 ❌ Error getting user interested events:', error);
      return [];
    }
  }
}

export const eventsApiService = new EventsApiService();
